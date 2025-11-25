import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { IoBook, IoBookOutline, IoLibrary } from "react-icons/io5";
import { Link } from "react-router-dom";
import {
  PiCircleFill,
  PiBookFill,
  PiPencilFill,
  PiGraduationCapFill,
  PiLightbulbFill,
  PiStarFill,
} from "react-icons/pi";

export default function Banner() {
  const floatingIcons = [
    { icon: IoBook, key: "book1", top: 10, left: 5 },
    { icon: IoBookOutline, key: "book2", top: 70, left: 15 },
    { icon: IoLibrary, key: "library", top: 25, left: 85 },
    { icon: PiCircleFill, key: "circle", top: 80, left: 75 },
    { icon: PiBookFill, key: "bookFill", top: 45, left: 10 },
    { icon: PiPencilFill, key: "pencil", top: 15, left: 90 },
    { icon: PiGraduationCapFill, key: "graduation", top: 35, left: 95 },
    { icon: PiLightbulbFill, key: "lightbulb", top: 85, left: 5 },
    { icon: PiStarFill, key: "star1", top: 20, left: 25 },
    { icon: PiStarFill, key: "star2", top: 60, left: 90 },
    { icon: PiCircleFill, key: "circle2", top: 5, left: 70 },
    { text: "A", key: "letterA", top: 30, left: 3 },
    { text: "B", key: "letterB", top: 75, left: 95 },
    { text: "Q", key: "letterQ", top: 50, left: 2 },
    { text: "W", key: "letterW", top: 12, left: 78 },
    { text: "E", key: "letterE", top: 65, left: 50 },
    { text: "R", key: "letterR", top: 40, left: 70 },
    { text: "T", key: "letterT", top: 85, left: 40 },
    { text: "Y", key: "letterY", top: 18, left: 45 },
  ];

  return (
    <section className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0F172A] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 shadow-2xl border border-white/10">
      {/* Glow mágico */}
      <div className="absolute inset-0 bg-linear-to-r from-[#1E3A8A]/40 via-[#38BDF8]/30 to-transparent blur-3xl opacity-40 pointer-events-none"></div>

      {/* Floating Icons */}
      {floatingIcons.map((item, i) => {
        return (
          <motion.div
            key={item.key}
            className="absolute text-4xl sm:text-5xl opacity-10 select-none pointer-events-none text-blue-300 font-bold"
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
              y: [-20, 20, -20],
              x: [0, 10, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 8 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              top: `${item.top}%`,
              left: `${item.left}%`,
            }}
          >
            {item.icon ? <item.icon /> : item.text}
          </motion.div>
        );
      })}

      {/* Contenido */}
      <div className="relative max-w-5xl mx-auto text-center">
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-xl"
        >
          Embárcate en la Aventura del Conocimiento con{" "}
          <span className="bg-linear-to-r from-[#38BDF8] to-[#1E3A8A] bg-clip-text text-transparent">
            WordQuest
          </span>
        </motion.h1>

        {/* Descripción */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2"
        >
          Fortalece tu vocabulario, comprensión lectora y habilidades de
          escritura mientras avanzas por mundos temáticos llenos de retos y
          recompensas.
        </motion.p>

        {/* Botón */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-8 sm:mt-10"
        >
          <Link to="/games" className="group inline-flex items-center gap-2 bg-[#FACC15] text-[#0F172A] font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-yellow-300/20 hover:shadow-yellow-300/40 transition-all duration-300">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
            Comenzar tu aventura
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
