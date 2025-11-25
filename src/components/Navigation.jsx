import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaUser, FaSignOutAlt, FaChartPie } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Navigation() {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  const navItems = [
    { path: '/', icon: FaHome, label: 'Inicio' },
    { path: '/dashboard', icon: FaChartPie, label: 'Dashboard' },
    { path: '/user-profile', icon: FaUser, label: 'Perfil' }
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="text-lg" />
            </Link>
          );
        })}
        
        <button
          onClick={handleLogout}
          className="p-3 rounded-xl text-white/70 hover:text-white hover:bg-red-500/20 transition-all"
          title="Cerrar sesión"
        >
          <FaSignOutAlt className="text-lg" />
        </button>
      </div>
    </motion.nav>
  );
}