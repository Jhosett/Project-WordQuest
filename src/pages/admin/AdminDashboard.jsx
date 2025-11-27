import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGamepad, FaBook, FaUsers, FaChartBar, FaCog, FaShieldAlt } from "react-icons/fa";
import Header from "../../components/Header";

export default function AdminDashboard() {
  const adminCards = [
    {
      title: "Modos de Juego",
      description: "Agrega o administra los modos de juego del sistema.",
      icon: FaGamepad,
      link: "/admin/games",
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Aventura Temática",
      description: "Agrega libros, capítulos y niveles del modo de juego.",
      icon: FaBook,
      link: "/admin/books",
      color: "from-green-500 to-teal-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "Usuarios",
      description: "Gestión de usuarios y privilegios del sistema.",
      icon: FaUsers,
      link: "/admin/users",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      title: "Estadísticas",
      description: "Visualiza métricas y reportes del sistema.",
      icon: FaChartBar,
      link: "/admin/stats",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Configuración",
      description: "Ajustes generales y configuración del sistema.",
      icon: FaCog,
      link: "/admin/settings",
      color: "from-gray-500 to-slate-600",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaShieldAlt className="text-4xl text-red-400" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Panel de <span className="bg-linear-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Administración</span>
            </h1>
          </div>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto">
            Gestiona todos los aspectos de WordQuest desde este panel centralizado.
          </p>
        </motion.div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={card.link}
                  className={`group block ${card.bgColor} backdrop-blur-xl border ${card.borderColor} rounded-3xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:bg-white/15`}
                >
                  {/* Icon */}
                  <div className="mb-4">
                    <div className={`w-16 h-16 bg-linear-to-r ${card.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="text-2xl text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all">
                    {card.title}
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                    {card.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center text-white/50 group-hover:text-white/80 transition-colors">
                    <span className="text-sm font-medium">Administrar</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
