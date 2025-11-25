import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaBook, FaPlus, FaEdit, FaTrash, FaImage, FaSave, FaTimes, FaFileAlt } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import Header from "../../../components/Header";
import Swal from "sweetalert2";

export default function BooksAdmin() {
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const navigate = useNavigate();
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    description: "",
    difficulty: "Principiante",
    chapters: "",
    cover: ""
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const snap = await getDocs(collection(db, "books"));
      setBooks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching books:', error);
      if (error.code === 'permission-denied') {
        Swal.fire({
          icon: 'error',
          title: 'Permisos insuficientes',
          text: 'No tienes permisos para acceder a los libros. Contacta al administrador.',
          confirmButtonColor: '#8B5CF6'
        });
      }
    }
  };

  const handleInputChange = (field, value) => {
    setBookForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setBookForm({
      title: "",
      author: "",
      description: "",
      difficulty: "Principiante",
      chapters: "",
      cover: ""
    });
    setShowForm(false);
    setEditingBook(null);
  };

  const editBook = (book) => {
    setBookForm({
      title: book.title,
      author: book.author,
      description: book.description,
      difficulty: book.difficulty,
      chapters: book.chapters.toString(),
      cover: book.cover
    });
    setEditingBook(book.id);
    setShowForm(true);
  };

  const updateBook = async () => {
    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor completa al menos el título y autor',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "books", editingBook), {
        title: bookForm.title,
        author: bookForm.author,
        description: bookForm.description,
        difficulty: bookForm.difficulty,
        chapters: parseInt(bookForm.chapters) || 0,
        cover: bookForm.cover,
        updatedAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: '¡Libro actualizado!',
        text: 'El libro ha sido actualizado exitosamente',
        confirmButtonColor: '#8B5CF6'
      });

      resetForm();
      fetchBooks();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el libro',
        confirmButtonColor: '#8B5CF6'
      });
    }
    setLoading(false);
  };

  const createBook = async () => {
    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor completa al menos el título y autor',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "books"), {
        title: bookForm.title,
        author: bookForm.author,
        description: bookForm.description,
        difficulty: bookForm.difficulty,
        chapters: parseInt(bookForm.chapters) || 0,
        cover: bookForm.cover,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: '¡Libro creado!',
        text: 'El libro ha sido agregado exitosamente',
        confirmButtonColor: '#8B5CF6'
      });

      resetForm();
      fetchBooks();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el libro',
        confirmButtonColor: '#8B5CF6'
      });
    }
    setLoading(false);
  };

  const deleteBook = async (bookId, bookTitle) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el libro "${bookTitle}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "books", bookId));
        fetchBooks();
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El libro ha sido eliminado',
          confirmButtonColor: '#8B5CF6'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el libro',
          confirmButtonColor: '#8B5CF6'
        });
      }
    }
  };

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
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaBook className="text-4xl text-green-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Administrar <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Libros</span>
            </h1>
          </div>
          <p className="text-white/70 text-base sm:text-lg">
            Gestiona los libros del modo Aventura Temática
          </p>
        </motion.div>

        {/* Add Book Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-center"
        >
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-linear-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <FaPlus /> {showForm ? 'Cancelar' : 'Agregar Nuevo Libro'}
          </button>
        </motion.div>

        {/* Book Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaBook className="text-green-400" /> {editingBook ? 'Editar Libro' : 'Nuevo Libro'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Título *</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Título del libro"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Autor *</label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Nombre del autor"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-linear-to-r from-green-400 to-blue-400 rounded-full"></span>
                  Dificultad
                </label>
                <div className="relative">
                  <select
                    value={bookForm.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer hover:bg-white/10 hover:border-white/30"
                  >
                    <option value="Principiante" className="bg-slate-800 text-white">Principiante</option>
                    <option value="Intermedio" className="bg-slate-800 text-white">Intermedio</option>
                    <option value="Avanzado" className="bg-slate-800 text-white">Avanzado</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-1 text-xs text-white/50">
                  {bookForm.difficulty === 'Principiante' && '🟢 Ideal para nuevos lectores'}
                  {bookForm.difficulty === 'Intermedio' && '🟡 Requiere experiencia básica'}
                  {bookForm.difficulty === 'Avanzado' && '🔴 Para lectores experimentados'}
                </div>
              </div>

              {/* Chapters */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Número de Capítulos</label>
                <input
                  type="number"
                  value={bookForm.chapters}
                  onChange={(e) => handleInputChange('chapters', e.target.value)}
                  placeholder="Ej: 12"
                  min="1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Cover URL */}
              <div className="md:col-span-2">
                <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                  <FaImage /> URL de la Portada
                </label>
                <input
                  type="url"
                  value={bookForm.cover}
                  onChange={(e) => handleInputChange('cover', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-white/80 text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción del libro..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={editingBook ? updateBook : createBook}
                disabled={loading}
                className="flex-1 bg-linear-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaSave /> {loading ? 'Guardando...' : (editingBook ? 'Actualizar Libro' : 'Guardar Libro')}
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

        {/* Books List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Libros Existentes ({books.length})</h2>
          
          {books.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <FaBook className="text-4xl text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No hay libros registrados aún</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  {/* Book Cover */}
                  {book.cover && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{book.title}</h3>
                    <p className="text-green-300 text-sm mb-2">{book.author}</p>
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">{book.description}</p>
                    
                    {/* Book Stats */}
                    <div className="flex gap-2 mb-4">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                        {book.difficulty}
                      </span>
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                        {book.chapters} cap.
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mb-2">
                      <button 
                        onClick={() => editBook(book)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <FaEdit size={12} /> Editar
                      </button>
                      <button
                        onClick={() => deleteBook(book.id, book.title)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <FaTrash size={12} /> Eliminar
                      </button>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/chapters?bookId=${book.id}`)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <FaFileAlt size={12} /> Capítulos
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
