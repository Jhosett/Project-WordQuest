import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { FaUser, FaArrowLeft, FaTrophy, FaStar, FaBook, FaGamepad } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import Header from "../../../components/Header";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      // Fetch user basic info
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
      } else {
        // Create a basic user object if no Firestore data exists
        setUser({ 
          id: userId, 
          name: 'Usuario', 
          email: 'No disponible',
          totalPoints: 0,
          isAdmin: false 
        });
      }

      // Fetch user progress (handle if collection doesn't exist)
      try {
        const progressSnap = await getDocs(collection(db, "users", userId, "progress"));
        const progressData = progressSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserProgress(progressData);
      } catch (progressError) {
        console.log('No progress data for user:', userId);
        setUserProgress([]);
      }

      // Fetch user achievements (handle if collection doesn't exist)
      try {
        const achievementsSnap = await getDocs(collection(db, "users", userId, "achievements"));
        const achievementsData = achievementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAchievements(achievementsData);
      } catch (achievementsError) {
        console.log('No achievements data for user:', userId);
        setAchievements([]);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando información del usuario...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Usuario no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/admin/users')}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <FaArrowLeft /> Volver a Usuarios
        </motion.button>

        {/* User Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-3xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{user.name || 'Usuario'}</h1>
              <p className="text-white/70 text-lg mb-2">{user.email}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.isAdmin ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {user.isAdmin ? 'Administrador' : 'Usuario'}
                </span>
                <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                  {user.totalPoints || 0} puntos
                </span>
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  {user.city && user.country ? `${user.city}, ${user.country}` : 'Ubicación no especificada'}
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                  {user.birthdate || 'Fecha no especificada'}
                </span>
              </div>
              <p className="text-white/60 text-sm">
                Registrado: {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Fecha no disponible'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaBook className="text-2xl text-blue-400" />
              <h2 className="text-xl font-bold text-white">Progreso en Libros</h2>
            </div>
            
            {userProgress.length > 0 ? (
              <div className="space-y-4">
                {userProgress.map((progress, index) => (
                  <div key={progress.id} className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Libro: {progress.id}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Capítulo actual:</span>
                        <p className="text-white">{progress.currentChapter || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Último acceso:</span>
                        <p className="text-white">
                          {progress.lastAccess ? new Date(progress.lastAccess.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">No hay progreso registrado</p>
            )}
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaTrophy className="text-2xl text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Logros</h2>
            </div>
            
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={achievement.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FaStar className="text-yellow-400" />
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{achievement.title}</h3>
                        <p className="text-white/60 text-sm">{achievement.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-yellow-300 text-sm font-medium">
                            +{achievement.points} puntos
                          </span>
                          <span className="text-white/50 text-xs">
                            {achievement.unlockedAt ? new Date(achievement.unlockedAt.seconds * 1000).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">No hay logros desbloqueados</p>
            )}
          </motion.div>
        </div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-white/60 text-sm">Nombre completo:</span>
                <p className="text-white font-medium">{user.name || 'No especificado'}</p>
              </div>
              <div>
                <span className="text-white/60 text-sm">Email:</span>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-white/60 text-sm">Fecha de nacimiento:</span>
                <p className="text-white font-medium">{user.birthdate || 'No especificado'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-white/60 text-sm">País:</span>
                <p className="text-white font-medium">{user.country || 'No especificado'}</p>
              </div>
              <div>
                <span className="text-white/60 text-sm">Ciudad:</span>
                <p className="text-white font-medium">{user.city || 'No especificado'}</p>
              </div>
              <div>
                <span className="text-white/60 text-sm">Fecha de registro:</span>
                <p className="text-white font-medium">
                  {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleString() : 'No disponible'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 text-center">Resumen de Estadísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{user.totalPoints || 0}</div>
              <div className="text-white/60 text-sm">Puntos Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{achievements.length}</div>
              <div className="text-white/60 text-sm">Logros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{userProgress.length}</div>
              <div className="text-white/60 text-sm">Libros Iniciados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {user.isAdmin ? 'Admin' : 'Usuario'}
              </div>
              <div className="text-white/60 text-sm">Rol</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}