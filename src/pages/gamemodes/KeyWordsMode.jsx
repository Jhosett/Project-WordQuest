import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from "framer-motion";
import { FaArrowLeft, FaKeyboard, FaCheck, FaTimes } from "react-icons/fa";
import { db, auth } from "../../firebase/firebase";
import { progressService } from "../../services/progressService";
import Navigation from "../../components/Navigation";

export default function KeyWordsMode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [mission, setMission] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressSaved, setProgressSaved] = useState(false);
  
  const bookId = searchParams.get('bookId');
  const chapterId = searchParams.get('chapterId');
  const missionId = searchParams.get('missionId');

  useEffect(() => {
    if (bookId && chapterId && missionId) {
      fetchMission();
      // Update current progress when mission starts
      if (user) {
        progressService.updateCurrentProgress(user.uid, bookId, chapterId, missionId);
      }
    }
  }, [bookId, chapterId, missionId, user]);

  const fetchMission = async () => {
    try {
      const missionDoc = await getDoc(doc(db, "books", bookId, "chapters", chapterId, "missions", missionId));
      if (missionDoc.exists()) {
        setMission({ id: missionDoc.id, ...missionDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching mission:', error);
    }
    setLoading(false);
  };

  const toggleWord = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const submitAnswers = async () => {
    setShowResults(true);
    
    // Save progress if user is logged in
    if (user && !progressSaved) {
      const score = getScore();
      await progressService.saveMissionProgress(
        user.uid, 
        bookId, 
        chapterId, 
        missionId, 
        score, 
        mission.mode
      );
      setProgressSaved(true);
    }
  };

  const getWordStatus = (word) => {
    if (!showResults) return 'default';
    if (mission.data.correctWords.includes(word)) {
      return selectedWords.includes(word) ? 'correct' : 'missed';
    } else {
      return selectedWords.includes(word) ? 'incorrect' : 'default';
    }
  };

  const getScore = () => {
    const correctSelected = selectedWords.filter(word => mission.data.correctWords.includes(word)).length;
    const totalCorrect = mission.data.correctWords.length;
    return Math.round((correctSelected / totalCorrect) * 100);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Misión no encontrada</div>
      </div>
    );
  }

  const allWords = [...mission.data.correctWords, ...mission.data.distractors].sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/chapter-missions?bookId=${bookId}&chapterId=${chapterId}`)}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <FaArrowLeft /> Volver a Misiones
        </motion.button>

        {/* Mission Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-linear-to-r from-yellow-400/20 to-orange-400/20 blur-3xl rounded-full"></div>
            <div className="relative flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 bg-linear-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <FaKeyboard className="text-2xl text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {mission.title}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                    {mission.difficulty}
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                    Palabras Clave
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed">
            {mission.description}
          </p>
        </motion.div>

        {/* Text Fragment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 blur-xl rounded-3xl"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-linear-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📖</span>
              </div>
              <h3 className="text-xl font-bold text-white">Lee el siguiente fragmento:</h3>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-linear-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 shadow-inner"
            >
              {mission.data.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={mission.data.imageUrl} 
                    alt="Imagen de la misión"
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg border border-white/20"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              <div className="text-white/95 leading-relaxed text-lg font-medium tracking-wide whitespace-pre-line">
                {mission.data.text}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Word Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-linear-to-r from-green-500/10 to-teal-500/10 blur-xl rounded-3xl"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-linear-to-r from-green-400 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Selecciona las palabras clave del texto:
              </h3>
            </div>
            
            {/* Progress Indicator */}
            {!showResults && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Palabras seleccionadas:</span>
                  <span className="text-yellow-400 font-bold">{selectedWords.length}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="blinear-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((selectedWords.length / mission.data.correctWords.length) * 100, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allWords.map((word, index) => {
                const status = getWordStatus(word);
                const isSelected = selectedWords.includes(word);
                
                return (
                  <motion.button
                    key={word}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05, type: "spring", stiffness: 100 }}
                    whileHover={!showResults ? { scale: 1.05, y: -2 } : {}}
                    whileTap={!showResults ? { scale: 0.95 } : {}}
                    onClick={() => !showResults && toggleWord(word)}
                    disabled={showResults}
                    className={`relative p-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                      status === 'correct' ? 'bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30' :
                      status === 'incorrect' ? 'bg-linear-to-r from-red-500 to-rose-600 text-white shadow-red-500/30' :
                      status === 'missed' ? 'bg-linear-to-r from-yellow-400 to-amber-500 text-white border-2 border-yellow-300 shadow-yellow-500/30' :
                      isSelected ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/30' :
                      'bg-linear-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/15 border border-white/20 hover:border-white/30'
                    } ${!showResults ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {/* Glow effect for selected words */}
                    {isSelected && !showResults && (
                      <div className="absolute inset-0 bg-linear-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl blur-lg"></div>
                    )}
                    
                    <span className="relative flex items-center justify-center gap-2 text-sm sm:text-base">
                      {word}
                      {showResults && status === 'correct' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          <FaCheck size={14} className="text-white" />
                        </motion.div>
                      )}
                      {showResults && status === 'incorrect' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          <FaTimes size={14} className="text-white" />
                        </motion.div>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {!showResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <motion.button
              onClick={submitAnswers}
              disabled={selectedWords.length === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto shadow-2xl shadow-yellow-500/30"
            >
              <div className="absolute inset-0 bg-linear-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-lg"></div>
              <span className="relative flex items-center gap-3">
                <FaCheck className="text-xl" /> Verificar Respuestas
              </span>
            </motion.button>
          </motion.div>
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
                <div className="text-6xl font-bold bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                  {getScore()}%
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: getScore() > i * 33 ? 1 : 0.3, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={`text-2xl ${
                        getScore() > i * 33 ? 'text-yellow-400' : 'text-gray-500'
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
                Has identificado <span className="text-green-400 font-bold">{selectedWords.filter(word => mission.data.correctWords.includes(word)).length}</span> de <span className="text-yellow-400 font-bold">{mission.data.correctWords.length}</span> palabras clave correctamente.
              </motion.p>
              
              {/* Unlock Status Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`p-4 rounded-2xl mb-6 ${
                  getScore() >= 70 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-yellow-500/20 border border-yellow-500/30'
                }`}
              >
                <p className={`text-center font-medium ${
                  getScore() >= 70 ? 'text-green-300' : 'text-yellow-300'
                }`}>
                  {getScore() >= 70 
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
                  onClick={() => navigate(`/chapter-missions?bookId=${bookId}&chapterId=${chapterId}`)}
                  className="bg-linear-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-green-500/30"
                >
                  Continuar Aventura
                </motion.button>
                
                {getScore() < 70 && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedWords([]);
                      setShowResults(false);
                      setProgressSaved(false);
                    }}
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
    </div>
  );
}