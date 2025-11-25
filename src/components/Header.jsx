import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import libroLogo from '../assets/libro.png';
import profileImage from '../assets/profile.jpeg';
import { IoHome, IoExtensionPuzzle } from "react-icons/io5";
import { TbVocabulary } from "react-icons/tb";
import { FaUser, FaChevronDown, FaCog } from "react-icons/fa";
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <header className="w-full bg-white backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
          <img 
            src={libroLogo} 
            alt="WordQuest Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300"
          />
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
            Word<span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quest</span>
          </h1>
        </div>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="flex items-center gap-1 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium cursor-pointer relative group">
            <IoHome className="text-xl" />
            <span>Inicio</span>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-blue-600 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
          </Link>
          <Link to="/games" className="flex items-center gap-1 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium cursor-pointer relative group">
            <IoExtensionPuzzle className="text-xl" />
            <span>Retos</span>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-blue-600 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
          </Link>
          <a className="flex items-center gap-1 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium cursor-pointer relative group">
            <TbVocabulary className="text-xl" />
            <span>Vocabulario</span>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-blue-600 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
          </a>
        </nav>

        {/* BUTTONS / USER MENU */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200"
              >
                <img
                  src={profileImage}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-gray-700 font-medium">{userData?.name || 'Usuario'}</span>
                <FaChevronDown className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to="/user-profile"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FaUser className="text-gray-400" />
                    Mi Perfil
                  </Link>
                  {userData?.isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaCog className="text-gray-400" />
                      Administración
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/register" className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 active:scale-95 inline-block text-center">
                Registrarse
              </Link>
              <Link to="/login" className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95 relative overflow-hidden group inline-block text-center">
                <span className="relative z-10">Iniciar sesión</span>
                <div className="absolute inset-0 bg-linear-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU */}
        <div 
          className="md:hidden cursor-pointer p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 active:scale-95"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
          <nav className="px-4 py-4 space-y-2">
            <Link to="/" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium cursor-pointer">
              Inicio
            </Link>
            <Link to="/games" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium cursor-pointer">
              Retos
            </Link>
            <a className="block px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium cursor-pointer">
              Vocabulario
            </a>
            <a className="block px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium cursor-pointer">
              Perfil
            </a>
            <div className="pt-4 space-y-2 border-t border-gray-100">
              {user ? (
                <>
                  <Link to="/user-profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200">
                    <FaUser className="text-gray-400" />
                    Mi Perfil
                  </Link>
                  {userData?.isAdmin && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200">
                      <FaCog className="text-gray-400" />
                      Administración
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 text-left"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 text-center">
                    Registrarse
                  </Link>
                  <Link to="/login" className="block w-full px-4 py-3 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-center">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
