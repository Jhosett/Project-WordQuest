import { motion } from "framer-motion";
import { IoBook, IoBookOutline, IoLibrary } from "react-icons/io5";
import { PiCircleFill, PiBookFill, PiGameControllerFill } from "react-icons/pi";

export default function Background({ children }) {
  const items = [
    { icon: IoBook, key: "book1" },
    { icon: IoBookOutline, key: "book2" },
    { icon: IoLibrary, key: "library" },
    { icon: PiCircleFill, key: "circle1" },
    { icon: PiBookFill, key: "book3" },
    { icon: PiGameControllerFill, key: "game" },
  ];

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Fondo base */}
      <div className="absolute inset-0 bg-[#0F172A]"></div>

      {/* Glow mágico */}
      <div className="absolute inset-0 bg-linear-to-br from-[#1E3A8A]/40 via-[#38BDF8]/20 to-transparent blur-3xl opacity-40 pointer-events-none" />

      {/* Elementos flotantes */}
      {items.map((item, i) => {
        const IconComponent = item.icon;
        return (
          <motion.div
            key={item.key}
            className="absolute text-6xl opacity-20 select-none pointer-events-none text-blue-300"
            initial={{ opacity: 0, y: 50, x: 0 }}
            animate={{
              opacity: [0.1, 0.25, 0.1],
              y: [-30, 30, -30],
              x: [0, 15, -15, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              top: `${10 + i * 12}%`,
              left: `${15 + i * 20}%`,
            }}
          >
            <IconComponent />
          </motion.div>
        );
      })}

      {/* Contenido envuelto */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
