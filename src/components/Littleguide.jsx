import { motion } from "framer-motion";
import { FaUserPlus, FaMapMarkedAlt, FaMedal, FaRocket } from "react-icons/fa";

export default function LittleGuide() {
  const steps = [
    {
      number: "01",
      icon: FaUserPlus,
      title: "Crea tu Héroe",
      description: "Regístrate y personaliza tu avatar de aprendizaje.",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "02",
      icon: FaMapMarkedAlt,
      title: "Elige tu Camino",
      description: "Selecciona misiones según tu nivel e intereses.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "03",
      icon: FaMedal,
      title: "Completa Retos",
      description: "Domina vocabulario, lectura y escritura con actividades dinámicas.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      number: "04",
      icon: FaRocket,
      title: "Sube de Nivel",
      description: "Gana XP, desbloquea recompensas y escala en el ranking.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="relative w-full py-20 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Tu aventura de aprendizaje comienza en 4 simples pasos.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 via-blue-500 via-yellow-500 to-green-500 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Glassmorphism Card */}
                  <div className="relative h-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500">
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-linear-to-br ${step.color} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-500`}></div>
                    
                    {/* Step Number */}
                    <motion.div 
                      className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-linear-to-br ${step.color} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Animated Icon */}
                    <motion.div
                      className="flex justify-center mt-6 mb-6"
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.2
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <IconComponent className="text-5xl text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="font-bold text-xl text-white mb-3 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-center leading-relaxed">
                      {step.description}
                    </p>

                    {/* Bottom accent */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${step.color} rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
