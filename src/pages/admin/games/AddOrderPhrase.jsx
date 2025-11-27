import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSort, FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import Header from "../../../components/Header";
import Swal from "sweetalert2";

export default function AddOrderPhrase() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [missionForm, setMissionForm] = useState({
    title: "Ordena la secuencia de eventos",
    description: "Organiza correctamente los eventos según ocurren en la historia.",
    mode: "ordenar-secuencia",
    difficulty: "Intermedio",
    order: "",
    instruction: "Lee atentamente los eventos y ordénalos según la secuencia en que ocurren en la historia.",
    sequence: [
      { id: "step_1", text: "" },
      { id: "step_2", text: "" }
    ],
    hints: {
      generalHints: [""],
      stepHints: {},
      maxHints: 3
    }
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

  const handleSequenceChange = (index, value) => {
    setMissionForm(prev => ({
      ...prev,
      sequence: prev.sequence.map((step, i) => 
        i === index ? { ...step, text: value } : step
      )
    }));
  };

  const handleHintChange = (type, index, value) => {
    if (type === 'general') {
      setMissionForm(prev => ({
        ...prev,
        hints: {
          ...prev.hints,
          generalHints: prev.hints.generalHints.map((hint, i) => i === index ? value : hint)
        }
      }));
    } else if (type === 'step') {
      setMissionForm(prev => ({
        ...prev,
        hints: {
          ...prev.hints,
          stepHints: { ...prev.hints.stepHints, [index]: value }
        }
      }));
    }
  };

  const addGeneralHint = () => {
    setMissionForm(prev => ({
      ...prev,
      hints: {
        ...prev.hints,
        generalHints: [...prev.hints.generalHints, ""]
      }
    }));
  };

  const removeGeneralHint = (index) => {
    setMissionForm(prev => ({
      ...prev,
      hints: {
        ...prev.hints,
        generalHints: prev.hints.generalHints.filter((_, i) => i !== index)
      }
    }));
  };

  const removeStepHint = (stepId) => {
    setMissionForm(prev => {
      const newStepHints = { ...prev.hints.stepHints };
      delete newStepHints[stepId];
      return {
        ...prev,
        hints: {
          ...prev.hints,
          stepHints: newStepHints
        }
      };
    });
  };

  const addSequenceStep = () => {
    const newStep = {
      id: `step_${missionForm.sequence.length + 1}`,
      text: ""
    };
    setMissionForm(prev => ({
      ...prev,
      sequence: [...prev.sequence, newStep]
    }));
  };

  const removeSequenceStep = (index) => {
    if (missionForm.sequence.length > 2) {
      const newSequence = missionForm.sequence.filter((_, i) => i !== index);
      const reindexedSequence = newSequence.map((step, i) => ({
        ...step,
        id: `step_${i + 1}`
      }));
      setMissionForm(prev => ({ ...prev, sequence: reindexedSequence }));
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

    if (!missionForm.order) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Completa el orden de la misión',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    const invalidSequence = missionForm.sequence.some(step => !step.text.trim());
    if (invalidSequence) {
      Swal.fire({
        icon: 'warning',
        title: 'Secuencia incompleta',
        text: 'Completa todos los eventos de la secuencia',
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
          instruction: missionForm.instruction,
          sequence: missionForm.sequence,
          correctOrder: missionForm.sequence.map(step => step.id),
          hints: {
            generalHints: missionForm.hints.generalHints.filter(hint => hint.trim()),
            stepHints: missionForm.hints.stepHints,
            maxHints: missionForm.hints.maxHints
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(
        collection(db, "books", selectedBook, "chapters", selectedChapter, "missions"),
        missionData
      );

      Swal.fire({
        icon: 'success',
        title: '¡Misión creada!',
        text: 'La misión de ordenar secuencia ha sido agregada exitosamente',
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
      
      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaSort className="text-4xl text-green-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Agregar <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Misión Ordenar Secuencia</span>
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none disabled:opacity-50"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Sequence Events */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-white/80 text-sm font-medium">Secuencia de Eventos</label>
              <button
                type="button"
                onClick={addSequenceStep}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              >
                <FaPlus size={12} /> Agregar Evento
              </button>
            </div>

            <div className="space-y-4">
              {missionForm.sequence.map((step, index) => (
                <div key={step.id} className="flex gap-3 items-start">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-2">
                    {index + 1}
                  </div>
                  <textarea
                    value={step.text}
                    onChange={(e) => handleSequenceChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder={`Evento ${index + 1}...`}
                    rows={3}
                  />
                  {missionForm.sequence.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeSequenceStep(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all mt-2"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hints Section */}
          <div className="mb-8">
            <h3 className="text-white text-lg font-semibold mb-4">Pistas</h3>
            
            {/* Max Hints */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-2">Máximo de pistas</label>
              <input
                type="number"
                value={missionForm.hints.maxHints}
                onChange={(e) => setMissionForm(prev => ({ ...prev, hints: { ...prev.hints, maxHints: parseInt(e.target.value) || 3 } }))}
                min="1"
                max="10"
                className="w-32 px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* General Hints */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-white/80 text-sm font-medium">Pistas Generales</label>
                <button
                  type="button"
                  onClick={addGeneralHint}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                >
                  <FaPlus size={10} /> Agregar
                </button>
              </div>
              {missionForm.hints.generalHints.map((hint, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <textarea
                    value={hint}
                    onChange={(e) => handleHintChange('general', index, e.target.value)}
                    placeholder="Pista general..."
                    rows={2}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeGeneralHint(index)}
                    className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              ))}
            </div>

            {/* Step Hints */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Pistas por Paso</label>
              {missionForm.sequence.map((step, index) => (
                <div key={step.id} className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/60 text-sm">Paso {index + 1}:</span>
                    {missionForm.hints.stepHints[step.id] && (
                      <button
                        type="button"
                        onClick={() => removeStepHint(step.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        <FaTrash size={10} />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={missionForm.hints.stepHints[step.id] || ""}
                    onChange={(e) => handleHintChange('step', step.id, e.target.value)}
                    placeholder={`Pista para el paso ${index + 1}...`}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={createMission}
              disabled={loading}
              className="flex-1 bg-linear-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
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