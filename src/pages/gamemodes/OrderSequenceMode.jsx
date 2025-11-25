import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaSort, FaCheck, FaTimes, FaGripVertical } from "react-icons/fa";
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
    
    const calculatedScore = Math.round((correctCount / correctOrder.length) * 100);
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
        { userSequence: userSequence.map(item => item.id) }
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
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/chapter-missions?bookId=${bookId}&chapterId=${chapterId}`)}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <FaArrowLeft /> Volver a Misiones
        </motion.button>

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
                      className="bg-white/5 border border-white/20 rounded-xl p-4 cursor-move hover:bg-white/10 transition-all duration-200 flex items-center gap-4"
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
    </div>
  );
}