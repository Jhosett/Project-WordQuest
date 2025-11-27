import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaSort, FaCheck, FaTimes, FaGripVertical, FaLightbulb, FaTimes as FaClose } from "react-icons/fa";
import { db, auth } from "../../firebase/firebase";
import { progressService } from "../../services/progressService";
import Navigation from "../../components/Navigation";

export default function OrderSequenceMode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [mission, setMission] = useState(null);
  const [userSequence, setUserSequence] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHintsPanel, setShowHintsPanel] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [selectedStep, setSelectedStep] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsLog, setHintsLog] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const bookId = searchParams.get('bookId');
  const chapterId = searchParams.get('chapterId');
  const missionId = searchParams.get('missionId');

  useEffect(() => {
    if (bookId && chapterId && missionId) {
      fetchMission();
    }
  }, [bookId, chapterId, missionId]);

  const fetchMission = async () => {
    try {
      const missionDoc = await getDoc(doc(db, "books", bookId, "chapters", chapterId, "missions", missionId));
      if (missionDoc.exists()) {
        const missionData = { id: missionDoc.id, ...missionDoc.data() };
        setMission(missionData);
        // Shuffle the sequence for the user to order
        const shuffled = [...missionData.data.sequence].sort(() => Math.random() - 0.5);
        setUserSequence(shuffled);
        // Set hints remaining from mission data
        if (missionData.data.hints?.maxHints) {
          setHintsRemaining(missionData.data.hints.maxHints);
        }
      }
    } catch (error) {
      console.error('Error fetching mission:', error);
    }
    setLoading(false);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const draggedIndex = userSequence.findIndex(item => item.id === draggedItem.id);
    const targetIndex = userSequence.findIndex(item => item.id === targetItem.id);

    const newSequence = [...userSequence];
    newSequence.splice(draggedIndex, 1);
    newSequence.splice(targetIndex, 0, draggedItem);

    setUserSequence(newSequence);
    setDraggedItem(null);
  };

  const checkAnswer = () => {
    const correctOrder = mission.data.correctOrder;
    const userOrder = userSequence.map(item => item.id);
    
    let correctCount = 0;
    for (let i = 0; i < correctOrder.length; i++) {
      if (correctOrder[i] === userOrder[i]) {
        correctCount++;
      }
    }
    
    let calculatedScore = Math.round((correctCount / correctOrder.length) * 100);
    // Apply hint penalty (10 points per hint used)
    calculatedScore = Math.max(0, calculatedScore - (hintsUsed * 10));
    
    setScore(calculatedScore);
    setIsCompleted(calculatedScore === 100);
    setShowResult(true);
  };

  const saveProgress = async () => {
    if (!user) return;
    
    try {
      await progressService.saveMissionProgress(
        user.uid,
        bookId,
        chapterId,
        missionId,
        score,
        { 
          userSequence: userSequence.map(item => item.id),
          hintsUsed,
          hintsLog
        }
      );
      
      if (score >= 70) {
        await progressService.updateUserProgress(user.uid, bookId, missionId, score);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleContinue = async () => {
    await saveProgress();
    navigate(`/chapter-missions?bookId=${bookId}&chapterId=${chapterId}`);
  };

  const resetGame = () => {
    const shuffled = [...mission.data.sequence].sort(() => Math.random() - 0.5);
    setUserSequence(shuffled);
    setShowResult(false);
    setIsCompleted(false);
    setScore(0);
    setHintsUsed(0);
    setHintsLog([]);
    setHintsRemaining(mission.data.hints?.maxHints || 3);
    setSelectedStep(null);
  };

  const useGeneralHint = () => {
    if (hintsRemaining <= 0 || !mission.data.hints?.generalHints?.length) return;
    
    const availableHints = mission.data.hints.generalHints.filter(
      hint => !hintsLog.some(log => log.hint === hint)
    );
    
    if (availableHints.length === 0) return;
    
    const randomHint = availableHints[Math.floor(Math.random() * availableHints.length)];
    
    setHintsUsed(prev => prev + 1);
    setHintsRemaining(prev => prev - 1);
    setHintsLog(prev => [...prev, { type: 'general', hint: randomHint, timestamp: new Date() }]);
    
    showHintToast(randomHint);
    setShowHintsPanel(false);
  };

  const useStepHint = (stepId) => {
    if (hintsRemaining <= 0 || !mission.data.hints?.stepHints?.[stepId]) return;
    
    const hint = mission.data.hints.stepHints[stepId];
    
    setHintsUsed(prev => prev + 1);
    setHintsRemaining(prev => prev - 1);
    setHintsLog(prev => [...prev, { type: 'step', stepId, hint, timestamp: new Date() }]);
    
    showHintToast(hint);
    setShowHintsPanel(false);
  };

  const showHintToast = (hint) => {
    setToastMessage(hint);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando misión...</div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Misión no encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(`/chapter-missions?bookId=${bookId}&chapterId=${chapterId}`)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <FaArrowLeft /> Volver a Misiones
          </motion.button>
          
          {!showResult && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowHintsPanel(true)}
              disabled={hintsRemaining <= 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                hintsRemaining > 0 
                  ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30'
                  : 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30'
              }`}
            >
              <FaLightbulb /> {hintsRemaining > 0 ? `Pistas (${hintsRemaining})` : 'Sin pistas'}
            </motion.button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaSort className="text-4xl text-green-400" />
            <h1 className="text-3xl font-bold text-white">
              {mission.title}
            </h1>
          </div>
          <p className="text-white/70">{mission.description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl"
        >
          <div className="mb-6">
            <p className="text-white/70 text-center mb-8">{mission.data?.instruction}</p>
            
            {!showResult ? (
              <>
                {/* Drag and Drop Interface */}
                <div className="space-y-3 mb-8">
                  {userSequence.map((step, index) => (
                    <motion.div
                      key={step.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, step)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, step)}
                      onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                      className={`border rounded-xl p-4 cursor-move hover:bg-white/10 transition-all duration-200 flex items-center gap-4 ${
                        selectedStep === step.id 
                          ? 'bg-blue-500/20 border-blue-500/50' 
                          : 'bg-white/5 border-white/20'
                      }`}
                    >
                      <div className="text-green-400">
                        <FaGripVertical />
                      </div>
                      <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-white flex-1 text-left">{step.text}</p>
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={resetGame}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all"
                  >
                    Reiniciar
                  </button>
                  <button
                    onClick={checkAnswer}
                    className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-3 px-8 rounded-xl font-semibold transition-all"
                  >
                    Confirmar Orden
                  </button>
                </div>
              </>
            ) : (
              /* Results */
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-linear-to-r from-green-500/20 to-teal-500/20 blur-2xl rounded-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-linear-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  >
                    <FaCheck className="text-3xl text-white" />
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-white mb-6"
                  >
                    ¡Misión Completada!
                  </motion.h3>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="relative mb-6"
                  >
                    <div className="text-6xl font-bold bg-linear-to-r from-green-400 to-teal-500 bg-clip-text text-transparent mb-2">
                      {score}%
                    </div>
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: score > i * 33 ? 1 : 0.3, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className={`text-2xl ${
                            score > i * 33 ? 'text-green-400' : 'text-gray-500'
                          }`}
                        >
                          ⭐
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-white/80 text-lg mb-4 leading-relaxed"
                  >
                    Has ordenado <span className="text-green-400 font-bold">{Math.round((score / 100) * mission.data.sequence.length)}</span> de <span className="text-green-400 font-bold">{mission.data.sequence.length}</span> eventos correctamente.
                  </motion.p>
                  
                  {/* Unlock Status Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className={`p-4 rounded-2xl mb-6 ${
                      score >= 70 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-yellow-500/20 border border-yellow-500/30'
                    }`}
                  >
                    <p className={`text-center font-medium ${
                      score >= 70 ? 'text-green-300' : 'text-yellow-300'
                    }`}>
                      {score >= 70 
                        ? '🎉 ¡Excelente! Has desbloqueado la siguiente misión.' 
                        : '⚠️ Necesitas al menos 70% para desbloquear la siguiente misión. ¡Inténtalo de nuevo!'
                      }
                    </p>
                  </motion.div>
                  
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      className="bg-linear-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-green-500/30"
                    >
                      Continuar Aventura
                    </motion.button>
                    
                    {score < 70 && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetGame}
                        className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-yellow-500/30"
                      >
                        Intentar de Nuevo
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Hints Panel */}
      <AnimatePresence>
        {showHintsPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHintsPanel(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-md w-full max-h-96 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Pistas Disponibles</h3>
                <button
                  onClick={() => setShowHintsPanel(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <FaClose />
                </button>
              </div>

              {/* General Hints */}
              <div className="mb-6">
                <h4 className="text-white/80 font-medium mb-3">Pistas Generales</h4>
                <button
                  onClick={useGeneralHint}
                  disabled={hintsRemaining <= 0 || !mission.data.hints?.generalHints?.length}
                  className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 disabled:bg-gray-500/20 disabled:text-gray-400 text-yellow-300 py-3 px-4 rounded-xl transition-all border border-yellow-500/30 disabled:border-gray-500/30"
                >
                  Obtener pista general (-10 pts)
                </button>
              </div>

              {/* Step Hints */}
              <div>
                <h4 className="text-white/80 font-medium mb-3">Pistas por Paso</h4>
                {selectedStep ? (
                  <div className="space-y-2">
                    <p className="text-white/60 text-sm mb-2">
                      Paso seleccionado: {userSequence.findIndex(s => s.id === selectedStep) + 1}
                    </p>
                    <button
                      onClick={() => useStepHint(selectedStep)}
                      disabled={hintsRemaining <= 0 || !mission.data.hints?.stepHints?.[selectedStep]}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 disabled:text-gray-400 text-blue-300 py-3 px-4 rounded-xl transition-all border border-blue-500/30 disabled:border-gray-500/30"
                    >
                      Obtener pista para este paso (-10 pts)
                    </button>
                  </div>
                ) : (
                  <p className="text-white/60 text-sm text-center py-4">
                    Selecciona un paso de la secuencia para obtener una pista específica
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 transform bg-yellow-500/90 backdrop-blur-xl text-white px-6 py-4 rounded-xl shadow-2xl z-50 max-w-md"
          >
            <div className="flex items-start gap-3">
              <FaLightbulb className="text-yellow-200 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">Pista mostrada — -10 pts</p>
                <p className="text-yellow-100 text-sm">{toastMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}