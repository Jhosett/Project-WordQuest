import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaGamepad, FaKeyboard, FaCog, FaPlus, FaEdit, FaSort } from "react-icons/fa";
import Header from "../../components/Header";

export default function GamesAdmin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaGamepad className="text-4xl text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Administrar <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Juegos</span>
            </h1>
          </div>
          <p className="text-white/70 text-base sm:text-lg">
            Gestiona los diferentes modos de juego disponibles
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Keywords Game Mode Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {/* Header with Icon */}
            <div className="bg-linear-to-r from-yellow-500 to-orange-500 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaKeyboard className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Palabras Clave</h3>
              <p className="text-white/80 text-sm mt-1">Keywords Game</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Los usuarios leen un extracto del capítulo y luego identifican palabras clave de opciones múltiples. Cada acierto ilumina la interfaz con retroalimentación positiva, mientras que los errores ofrecen pistas sutiles para el aprendizaje.
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                  Vocabulario
                </span>
                <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
                  Escritura
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                  Categorías
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/admin/games/edit-keywords')}
                  className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaCog size={14} /> Editar Misiones
                </button>
                <button 
                  onClick={() => navigate('/admin/games/add-keyword')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaPlus size={14} /> Agregar Contenido
                </button>
              </div>
            </div>
          </motion.div>

          {/* Complete the Sentence Game Mode Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {/* Header with Icon */}
            <div className="bg-linear-to-r from-blue-500 to-indigo-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaEdit className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Completar Oración</h3>
              <p className="text-white/80 text-sm mt-1">Complete the Sentence</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Los usuarios completan fragmentos con espacios en blanco seleccionando las opciones correctas. Cada selección proporciona retroalimentación inmediata y una barra de progreso mantiene la motivación durante la actividad.
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                  Comprensión
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full text-xs">
                  Gramática
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                  Contexto
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button className="w-full bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                  <FaCog size={14} /> Configurar
                </button>
                <button 
                  onClick={() => navigate('/admin/games/add-sentence')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaPlus size={14} /> Agregar Contenido
                </button>
              </div>
            </div>
          </motion.div>

          {/* Order the Sequence Game Mode Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {/* Header with Icon */}
            <div className="bg-linear-to-r from-green-500 to-teal-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaSort className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Ordenar Secuencia</h3>
              <p className="text-white/80 text-sm mt-1">Order the Sequence</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Los usuarios reciben fragmentos desordenados del libro y deben arrastrar y organizar cada elemento hasta reconstruir la secuencia correcta de la historia con retroalimentación visual suave.
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                  Secuencia
                </span>
                <span className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded-full text-xs">
                  Narrativa
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                  Drag & Drop
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button className="w-full bg-linear-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                  <FaCog size={14} /> Configurar
                </button>
                <button 
                  onClick={() => navigate('/admin/games/add-sequence')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaPlus size={14} /> Agregar Contenido
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}