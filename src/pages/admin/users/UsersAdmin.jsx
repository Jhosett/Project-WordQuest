import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from "framer-motion";
import { FaUser, FaArrowLeft, FaEye, FaExclamationTriangle } from "react-icons/fa";
import { db, auth } from "../../../firebase/firebase";
import Header from "../../../components/Header";

export default function UsersAdmin() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().isAdmin) {
        setIsAdmin(true);
        fetchUsers();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users as admin...');
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        totalPoints: doc.data().totalPoints || 0
      }));
      
      setUsers(usersData);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.code === 'permission-denied') {
        setError('Permisos insuficientes. Asegúrate de que tienes permisos de administrador y que las reglas de Firestore estén actualizadas.');
      } else {
        setError('Error al cargar usuarios: ' + error.message);
      }
      setUsers([]);
    }
    setLoading(false);
  };

  const viewUserDetail = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando usuarios...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-red-400 mx-auto mb-4" />
          <div className="text-white text-xl">Debes iniciar sesión para acceder</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-red-400 mx-auto mb-4" />
          <div className="text-white text-xl">No tienes permisos de administrador</div>
          <p className="text-white/60 mt-2">Contacta al administrador para obtener acceso</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/admin')}
            className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <FaArrowLeft /> Volver al Dashboard
          </motion.button>
          
          <div className="text-center py-12">
            <FaExclamationTriangle className="text-6xl text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Error de Permisos</h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
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
          onClick={() => navigate('/admin')}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <FaArrowLeft /> Volver al Dashboard
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
          <p className="text-white/70">Administra los usuarios registrados en el sistema</p>
        </motion.div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => viewUserDetail(user.id)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{user.name || 'Usuario'}</h3>
                  <p className="text-white/60 text-sm">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Puntos:</span>
                  <span className="text-white font-medium">{user.totalPoints || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Rol:</span>
                  <span className="text-white font-medium">{user.isAdmin ? 'Admin' : 'Usuario'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Ubicación:</span>
                  <span className="text-white font-medium">{user.city && user.country ? `${user.city}, ${user.country}` : 'No especificado'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Registro:</span>
                  <span className="text-white font-medium">
                    {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'No disponible'}
                  </span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
                <FaEye size={14} /> Ver Detalles
              </button>
            </motion.div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <FaUser className="text-6xl text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No hay usuarios registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}