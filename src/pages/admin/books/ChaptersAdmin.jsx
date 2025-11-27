import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { FaBook, FaPlus, FaFileAlt, FaSave, FaTimes } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import Header from "../../../components/Header";
import Swal from "sweetalert2";

export default function ChaptersAdmin() {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState({
    title: "",
    content: "",
    order: "",
    description: ""
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchBooks();
    const bookId = searchParams.get('bookId');
    if (bookId) {
      setSelectedBook(bookId);
    }
  }, [searchParams]);

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
    setChapterForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setChapterForm({
      title: "",
      content: "",
      order: "",
      description: ""
    });
    setShowForm(false);
  };

  const createChapter = async () => {
    if (!selectedBook) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un libro',
        text: 'Debes seleccionar un libro primero',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    if (!chapterForm.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Título requerido',
        text: 'Por favor ingresa el título del capítulo',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "books", selectedBook, "chapters"), {
        title: chapterForm.title,
        content: chapterForm.content,
        order: parseInt(chapterForm.order) || 1,
        description: chapterForm.description,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: '¡Capítulo creado!',
        text: 'El capítulo ha sido agregado exitosamente',
        confirmButtonColor: '#8B5CF6'
      });

      resetForm();
      fetchChapters(selectedBook);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el capítulo',
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

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaFileAlt className="text-4xl text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Administrar <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Capítulos</span>
            </h1>
          </div>
          <p className="text-white/70 text-base sm:text-lg">
            Gestiona los capítulos de cada libro
          </p>
        </motion.div>

        {/* Book Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
        >
          <label className="block text-white/80 text-sm font-medium mb-3">Seleccionar Libro</label>
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-800 text-white">Selecciona un libro...</option>
            {books.map(book => (
              <option key={book.id} value={book.id} className="bg-slate-800 text-white">
                {book.title} - {book.author}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Add Chapter Button */}
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <FaPlus /> {showForm ? 'Cancelar' : 'Agregar Nuevo Capítulo'}
            </button>
          </motion.div>
        )}

        {/* Chapter Form */}
        {showForm && selectedBook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaFileAlt className="text-blue-400" /> Nuevo Capítulo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Título *</label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Título del capítulo"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Orden</label>
                <input
                  type="number"
                  value={chapterForm.order}
                  onChange={(e) => handleInputChange('order', e.target.value)}
                  placeholder="Ej: 1"
                  min="1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-white/80 text-sm font-medium mb-2">Descripción</label>
                <input
                  type="text"
                  value={chapterForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Breve descripción del capítulo"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-white/80 text-sm font-medium mb-2">Contenido</label>
                <textarea
                  value={chapterForm.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Contenido del capítulo..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={createChapter}
                disabled={loading}
                className="flex-1 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaSave /> {loading ? 'Guardando...' : 'Guardar Capítulo'}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaTimes /> Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {/* Chapters List */}
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Capítulos ({chapters.length})</h2>
            
            {chapters.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                <FaFileAlt className="text-4xl text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No hay capítulos registrados para este libro</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.sort((a, b) => a.order - b.order).map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedChapter(chapter)}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:bg-white/15"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                        Cap. {chapter.order}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{chapter.title}</h3>
                    {chapter.description && (
                      <p className="text-white/70 text-sm mb-3">{chapter.description}</p>
                    )}
                    
                    {chapter.content && (
                      <div className="bg-white/5 rounded-lg p-3 mb-4">
                        <p className="text-white/60 text-xs mb-1">Contenido:</p>
                        <p className="text-white/80 text-sm line-clamp-3">{chapter.content}</p>
                      </div>
                    )}
                    
                    <div className="text-xs text-white/40">
                      Creado: {chapter.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Chapter Detail Modal */}
        {selectedChapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedChapter(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Capítulo {selectedChapter.order}: {selectedChapter.title}</h3>
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {selectedChapter.description && (
                <div className="mb-4">
                  <h4 className="text-white/80 font-medium mb-2">Descripción:</h4>
                  <p className="text-white/70">{selectedChapter.description}</p>
                </div>
              )}

              {selectedChapter.content && (
                <div className="mb-4">
                  <h4 className="text-white/80 font-medium mb-2">Contenido:</h4>
                  <div className="bg-white/5 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-white/80 whitespace-pre-line">{selectedChapter.content}</p>
                  </div>
                </div>
              )}

              <div className="text-xs text-white/40">
                <p>Creado: {selectedChapter.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                {selectedChapter.updatedAt && (
                  <p>Actualizado: {selectedChapter.updatedAt?.toDate?.()?.toLocaleDateString()}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}