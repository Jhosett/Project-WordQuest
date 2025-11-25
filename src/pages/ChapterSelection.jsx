import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { FaBook, FaPlay, FaArrowLeft, FaLock } from "react-icons/fa";
import { db } from "../firebase/firebase";
import Navigation from "../components/Navigation";

export default function ChapterSelection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const bookId = searchParams.get('bookId');

  useEffect(() => {
    if (bookId) {
      fetchBookAndChapters();
    }
  }, [bookId]);

  const fetchBookAndChapters = async () => {
    try {
      // Fetch book details
      const bookDoc = await getDoc(doc(db, "books", bookId));
      if (bookDoc.exists()) {
        setBook({ id: bookDoc.id, ...bookDoc.data() });
      }

      // Fetch chapters
      const chaptersSnap = await getDocs(collection(db, "books", bookId, "chapters"));
      const chaptersData = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChapters(chaptersData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const selectChapter = (chapterId) => {
    navigate(`/chapter-missions?bookId=${bookId}&chapterId=${chapterId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando capítulos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/adventure-shelf')}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <FaArrowLeft /> Volver a la Estantería
        </motion.button>

        {/* Book Header */}
        {book && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
              {book.cover && (
                <div className="w-32 h-48 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-purple-300 mb-3">por {book.author}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {book.difficulty}
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                    {chapters.length} capítulos
                  </span>
                </div>
              </div>
            </div>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              {book.description}
            </p>
          </motion.div>
        )}

        {/* Chapters Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Selecciona un Capítulo
          </h2>
          
          {chapters.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <FaBook className="text-4xl text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No hay capítulos disponibles para este libro</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => selectChapter(chapter.id)}
                  className="group cursor-pointer bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/15"
                >
                  {/* Chapter Number */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{chapter.order}</span>
                    </div>
                    <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
                      <FaPlay size={20} />
                    </div>
                  </div>

                  {/* Chapter Info */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                    {chapter.title}
                  </h3>
                  
                  {chapter.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">
                      {chapter.description}
                    </p>
                  )}

                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-300 text-xs">Disponible</span>
                    </div>
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                      <FaPlay size={12} /> Jugar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">¿Cómo funciona?</h3>
            <p className="text-white/70 text-sm">
              Selecciona un capítulo para acceder a sus misiones. Completa las actividades de palabras clave 
              para avanzar en tu aventura de aprendizaje.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}