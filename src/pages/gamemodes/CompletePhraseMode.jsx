import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { db, auth } from "../../firebase/firebase";
import { progressService } from "../../services/progressService";
import Navigation from "../../components/Navigation";

export default function CompletePhraseMode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [mission, setMission] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressSaved, setProgressSaved] = useState(false);
  
  const bookId = searchParams.get('bookId');
  const chapterId = searchParams.get('chapterId');
  const missionId = searchParams.get('missionId');

  useEffect(() => {
    if (bookId && chapterId && missionId) {
      fetchMission();
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

  const selectAnswer = (espacioId, answer) => {
    if (!showResults) {
      setSelectedAnswers(prev => ({
        ...prev,
        [espacioId]: answer
      }));
    }
  };

  const submitAnswers = async () => {
    setShowResults(true);
    
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

  const getScore = () => {
    const correctAnswers = mission.data.espacios.filter(espacio => 
      selectedAnswers[espacio.id] === espacio.respuestaCorrecta
    ).length;
    return Math.round((correctAnswers / mission.data.espacios.length) * 100);
  };

  const renderTextWithBlanks = () => {
    let text = mission.data.textoBase;
    mission.data.espacios.forEach((espacio, index) => {
      const selectedAnswer = selectedAnswers[espacio.id];
      const isCorrect = showResults && selectedAnswer === espacio.respuestaCorrecta;
      const isIncorrect = showResults && selectedAnswer && selectedAnswer !== espacio.respuestaCorrecta;
      
      const blankClass = showResults 
        ? isCorrect 
          ? 'bg-green-500 text-white' 
          : isIncorrect 
            ? 'bg-red-500 text-white' 
            : 'bg-yellow-500 text-white'
        : selectedAnswer 
          ? 'bg-blue-500 text-white' 
          : 'bg-white/20 text-white border-2 border-dashed border-white/40';

      const replacement = `<span class="inline-block px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${blankClass}" data-espacio="${espacio.id}">
        ${selectedAnswer || '____'}
      </span>`;
      
      text = text.replace('____', replacement);
    });
    
    return text;
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

  const completedBlanks = Object.keys(selectedAnswers).length;
  const totalBlanks = mission.data.espacios.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
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
            <div className="absolute inset-0 bg-linear-to-r from-blue-400/20 to-indigo-400/20 blur-3xl rounded-full"></div>
            <div className="relative flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 bg-linear-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <FaEdit className="text-2xl text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {mission.title}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    {mission.difficulty}
                  </span>
                  <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                    Completar Frases
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed">
            {mission.description}
          </p>
        </motion.div>

        {/* Progress Bar */}
        {!showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">Progreso:</span>
              <span className="text-blue-400 font-bold">{completedBlanks}/{totalBlanks}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div
                className="bg-linear-to-r from-blue-400 to-indigo-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedBlanks / totalBlanks) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Text with Blanks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-blue-500/10 blur-xl rounded-3xl"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-linear-to-r from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📝</span>
              </div>
              <h3 className="text-xl font-bold text-white">Completa el texto:</h3>
            </div>
            
            <div 
              className="text-white/95 leading-relaxed text-lg font-medium tracking-wide"
              dangerouslySetInnerHTML={{ __html: renderTextWithBlanks() }}
              onClick={(e) => {
                const espacioId = e.target.getAttribute('data-espacio');
                if (espacioId && !showResults) {
                  // Show options for this blank
                  const espacio = mission.data.espacios.find(e => e.id === espacioId);
                  if (espacio) {
                    // You could implement a modal or dropdown here
                    // For now, we'll handle it in the options section below
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Options for Current Blank */}
        {!showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6 mb-12"
          >
            {mission.data.espacios.map((espacio, index) => (
              <div key={espacio.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h4 className="text-white font-bold mb-4">Espacio {index + 1}:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {espacio.opciones.map((opcion, opcionIndex) => (
                    <motion.button
                      key={opcionIndex}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectAnswer(espacio.id, opcion)}
                      className={`p-4 rounded-xl font-medium transition-all duration-200 ${
                        selectedAnswers[espacio.id] === opcion
                          ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      }`}
                    >
                      {opcion}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Submit Button */}
        {!showResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <motion.button
              onClick={submitAnswers}
              disabled={completedBlanks < totalBlanks}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto shadow-2xl shadow-blue-500/30"
            >
              <div className="absolute inset-0 bg-linear-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl blur-lg"></div>
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
                <div className="text-6xl font-bold bg-linear-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
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
                        getScore() > i * 33 ? 'text-blue-400' : 'text-gray-500'
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
                Has completado <span className="text-green-400 font-bold">{mission.data.espacios.filter(espacio => selectedAnswers[espacio.id] === espacio.respuestaCorrecta).length}</span> de <span className="text-blue-400 font-bold">{mission.data.espacios.length}</span> espacios correctamente.
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
                    onClick={() => window.location.reload()}
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