// src/pages/Register.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaRocket, FaCheck, FaStar } from "react-icons/fa";
import { registerUser } from "../services/authService";
import Swal from "sweetalert2";

const PASSWORD_PATTERN = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const MIN_AGE = 13;
const MAX_AGE = 120;

export default function Register() {
  const navigate = useNavigate();
  
  // State management
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    country: "",
    city: "",
  });

  // Helper functions
  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  // Validation functions
  const checkStepValid = (stepNum) => {
    try {
      if (stepNum === 0) {
        return form.name?.trim().length >= 2 && 
               /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.name || '') &&
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '') &&
               (form.password?.length || 0) >= 8 &&
               PASSWORD_PATTERN.test(form.password || '') &&
               form.password === form.confirmPassword;
      }
      
      if (stepNum === 1) {
        if (!form.birthdate) return false;
        const birthDate = new Date(form.birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= MIN_AGE && age <= MAX_AGE &&
               (form.country?.trim().length || 0) > 0 &&
               /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.country || '') &&
               (form.city?.trim().length || 0) > 0 &&
               /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.city || '');
      }
      
      return false;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    
    if (stepNum === 0) {
      // Name validation
      if (!form.name.trim()) {
        newErrors.name = "El nombre es requerido";
      } else if (form.name.trim().length < 2) {
        newErrors.name = "El nombre debe tener al menos 2 caracteres";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.name)) {
        newErrors.name = "El nombre solo puede contener letras";
      }
      
      // Email validation
      if (!form.email.trim()) {
        newErrors.email = "El email es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Ingresa un email válido";
      }
      
      // Password validation
      if (!form.password) {
        newErrors.password = "La contraseña es requerida";
      } else if (form.password.length < 8) {
        newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      } else if (!PASSWORD_PATTERN.test(form.password)) {
        newErrors.password = "Debe contener mayúscula, minúscula y número";
      }
      
      // Confirm password validation
      if (!form.confirmPassword) {
        newErrors.confirmPassword = "Confirma tu contraseña";
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    
    if (stepNum === 1) {
      // Birthdate validation
      if (!form.birthdate) {
        newErrors.birthdate = "La fecha de nacimiento es requerida";
      } else {
        const birthDate = new Date(form.birthdate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < MIN_AGE) {
          newErrors.birthdate = `Debes tener al menos ${MIN_AGE} años`;
        } else if (age > MAX_AGE) {
          newErrors.birthdate = "Ingresa una fecha válida";
        }
      }
      
      // Country validation
      if (!form.country.trim()) {
        newErrors.country = "El país es requerido";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.country)) {
        newErrors.country = "El país solo puede contener letras";
      }
      
      // City validation
      if (!form.city.trim()) {
        newErrors.city = "La ciudad es requerida";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.city)) {
        newErrors.city = "La ciudad solo puede contener letras";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(2, s + 1));
    }
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleRegister = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor corrige los errores antes de continuar',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = await registerUser(form);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada exitosamente!',
          text: 'Bienvenido a WordQuest',
          confirmButtonColor: '#8B5CF6'
        }).then(() => {
          navigate('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear cuenta',
          text: result.error,
          confirmButtonColor: '#8B5CF6'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#8B5CF6'
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg mx-auto px-4 sm:px-0"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <FaRocket className="text-lg sm:text-2xl text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Únete a WordQuest
            </h1>
            <p className="text-white/70">
              Comienza tu aventura de aprendizaje
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Paso {step + 1} de 3</span>
              <span>{Math.round(((step + 1) / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="bg-linear-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                initial={{ width: "33%" }}
                animate={{ width: `${((step + 1) / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex justify-center space-x-2 sm:space-x-4 mb-8">
            {["Cuenta", "Personal", "Confirmar"].map((label, i) => {
              const isCompleted = i === 0 ? checkStepValid(0) : i === 1 ? checkStepValid(0) && checkStepValid(1) : false;
              const isAccessible = i === 0 || (i === 1 && checkStepValid(0)) || (i === 2 && checkStepValid(0) && checkStepValid(1));
              
              return (
                <motion.button
                  key={i}
                  onClick={() => isAccessible && setStep(i)}
                  whileHover={isAccessible ? { scale: 1.05 } : {}}
                  whileTap={isAccessible ? { scale: 0.95 } : {}}
                  disabled={!isAccessible}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    step === i
                      ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : isCompleted
                      ? "bg-green-500/20 text-green-300 border border-green-500/30 cursor-pointer"
                      : isAccessible
                      ? "bg-white/10 text-white/70 border border-white/20 cursor-pointer hover:bg-white/20"
                      : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed opacity-50"
                  }`}
                >
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs ${
                    step === i
                      ? "bg-white/20"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-white/10"
                  }`}>
                    {isCompleted ? <FaCheck className="text-xs" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Form content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 1: Account */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-white/80 text-sm font-medium">Nombre completo</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Tu nombre completo"
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.name ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-purple-500"
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-white/80 text-sm font-medium">Correo electrónico</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="tu@email.com"
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.email ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-purple-500"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-white/80 text-sm font-medium">Contraseña</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.password ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-purple-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-white/80 text-sm font-medium">Confirmar contraseña</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      placeholder="Repite tu contraseña"
                      className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-purple-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-white/80 text-sm font-medium" aria-label="Fecha de nacimiento">Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => updateField("birthdate", e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.birthdate ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-purple-500"
                    }`}
                  />
                  {errors.birthdate && <p className="text-red-400 text-xs mt-1">{errors.birthdate}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white/80 text-sm font-medium" aria-label="País">País</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      placeholder="Colombia"
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.country ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-purple-500"
                      }`}
                    />
                    {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/80 text-sm font-medium">Ciudad</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Bogotá"
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.city ? "border-red-500 focus:ring-red-500"
                        : "border-white/10 focus:ring-purple-500"
                      }`}
                    />
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaStar className="text-lg sm:text-2xl text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                    ¡Casi listo!
                  </h2>
                  <p className="text-white/60 text-sm">
                    Revisa tu información antes de continuar
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/60">Nombre</span>
                    <span className="text-white font-medium">{form.name || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/60">Email</span>
                    <span className="text-white font-medium">{form.email || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/60">Fecha de nacimiento</span>
                    <span className="text-white font-medium">{form.birthdate || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/60">Ubicación</span>
                    <span className="text-white font-medium">
                      {form.city && form.country ? `${form.city}, ${form.country}` : "No especificado"}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                >
                  <FaRocket className="mr-2" /> {loading ? "Creando cuenta..." : "Crear mi cuenta"}
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Navigation buttons */}
          {step < 2 && (
            <div className="flex flex-col sm:flex-row justify-between mt-8 space-y-4 sm:space-y-0">
              {step > 0 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={back}
                  className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 border border-white/10"
                  aria-label="Atrás"
                >
                  ← Atrás
                </motion.button>
              ) : (
                <div></div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={next}
                className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
                aria-label="Siguiente"
              >
                Siguiente →
              </motion.button>
            </div>
          )}

          {/* Login link */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors" aria-label="Inicia sesión">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}