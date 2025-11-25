import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from "framer-motion";
import { FaArrowLeft, FaPlay, FaLock, FaKeyboard, FaStar, FaCheck } from "react-icons/fa";
import { db, auth } from "../firebase/firebase";
import { progressService } from "../services/progressService";
import Navigation from "../components/Navigation";

export default function ChapterMissions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [missionProgress, setMissionProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const bookId = searchParams.get('bookId');
  const chapterId = searchParams.get('chapterId');

  useEffect(() => {
    if (bookId && chapterId) {
      fetchData();
    }
  }, [bookId, chapterId, user]);

  const fetchData = async () => {
    try {
      // Fetch book
      const bookDoc = await getDoc(doc(db, "books", bookId));
      if (bookDoc.exists()) {
        setBook({ id: bookDoc.id, ...bookDoc.data() });
      }

      // Fetch chapter
      const chapterDoc = await getDoc(doc(db, "books", bookId, "chapters", chapterId));
      if (chapterDoc.exists()) {
        setChapter({ id: chapterDoc.id, ...chapterDoc.data() });
      }

      // Fetch missions
      const missionsSnap = await getDocs(collection(db, "books", bookId, "chapters", chapterId, "missions"));
      const missionsData = missionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMissions(missionsData.sort((a, b) => a.order - b.order));

      // Fetch user progress if logged in
      if (user) {
        const progress = await progressService.getUserProgress(user.uid, bookId);
        if (progress && progress.completedMissions) {
          setCompletedMissions(progress.completedMissions);
        }
        
        // Fetch detailed mission progress for all missions in parallel
        if (missionsData.length > 0) {
          const progressPromises = missionsData.map(mission => 
            progressService.getMissionProgress(user.uid, bookId, chapterId, mission.id)
              .then(progress => ({ missionId: mission.id, progress }))
          );
          
          const progressResults = await Promise.all(progressPromises);
          const progressData = progressResults.reduce((acc, { missionId, progress }) => {
            if (progress) acc[missionId] = progress;
            return acc;
          }, {});
          setMissionProgress(progressData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // TODO: Add user-friendly error state
    }
    setLoading(false);
  };

  const getMissionIcon = (mode) => {
    switch (mode) {
      case 'keywords': return FaKeyboard;
      default: return FaPlay;
    }
  };

  const isMissionUnlocked = (index, missions, completedMissions, missionProgress) => {
    if (index === 0) return true;
    const prevMissionProgress = missionProgress[missions[index - 1].id];
    const prevMissionCompleted = completedMissions.includes(missions[index - 1].id);
    return (prevMissionProgress && prevMissionProgress.score >= 70) ||
           (prevMissionCompleted && !prevMissionProgress);
  };

  const startMission = (mission) => {
    if (mission.mode === 'keywords') {
      navigate(`/keywords-mode?bookId=${bookId}&chapterId=${chapterId}&missionId=${mission.id}`);
    } else if (mission.mode === 'completarFrase') {
      navigate(`/complete-phrase-mode?bookId=${bookId}&chapterId=${chapterId}&missionId=${mission.id}`);
    } else if (mission.mode === 'ordenar-secuencia') {
      navigate(`/order-sequence-mode?bookId=${bookId}&chapterId=${chapterId}&missionId=${mission.id}`);
    } else {
      console.log('Mission mode not implemented:', mission.mode);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando misiones...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/chapter-selection?bookId=${bookId}`)}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <FaArrowLeft /> Volver a Capítulos
        </motion.button>

        {/* Chapter Header */}
        {book && chapter && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              {chapter.title}
            </h1>
            <p className="text-purple-300 mb-4 text-sm sm:text-base">
              {book.title} - Capítulo {chapter.order}
            </p>
            {chapter.description && (
              <p className="text-white/70 max-w-2xl mx-auto">
                {chapter.description}
              </p>
            )}
          </motion.div>
        )}

        {/* Mission Map */}
        <div className="relative">
          {/* Missions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.length === 0 ? (
              <div className="text-center py-12">
                <FaKeyboard className="text-6xl text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">No hay misiones disponibles para este capítulo</p>
              </div>
            ) : (
              missions.map((mission, index) => {
                const IconComponent = getMissionIcon(mission.mode);
                const isEven = index % 2 === 0;
                const isCompleted = completedMissions.includes(mission.id);
                const currentProgress = missionProgress[mission.id];
                const completionScore = currentProgress ? currentProgress.score : 0;
                
                const isUnlocked = isMissionUnlocked(index, missions, completedMissions, missionProgress);
                
                return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                    className="relative group"
                  >
                    <div className={`relative bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 rounded-2xl overflow-hidden transition-all duration-500 ${
                      isCompleted && completionScore >= 70
                        ? 'border-green-400/50 shadow-lg shadow-green-500/20'
                        : isCompleted && completionScore < 70
                        ? 'border-yellow-400/50 shadow-lg shadow-yellow-500/20'
                        : isUnlocked
                        ? 'border-blue-400/50 shadow-lg shadow-blue-500/20 hover:scale-105 cursor-pointer'
                        : 'border-gray-600/30 opacity-60'
                    }`}
                    onClick={() => isUnlocked && startMission(mission)}
                    >
                      {/* Mission Number Badge */}
                      <div className="absolute -top-3 -left-3 z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                          isCompleted && completionScore >= 70
                            ? 'bg-linear-to-r from-green-500 to-emerald-600'
                            : isCompleted && completionScore < 70
                            ? 'bg-linear-to-r from-yellow-500 to-amber-600'
                            : isUnlocked
                            ? 'bg-linear-to-r from-blue-500 to-indigo-600'
                            : 'bg-linear-to-r from-gray-500 to-gray-600'
                        }`}>
                          {isCompleted && completionScore >= 70 ? '✓' : mission.order}
                        </div>
                      </div>

                      {/* Completion Message Overlay */}
                      {isCompleted && (
                        <div className="absolute top-4 right-4 z-20">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                            completionScore >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}>
                            {completionScore >= 70 ? '¡Completado!' : 'Completado'}
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        {/* Mission Icon & Title */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            isUnlocked 
                              ? 'bg-linear-to-r from-purple-500 to-pink-500' 
                              : 'bg-gray-600'
                          }`}>
                            {isUnlocked ? (
                              <IconComponent className="text-white text-xl" />
                            ) : (
                              <FaLock className="text-gray-300 text-xl" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">
                              {mission.title}
                            </h3>
                            <p className="text-purple-300 text-sm capitalize">
                              {mission.mode}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-white/70 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {mission.description}
                        </p>

                        {/* Progress & Stats */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex gap-2">
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-xs font-medium">
                              {mission.difficulty}
                            </span>
                            {mission.data?.correctWords && (
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg text-xs font-medium">
                                {mission.data.correctWords.length} palabras
                              </span>
                            )}
                          </div>
                          
                          {/* Score Display */}
                          {isCompleted && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3].map((star) => (
                                  <FaStar 
                                    key={star}
                                    size={14} 
                                    className={star <= Math.floor(completionScore / 34) ? 'text-yellow-400' : 'text-gray-500'}
                                  />
                                ))}
                              </div>
                              <span className="text-white font-bold text-sm">
                                {completionScore}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => isUnlocked && startMission(mission)}
                          disabled={!isUnlocked}
                          className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                            isCompleted
                              ? 'bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                              : isUnlocked
                              ? 'bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                              : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <FaCheck size={14} /> Completado
                            </>
                          ) : isUnlocked ? (
                            <>
                              <FaPlay size={14} /> Jugar
                            </>
                          ) : (
                            <>
                              <FaLock size={14} /> Bloqueado
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Chapter Completion Badge */}
          {missions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: missions.length * 0.1 + 0.3 }}
              className="flex justify-center mt-8"
            >
              <div className="bg-linear-to-r from-green-500 to-teal-500 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                <FaCheck className="text-white text-xl" />
                <span className="text-white font-bold text-lg">Capítulo Completo</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}