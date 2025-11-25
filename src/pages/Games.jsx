import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthState } from 'react-firebase-hooks/auth';
import { BookOpen, Clock, Sparkles, Star, Zap, Book, Sword, Trophy, Target, Users, Timer } from "lucide-react";
import { auth } from '../firebase/firebase';
import Navigation from '../components/Navigation';
import Swal from 'sweetalert2';

const Games = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const goToAdventure = () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión requerida',
        text: 'Debes iniciar sesión para acceder a los modos de juego',
        confirmButtonText: 'Ir a Login',
        confirmButtonColor: '#8B5CF6',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    navigate("/adventure-shelf");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Navigation />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Modos de <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Juego</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Explora diferentes experiencias de aprendizaje. Más aventuras están en camino.
          </p>
        </motion.div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Adventure Mode Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={goToAdventure}
            className="group cursor-pointer bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:bg-white/15"
          >
            {/* Icon with glow effect */}
            <div className="relative mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={32} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles size={20} className="text-yellow-400 animate-pulse" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-3">
              Aventura Temática
            </h2>
            
            <p className="text-white/70 text-center text-sm sm:text-base mb-6 leading-relaxed">
              Sumérgete en historias interactivas. Completa capítulos, supera misiones y vive la narrativa mientras aprendes.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Book size={12} /> Historia
              </span>
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Sword size={12} /> Misiones
              </span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Trophy size={12} /> Recompensas
              </span>
            </div>

            <button className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg">
              <Zap size={18} className="group-hover:animate-bounce" />
              ¡Jugar Ahora!
            </button>
          </motion.div>

          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            {/* Icon */}
            <div className="relative mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-r from-gray-600 to-gray-500 rounded-2xl flex items-center justify-center mx-auto">
                <Clock size={32} className="text-gray-300" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Star size={12} className="text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-300 text-center mb-3">
              Más Aventuras
            </h2>
            
            <p className="text-gray-400 text-center text-sm sm:text-base mb-6 leading-relaxed">
              Estamos creando nuevos y emocionantes modos de juego. ¡Mantente atento para más diversión!
            </p>

            {/* Coming Soon Features */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="bg-gray-600/20 text-gray-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Target size={12} /> Desafíos
              </span>
              <span className="bg-gray-600/20 text-gray-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Users size={12} /> Multijugador
              </span>
              <span className="bg-gray-600/20 text-gray-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Timer size={12} /> Tiempo Real
              </span>
            </div>

            <button
              disabled
              className="w-full py-3 rounded-xl bg-gray-600/50 cursor-not-allowed text-gray-300 font-semibold flex items-center justify-center gap-2"
            >
              <Clock size={18} />
              Próximamente...
            </button>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-white/60 text-sm">
            ¿Tienes ideas para nuevos modos de juego? 
            <span className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">
              ¡Compártelas con nosotros!
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Games;
