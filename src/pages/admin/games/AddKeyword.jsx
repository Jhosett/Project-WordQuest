import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaKeyboard, FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import Header from "../../../components/Header";
import Swal from "sweetalert2";

export default function AddKeyword() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [missionForm, setMissionForm] = useState({
    title: "Identifica las palabras clave en el fragmento",
    description: "Selecciona las palabras que representan las ideas esenciales del texto leído",
    mode: "keywords",
    difficulty: "Intermedio",
    order: "",
    text: "",
    correctWords: [""],
    distractors: [""]
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

  const handleArrayChange = (field, index, value) => {
    setMissionForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setMissionForm(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayItem = (field, index) => {
    setMissionForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
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

    if (!missionForm.text.trim() || !missionForm.order) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Completa el texto y orden de la misión',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    const filteredCorrectWords = missionForm.correctWords.filter(word => word.trim());
    const filteredDistractors = missionForm.distractors.filter(word => word.trim());

    if (filteredCorrectWords.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Palabras requeridas',
        text: 'Debes agregar al menos una palabra correcta',
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
          text: missionForm.text,
          correctWords: filteredCorrectWords,
          distractors: filteredDistractors
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Creating mission with data:', missionData);
      console.log('Path:', `books/${selectedBook}/chapters/${selectedChapter}/missions`);

      await addDoc(collection(db, "books", selectedBook, "chapters", selectedChapter, "missions"), missionData);

      Swal.fire({
        icon: 'success',
        title: '¡Misión creada!',
        text: 'La misión de palabras clave ha sido agregada exitosamente',
        confirmButtonColor: '#8B5CF6'
      });

      navigate('/admin/games');
    } catch (error) {
      console.error('Error creating mission:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo crear la misión: ${error.message}`,
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

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaKeyboard className="text-4xl text-yellow-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Agregar <span className="bg-linear-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Misión Keywords</span>
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Book Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Libro *</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all appearance-none"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all appearance-none disabled:opacity-50"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all appearance-none"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Text */}
            <div className="md:col-span-2">
              <label className="block text-white/80 text-sm font-medium mb-2">Texto del fragmento *</label>
              <textarea
                value={missionForm.text}
                onChange={(e) => handleInputChange('text', e.target.value)}
                placeholder="Escribe el fragmento de texto aquí..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Correct Words */}
            <div className="md:col-span-2">
              <label className="block text-white/80 text-sm font-medium mb-2">Palabras Correctas</label>
              {missionForm.correctWords.map((word, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => handleArrayChange('correctWords', index, e.target.value)}
                    placeholder="Palabra clave"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={() => removeArrayItem('correctWords', index)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('correctWords')}
                className="w-full py-2 border-2 border-dashed border-green-500/50 text-green-400 rounded-xl hover:border-green-500 hover:bg-green-500/10 transition-all flex items-center justify-center gap-2"
              >
                <FaPlus size={12} /> Agregar palabra correcta
              </button>
            </div>

            {/* Distractors */}
            <div className="md:col-span-2">
              <label className="block text-white/80 text-sm font-medium mb-2">Distractores</label>
              {missionForm.distractors.map((word, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => handleArrayChange('distractors', index, e.target.value)}
                    placeholder="Palabra distractor"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={() => removeArrayItem('distractors', index)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('distractors')}
                className="w-full py-2 border-2 border-dashed border-red-500/50 text-red-400 rounded-xl hover:border-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                <FaPlus size={12} /> Agregar distractor
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={createMission}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
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