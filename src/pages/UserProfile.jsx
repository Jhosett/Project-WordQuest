import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaGlobe, 
  FaEdit, FaSave, FaTimes, FaTrophy, FaBook, FaClock, FaStar,
  FaChartLine, FaFire, FaBullseye, FaGem
} from 'react-icons/fa';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { progressService } from '../services/progressService';
import Navigation from '../components/Navigation';
import profileImage from '../assets/profile.jpeg';
import Swal from 'sweetalert2';

export default function UserProfile() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    achievements: [],
    completedMissions: 0,
    averageScore: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setEditForm(data);
            
            // Fetch dynamic stats
            const totalPoints = await progressService.getUserPoints(user.uid);
            const achievements = await progressService.getUserAchievements(user.uid);
            
            setUserStats({
              totalPoints,
              achievements,
              completedMissions: achievements.length, // Placeholder calculation
              averageScore: 85 // Placeholder - could calculate from mission data
            });
          } else {
            console.warn('No user document found');
            const basicUserData = {
              name: user.displayName || user.email?.split('@')[0] || 'Usuario',
              email: user.email,
              createdAt: new Date(),
              uid: user.uid,
              totalPoints: 0
            };
            await setDoc(doc(db, 'users', user.uid), basicUserData);
            setUserData(basicUserData);
            setEditForm(basicUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información del usuario',
            confirmButtonColor: '#8B5CF6'
          });
        }
      }
      setLoadingData(false);
    };

    fetchUserData();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(userData);
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: editForm.name,
        country: editForm.country,
        city: editForm.city
      });
      setUserData({ ...userData, ...editForm });
      setIsEditing(false);
      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tus cambios han sido guardados exitosamente',
        confirmButtonColor: '#8B5CF6'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el perfil',
        confirmButtonColor: '#8B5CF6'
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(userData);
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return 'No especificado';
    const today = new Date();
    const birth = new Date(birthdate);
    const age = today.getFullYear() - birth.getFullYear();
    return `${age} años`;
  };

  const formatDate = (date) => {
    if (!date) return 'No especificado';
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando perfil...</div>
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

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Mi Perfil</h1>
          <p className="text-white/70 text-sm sm:text-base">Gestiona tu información y revisa tu progreso</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
              {/* Profile Picture */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 overflow-hidden border-4 border-purple-500">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {userData?.name || 'Usuario'}
                </h2>
                <p className="text-white/60 text-sm sm:text-base">Nivel {Math.floor(userStats.totalPoints / 1000) + 1}</p>
              </div>

              {/* User Info */}
              <div className="space-y-3 sm:space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-white/80 text-sm">Nombre</label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/80 text-sm">País</label>
                      <input
                        type="text"
                        value={editForm.country || ''}
                        onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                        className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/80 text-sm">Ciudad</label>
                      <input
                        type="text"
                        value={editForm.city || ''}
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                      >
                        <FaSave className="mr-2" /> Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                      >
                        <FaTimes className="mr-2" /> Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                      <FaEnvelope className="text-purple-400 text-sm sm:text-base" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-xs sm:text-sm">Email</p>
                        <p className="text-white text-sm sm:text-base truncate">{userData?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                      <FaCalendarAlt className="text-purple-400 text-sm sm:text-base" />
                      <div>
                        <p className="text-white/60 text-xs sm:text-sm">Edad</p>
                        <p className="text-white text-sm sm:text-base">{calculateAge(userData?.birthdate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                      <FaMapMarkerAlt className="text-purple-400 text-sm sm:text-base" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-xs sm:text-sm">Ubicación</p>
                        <p className="text-white text-sm sm:text-base truncate">
                          {userData?.city && userData?.country 
                            ? `${userData.city}, ${userData.country}` 
                            : 'No especificado'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                      <FaGlobe className="text-purple-400 text-sm sm:text-base" />
                      <div>
                        <p className="text-white/60 text-xs sm:text-sm">Miembro desde</p>
                        <p className="text-white text-sm sm:text-base">{formatDate(userData?.createdAt)}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleEdit}
                      className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all"
                    >
                      <FaEdit className="mr-2" /> Editar Perfil
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats and Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                  <FaGem className="text-xl sm:text-2xl text-purple-400 mx-auto mb-2" />
                  <p className="text-lg sm:text-2xl font-bold text-white">{userStats.totalPoints}</p>
                  <p className="text-white/60 text-xs sm:text-sm">Puntos</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
                  <FaTrophy className="text-2xl text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{userStats.achievements.length}</p>
                  <p className="text-white/60 text-sm">Logros</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
                  <FaBook className="text-2xl text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{userStats.completedMissions}</p>
                  <p className="text-white/60 text-sm">Misiones</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
                  <FaBullseye className="text-2xl text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{userStats.averageScore}%</p>
                  <p className="text-white/60 text-sm">Precisión</p>
                </div>
              </div>
            </motion.div>

            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Progreso de Aprendizaje</h3>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80">Precisión</span>
                    <span className="text-white font-bold">{userStats.averageScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-linear-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${userStats.averageScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80">Nivel actual</span>
                    <span className="text-white font-bold">{Math.floor(userStats.totalPoints / 1000) + 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span className="text-white/60">Basado en puntos obtenidos</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Logros Recientes</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {userStats.achievements.length > 0 ? (
                  userStats.achievements.slice(0, 3).map((achievement, index) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-linear-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <FaTrophy className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{achievement.title}</p>
                        <p className="text-white/60 text-sm">{achievement.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <FaTrophy className="text-4xl text-white/20 mx-auto mb-2" />
                    <p className="text-white/60">¡Completa misiones para desbloquear logros!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Activity Chart Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Actividad Semanal</h3>
              <div className="flex items-center justify-center h-32 bg-white/5 rounded-lg">
                <div className="text-center">
                  <FaChartLine className="text-4xl text-purple-400 mx-auto mb-2" />
                  <p className="text-white/60">Gráfico de actividad próximamente</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}