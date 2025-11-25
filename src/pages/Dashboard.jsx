import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBook, FaTrophy, FaFire, FaGem, FaPlay, FaChartLine, 
  FaStar, FaBullseye, FaClock, FaCalendarAlt
} from 'react-icons/fa';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { progressService } from '../services/progressService';
import Navigation from '../components/Navigation';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [learningData, setLearningData] = useState({
    totalPoints: 0,
    level: 1,
    nextLevelXP: 1000,
    achievements: [],
    completedMissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
          
          // Fetch dynamic progress data
          const totalPoints = await progressService.getUserPoints(user.uid);
          const achievements = await progressService.getUserAchievements(user.uid);
          const level = Math.floor(totalPoints / 1000) + 1;
          const nextLevelXP = level * 1000;
          
          setLearningData({
            totalPoints,
            level,
            nextLevelXP,
            achievements,
            completedMissions: achievements.length
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Por favor inicia sesión</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Navigation />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto pt-16 sm:pt-20 px-4">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            ¡Hola, {userData?.name?.split(' ')[0] || 'Usuario'}! 👋
          </h1>
          <p className="text-white/70 text-base sm:text-lg">Continúa tu aventura de aprendizaje</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <FaGem className="text-2xl sm:text-3xl text-purple-400 mx-auto mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-white">{learningData.totalPoints}</p>
            <p className="text-white/60 text-xs sm:text-sm">Puntos</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
            <FaTrophy className="text-3xl text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{learningData.achievements.length}</p>
            <p className="text-white/60 text-sm">Logros</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
            <FaBook className="text-3xl text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{learningData.completedMissions}</p>
            <p className="text-white/60 text-sm">Misiones</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
            <FaStar className="text-3xl text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{learningData.level}</p>
            <p className="text-white/60 text-sm">Nivel</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Today's Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Progreso de Hoy</h2>
              
              {/* Points Progress */}
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm sm:text-base">Puntos totales</span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    {learningData.totalPoints} puntos
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4">
                  <div 
                    className="bg-linear-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((learningData.totalPoints / 5000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-white/60 text-xs sm:text-sm mt-2">
                  ¡Sigue completando misiones para ganar más puntos!
                </p>
              </div>

              {/* Level Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm sm:text-base">Nivel {learningData.level}</span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    {learningData.totalPoints}/{learningData.nextLevelXP} puntos
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-linear-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((learningData.totalPoints % 1000) / 1000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Logros Recientes</h2>
              <div className="space-y-2 sm:space-y-3">
                {learningData.achievements.length > 0 ? (
                  learningData.achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-yellow-500">
                          <FaTrophy className="text-white text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm sm:text-base truncate">{achievement.title}</p>
                          <p className="text-white/60 text-xs sm:text-sm">{achievement.description}</p>
                        </div>
                      </div>
                      <div className="text-yellow-400 font-bold text-sm">+{achievement.points}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <FaTrophy className="text-4xl text-white/20 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">¡Completa misiones para desbloquear logros!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >

            {/* Achievements */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Logros</h3>
              <div className="space-y-2 sm:space-y-3">
                {learningData.achievements.length > 0 ? (
                  learningData.achievements.slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-500">
                        <FaTrophy className="text-sm text-white" />
                      </div>
                      <span className="text-sm text-white">{achievement.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2">
                    <p className="text-white/60 text-sm">¡Aún no tienes logros!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Level Status */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Tu Nivel</h3>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaStar className="text-xl sm:text-2xl text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{learningData.level}</p>
                <p className="text-white/60 text-xs sm:text-sm">nivel actual</p>
                <p className="text-white/40 text-xs mt-1">{1000 - (learningData.totalPoints % 1000)} puntos para subir</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}