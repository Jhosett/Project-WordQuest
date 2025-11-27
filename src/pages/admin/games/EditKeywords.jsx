import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaKeyboard, FaSave, FaTimes, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import Header from "../../../components/Header";
import Swal from "sweetalert2";

export default function EditKeywords() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missionForm, setMissionForm] = useState({
    title: "",
    description: "",
    difficulty: "",
    order: "",
    text: "",
    imageUrl: "",
    correctWords: [""],
    distractors: [""]
  });

  useEffect(() => {
    fetchKeywordMissions();
  }, []);

  const fetchKeywordMissions = async () => {
    try {
      const booksSnap = await getDocs(collection(db, "books"));
      const allMissions = [];
      
      for (const bookDoc of booksSnap.docs) {
        const chaptersSnap = await getDocs(collection(db, "books", bookDoc.id, "chapters"));
        
        for (const chapterDoc of chaptersSnap.docs) {
          const missionsSnap = await getDocs(
            query(
              collection(db, "books", bookDoc.id, "chapters", chapterDoc.id, "missions"),
              where("mode", "==", "keywords")
            )
          );
          
          missionsSnap.docs.forEach(missionDoc => {
            allMissions.push({
              id: missionDoc.id,
              bookId: bookDoc.id,
              bookTitle: bookDoc.data().title,
              chapterId: chapterDoc.id,
              chapterTitle: chapterDoc.data().title,
              ...missionDoc.data()
            });
          });
        }
      }
      
      setMissions(allMissions);
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  };

  const selectMission = (mission) => {
    setSelectedMission(mission);
    setMissionForm({
      title: mission.title,
      description: mission.description,
      difficulty: mission.difficulty,
      order: mission.order.toString(),
      text: mission.data.text,
      imageUrl: mission.data.imageUrl || "",
      correctWords: mission.data.correctWords,
      distractors: mission.data.distractors || [""]
    });
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

  const updateMission = async () => {
    if (!selectedMission) return;

    const filteredCorrectWords = missionForm.correctWords.filter(word => word.trim());
    const filteredDistractors = missionForm.distractors.filter(word => word.trim());

    if (!missionForm.text.trim() || filteredCorrectWords.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Completa el texto y al menos una palabra correcta',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    setLoading(true);
    try {
      const missionRef = doc(db, "books", selectedMission.bookId, "chapters", selectedMission.chapterId, "missions", selectedMission.id);
      
      await updateDoc(missionRef, {
        title: missionForm.title,
        description: missionForm.description,
        difficulty: missionForm.difficulty,
        order: parseInt(missionForm.order),
        data: {
          text: missionForm.text,
          imageUrl: missionForm.imageUrl || null,
          correctWords: filteredCorrectWords,
          distractors: filteredDistractors
        },
        updatedAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: '¡Misión actualizada!',
        text: 'Los cambios han sido guardados exitosamente',
        confirmButtonColor: '#8B5CF6'
      });

      fetchKeywordMissions();
      setSelectedMission(null);
    } catch (error) {
      console.error('Error updating mission:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo actualizar la misión: ${error.message}`,
        confirmButtonColor: '#8B5CF6'
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaKeyboard className="text-4xl text-yellow-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Editar <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Misiones Keywords</span>
            </h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Missions List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Misiones Disponibles</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {missions.map(mission => (
                <div
                  key={`${mission.bookId}-${mission.chapterId}-${mission.id}`}
                  onClick={() => selectMission(mission)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedMission?.id === mission.id
                      ? 'bg-yellow-500/20 border-yellow-500/50'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  } border`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FaEdit className="text-yellow-400" />
                    <h3 className="font-semibold text-white text-sm">{mission.title}</h3>
                  </div>
                  <p className="text-white/60 text-xs mb-1">{mission.bookTitle} - {mission.chapterTitle}</p>
                  <p className="text-white/40 text-xs">Orden: {mission.order} | {mission.difficulty}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Edit Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
          >
            {selectedMission ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Editar Misión</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Dificultad</label>
                    <select
                      value={missionForm.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="Principiante" className="bg-slate-800">Principiante</option>
                      <option value="Intermedio" className="bg-slate-800">Intermedio</option>
                      <option value="Avanzado" className="bg-slate-800">Avanzado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Orden</label>
                    <input
                      type="number"
                      value={missionForm.order}
                      onChange={(e) => handleInputChange('order', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Texto</label>
                  <textarea
                    value={missionForm.text}
                    onChange={(e) => handleInputChange('text', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">URL de Imagen</label>
                  <input
                    type="url"
                    value={missionForm.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Palabras Correctas</label>
                  {missionForm.correctWords.map((word, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={word}
                        onChange={(e) => handleArrayChange('correctWords', index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={() => removeArrayItem('correctWords', index)}
                        className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('correctWords')}
                    className="w-full py-2 border border-dashed border-green-500/50 text-green-400 rounded-xl hover:border-green-500 text-xs flex items-center justify-center gap-2"
                  >
                    <FaPlus size={10} /> Agregar palabra
                  </button>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Distractores</label>
                  {missionForm.distractors.map((word, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={word}
                        onChange={(e) => handleArrayChange('distractors', index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => removeArrayItem('distractors', index)}
                        className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('distractors')}
                    className="w-full py-2 border border-dashed border-red-500/50 text-red-400 rounded-xl hover:border-red-500 text-xs flex items-center justify-center gap-2"
                  >
                    <FaPlus size={10} /> Agregar distractor
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={updateMission}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FaSave size={12} /> {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setSelectedMission(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <FaTimes size={12} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FaEdit className="text-4xl text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Selecciona una misión para editar</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}