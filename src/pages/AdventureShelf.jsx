import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { BookOpen, Star, Sparkles, ArrowRight, Clock } from "lucide-react";
import { FaBook, FaCrown, FaGem, FaShieldAlt } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase/firebase';
import Navigation from '../components/Navigation';

const getBookIcon = (difficulty) => {
  switch (difficulty) {
    case 'Principiante': return FaCrown;
    case 'Intermedio': return FaShieldAlt;
    case 'Avanzado': return FaGem;
    default: return FaBook;
  }
};

const getBookColor = (difficulty) => {
  switch (difficulty) {
    case 'Principiante': return 'from-blue-500 to-purple-600';
    case 'Intermedio': return 'from-amber-500 to-orange-600';
    case 'Avanzado': return 'from-purple-500 to-pink-600';
    default: return 'from-gray-500 to-slate-600';
  }
};


export default function AdventureShelf() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksCollection = collection(db, 'books');
        const booksSnapshot = await getDocs(booksCollection);
        const booksData = booksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          icon: getBookIcon(doc.data().difficulty),
          color: getBookColor(doc.data().difficulty)
        }));
        setBooks(booksData);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando libros...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Navigation />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaBook className="text-4xl text-purple-400" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Estantería <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Temática</span>
            </h1>
            <Sparkles className="text-4xl text-yellow-400 animate-pulse" />
          </div>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Elige un libro para comenzar tu aventura narrativa y sumérgete en historias fascinantes.
          </p>
        </motion.div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {books.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FaBook className="text-6xl text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No hay libros disponibles aún</p>
            </div>
          ) : (
            books.map((book, i) => {
              const IconComponent = book.icon;
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20 cursor-pointer"
                >
                  {/* Book Cover */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    {book.cover ? (
                      <>
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 right-4">
                          <div className={`w-12 h-12 bg-linear-to-r ${book.color} rounded-full flex items-center justify-center shadow-lg`}>
                            <IconComponent className="text-white text-xl" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-800 flex flex-col items-center justify-center">
                        <FaBook size={40} className="text-gray-400 mb-2" />
                        <span className="text-gray-300 font-medium text-center px-4">{book.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                      {book.title}
                    </h2>
                    <p className="text-purple-300 text-sm font-medium mb-3">{book.author}</p>
                    
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {book.description}
                    </p>

                    {/* Book Stats */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star size={10} /> {book.difficulty}
                      </span>
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                        {book.chapters} capítulos
                      </span>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/chapter-selection?bookId=${book.id}`}
                      className={`w-full block bg-linear-to-r ${book.color} hover:shadow-lg py-3 rounded-xl text-white font-semibold transition-all duration-200 text-center group-hover:scale-105`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <BookOpen size={18} />
                        Entrar al Libro
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </motion.div>
              );
            })
          )}
          
          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: books.length * 0.15 + 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl opacity-75"
          >
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-800 flex flex-col items-center justify-center">
                <Clock size={40} className="text-gray-400 mb-2" />
                <span className="text-gray-300 font-medium">Más Libros</span>
                <span className="text-gray-400 text-sm">Próximamente</span>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-300 mb-1">
                Nuevas Aventuras
              </h2>
              <p className="text-gray-400 text-sm font-medium mb-3">Próximamente</p>
              
              <p className="text-gray-400 text-sm mb-4">
                Estamos trabajando en nuevos libros emocionantes. ¡Mantente atento!
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-600/20 text-gray-400 px-2 py-1 rounded-full text-xs font-medium">
                  Próximamente
                </span>
              </div>

              <button
                disabled
                className="w-full bg-gray-600/50 py-3 rounded-xl text-gray-300 font-semibold cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Clock size={18} />
                Próximamente
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
