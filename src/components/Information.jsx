import { FaBookOpen, FaFeatherAlt, FaTrophy, FaBolt, FaUsers } from "react-icons/fa";
import { GiQuillInk } from "react-icons/gi";
import { PiClockCountdownFill } from "react-icons/pi";

export default function Information() {
  const features = [
    {
      title: "Misiones de Vocabulario",
      description: "Explora nuevas palabras a través de historias interactivas y desafíos atractivos que hacen que el aprendizaje perdure.",
      icon: <FaBookOpen className="text-4xl" />,
      gradient: "from-blue-500 to-blue-600",
      accentBg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Aventuras de Lectura",
      description: "Desbloquea superpoderes de comprensión con pasajes adaptativos diseñados para tu nivel.",
      icon: <GiQuillInk className="text-4xl" />,
      gradient: "from-cyan-500 to-blue-500",
      accentBg: "bg-cyan-50 dark:bg-cyan-950",
    },
    {
      title: "Misiones de Escritura",
      description: "Construye confianza con indicaciones guiadas, retroalimentación instantánea y expresión creativa.",
      icon: <FaFeatherAlt className="text-4xl" />,
      gradient: "from-purple-500 to-pink-500",
      accentBg: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Sistema de Logros",
      description: "Gana insignias, desbloquea nuevo contenido y rastrea tu progreso en la tabla de clasificación.",
      icon: <FaTrophy className="text-4xl" />,
      gradient: "from-amber-500 to-orange-500",
      accentBg: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Desafíos Diarios",
      description: "Mantén tus habilidades afiladas con desafíos frescos entregados cada día.",
      icon: <FaBolt className="text-4xl" />,
      gradient: "from-yellow-500 to-amber-500",
      accentBg: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Modo Contrareloj",
      description: "Ejercicios de vocabulario y comprensión con límite de tiempo.",
      icon: <PiClockCountdownFill className="text-4xl" />,
      gradient: "from-rose-500 to-red-500",
      accentBg: "bg-rose-50 dark:bg-rose-950",
    },
  ];

  return (
    <section className="w-full py-20 px-4 sm:px-6 md:px-12 lg:px-20 bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 text-balance">
          Por qué WordQuest?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Convierte el aprendizaje en una aventura con experiencia gamificada para motivar a los
          estudiantes y fomentar la creatividad.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative h-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${feature.gradient} rounded-full -translate-y-16 translate-x-16 opacity-10 group-hover:scale-125 transition-transform duration-500`}></div>

            <div className={`relative m-6 w-20 h-20 rounded-2xl ${feature.accentBg} flex items-center justify-center bg-linear-to-br ${feature.gradient} text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              {feature.icon}
            </div>

            <div className="relative px-6 pb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                {feature.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                {feature.description}
              </p>
            </div>

            <div className={`absolute bottom-0 left-0 w-full h-1 bg-linear-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
          </div>
        ))}
      </div>
    </section>
  );
}
