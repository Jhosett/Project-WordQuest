import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import Header from "../../../components/Header";
import Swal from "sweetalert2";

export default function EditSentence() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missionForm, setMissionForm] = useState({
    title: "",
    description: "",
    difficulty: "",
    order: "",
    textoBase: "",
    espacios: []
  });

  useEffect(() => {
    fetchSentenceMissions();
  }, []);

  const fetchSentenceMissions = async () => {
    try {
      const booksSnap = await getDocs(collection(db, "books"));
      const allMissions = [];
      
      for (const bookDoc of booksSnap.docs) {
        const chaptersSnap = await getDocs(collection(db, "books", bookDoc.id, "chapters"));
        
        for (const chapterDoc of chaptersSnap.docs) {
          const missionsSnap = await getDocs(
            query(
              collection(db, "books", bookDoc.id, "chapters", chapterDoc.id, "missions"),
              where("mode", "==", "completarFrase")
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
      textoBase: mission.data.textoBase,
      espacios: mission.data.espacios
    });
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

  const updateMission = async () => {
    if (!selectedMission) return;

    if (!missionForm.textoBase.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Completa el texto base de la misión',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

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
      const missionRef = doc(db, "books", selectedMission.bookId, "chapters", selectedMission.chapterId, "missions", selectedMission.id);
      
      await updateDoc(missionRef, {
        title: missionForm.title,
        description: missionForm.description,
        difficulty: missionForm.difficulty,
        order: parseInt(missionForm.order),
        data: {
          textoBase: missionForm.textoBase,
          espacios: missionForm.espacios
        },
        updatedAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: '¡Misión actualizada!',
        text: 'Los cambios han sido guardados exitosamente',
        confirmButtonColor: '#8B5CF6'
      });

      fetchSentenceMissions();
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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaEdit className="text-4xl text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Editar <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Misiones Completar Frases</span>
            </h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  } border`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FaEdit className="text-blue-400" />
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
            className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
          >
            {selectedMission ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Editar Misión</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Dificultad</label>
                    <select
                      value={missionForm.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Texto Base</label>
                  <textarea
                    value={missionForm.textoBase}
                    onChange={(e) => handleInputChange('textoBase', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-white/80 text-sm font-medium">Espacios</label>
                    <button
                      onClick={addEspacio}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-2"
                    >
                      <FaPlus size={10} /> Agregar
                    </button>
                  </div>
                  {missionForm.espacios.map((espacio, index) => (
                    <div key={espacio.id} className="bg-white/5 rounded-xl p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white text-xs font-medium">Espacio {index + 1}</h4>
                        {missionForm.espacios.length > 1 && (
                          <button
                            onClick={() => removeEspacio(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <FaTrash size={10} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {espacio.opciones.map((opcion, opcionIndex) => (
                          <input
                            key={opcionIndex}
                            type="text"
                            value={opcion}
                            onChange={(e) => handleOpcionChange(index, opcionIndex, e.target.value)}
                            placeholder={`Opción ${opcionIndex + 1}`}
                            className="px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ))}
                      </div>
                      
                      <select
                        value={espacio.respuestaCorrecta}
                        onChange={(e) => handleEspacioChange(index, 'respuestaCorrecta', e.target.value)}
                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="" className="bg-slate-800">Respuesta correcta...</option>
                        {espacio.opciones.filter(opcion => opcion.trim()).map((opcion, i) => (
                          <option key={i} value={opcion} className="bg-slate-800">{opcion}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={updateMission}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
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