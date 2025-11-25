import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import Header from "../../../components/Header";
import Swal from "sweetalert2";

export default function AddSentence() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [missionForm, setMissionForm] = useState({
    title: "Completa las frases del fragmento",
    description: "Selecciona la palabra o frase que completa correctamente cada parte del texto.",
    mode: "completarFrase",
    difficulty: "Intermedio",
    order: "",
    textoBase: "",
    espacios: [
      {
        id: "s1",
        opciones: ["", "", ""],
        respuestaCorrecta: ""
      }
    ]
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      fetchChapters(selectedBook);
    }
  }, [selectedBook]);

  const fetchBooks = async () => {
    try {
      const snap = await getDocs(collection(db, "books"));
      setBooks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchChapters = async (bookId) => {
    try {
      const snap = await getDocs(collection(db, "books", bookId, "chapters"));
      setChapters(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setMissionForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEspacioChange = (index, field, value) => {
    setMissionForm(prev => ({
      ...prev,
      espacios: prev.espacios.map((espacio, i) => 
        i === index ? { ...espacio, [field]: value } : espacio
      )
    }));
  };

  const handleOpcionChange = (espacioIndex, opcionIndex, value) => {
    setMissionForm(prev => ({
      ...prev,
      espacios: prev.espacios.map((espacio, i) => 
        i === espacioIndex 
          ? { 
              ...espacio, 
              opciones: espacio.opciones.map((opcion, j) => 
                j === opcionIndex ? value : opcion
              )
            }
          : espacio
      )
    }));
  };

  const addEspacio = () => {
    const newId = `s${missionForm.espacios.length + 1}`;
    setMissionForm(prev => ({
      ...prev,
      espacios: [...prev.espacios, {
        id: newId,
        opciones: ["", "", ""],
        respuestaCorrecta: ""
      }]
    }));
  };

  const removeEspacio = (index) => {
    if (missionForm.espacios.length > 1) {
      setMissionForm(prev => ({
        ...prev,
        espacios: prev.espacios.filter((_, i) => i !== index)
      }));
    }
  };

  const createMission = async () => {
    if (!selectedBook || !selectedChapter) {
      Swal.fire({
        icon: 'warning',
        title: 'Selección requerida',
        text: 'Debes seleccionar un libro y capítulo',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    if (!missionForm.textoBase.trim() || !missionForm.order) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Completa el texto base y orden de la misión',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    // Validate espacios
    const invalidEspacios = missionForm.espacios.some(espacio => 
      !espacio.respuestaCorrecta.trim() || 
      espacio.opciones.some(opcion => !opcion.trim())
    );

    if (invalidEspacios) {
      Swal.fire({
        icon: 'warning',
        title: 'Espacios incompletos',
        text: 'Completa todas las opciones y respuestas correctas',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    setLoading(true);
    try {
      const missionData = {
        title: missionForm.title,
        description: missionForm.description,
        mode: missionForm.mode,
        difficulty: missionForm.difficulty,
        order: parseInt(missionForm.order),
        data: {
          textoBase: missionForm.textoBase,
          espacios: missionForm.espacios
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, "books", selectedBook, "chapters", selectedChapter, "missions"), missionData);

      Swal.fire({
        icon: 'success',
        title: '¡Misión creada!',
        text: 'La misión de completar frases ha sido agregada exitosamente',
        confirmButtonColor: '#8B5CF6'
      });

      navigate('/admin/games');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la misión',
        confirmButtonColor: '#8B5CF6'
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaEdit className="text-4xl text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Agregar <span className="bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Misión Completar Frases</span>
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Book Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Libro *</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="" className="bg-slate-800">Selecciona un libro...</option>
                {books.map(book => (
                  <option key={book.id} value={book.id} className="bg-slate-800">{book.title}</option>
                ))}
              </select>
            </div>

            {/* Chapter Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Capítulo *</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                disabled={!selectedBook}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-slate-800">Selecciona un capítulo...</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id} className="bg-slate-800">{chapter.title}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Dificultad</label>
              <select
                value={missionForm.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="Principiante" className="bg-slate-800">Principiante</option>
                <option value="Intermedio" className="bg-slate-800">Intermedio</option>
                <option value="Avanzado" className="bg-slate-800">Avanzado</option>
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Orden *</label>
              <input
                type="number"
                value={missionForm.order}
                onChange={(e) => handleInputChange('order', e.target.value)}
                placeholder="1"
                min="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Base Text */}
          <div className="mb-8">
            <label className="block text-white/80 text-sm font-medium mb-2">Texto Base *</label>
            <textarea
              value={missionForm.textoBase}
              onChange={(e) => handleInputChange('textoBase', e.target.value)}
              placeholder="Escribe el texto con ____ donde van los espacios en blanco..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Espacios */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Espacios en Blanco</h3>
              <button
                onClick={addEspacio}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              >
                <FaPlus size={12} /> Agregar Espacio
              </button>
            </div>

            {missionForm.espacios.map((espacio, index) => (
              <div key={espacio.id} className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">Espacio {index + 1} ({espacio.id})</h4>
                  {missionForm.espacios.length > 1 && (
                    <button
                      onClick={() => removeEspacio(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {espacio.opciones.map((opcion, opcionIndex) => (
                    <div key={opcionIndex}>
                      <label className="block text-white/70 text-xs mb-1">Opción {opcionIndex + 1}</label>
                      <input
                        type="text"
                        value={opcion}
                        onChange={(e) => handleOpcionChange(index, opcionIndex, e.target.value)}
                        placeholder={`Opción ${opcionIndex + 1}`}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="block text-white/70 text-xs mb-1">Respuesta Correcta</label>
                  <select
                    value={espacio.respuestaCorrecta}
                    onChange={(e) => handleEspacioChange(index, 'respuestaCorrecta', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none text-sm"
                  >
                    <option value="" className="bg-slate-800">Selecciona la respuesta correcta...</option>
                    {espacio.opciones.filter(opcion => opcion.trim()).map((opcion, i) => (
                      <option key={i} value={opcion} className="bg-slate-800">{opcion}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={createMission}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {loading ? 'Guardando...' : 'Crear Misión'}
            </button>
            <button
              onClick={() => navigate('/admin/games')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaTimes /> Cancelar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}