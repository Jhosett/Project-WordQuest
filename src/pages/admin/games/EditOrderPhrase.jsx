import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSort, FaSave, FaTimes, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import Header from "../../../components/Header";
import Swal from "sweetalert2";

export default function EditOrderPhrase() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missionForm, setMissionForm] = useState({
    title: "",
    description: "",
    difficulty: "",
    order: "",
    instruction: "",
    sequence: [],
    hints: {
      generalHints: [""],
      stepHints: {},
      maxHints: 3
    }
  });

  useEffect(() => {
    fetchOrderPhraseMissions();
  }, []);

  const fetchOrderPhraseMissions = async () => {
    try {
      const booksSnap = await getDocs(collection(db, "books"));
      const allMissions = [];
      
      for (const bookDoc of booksSnap.docs) {
        const chaptersSnap = await getDocs(collection(db, "books", bookDoc.id, "chapters"));
        
        for (const chapterDoc of chaptersSnap.docs) {
          const missionsSnap = await getDocs(
            query(
              collection(db, "books", bookDoc.id, "chapters", chapterDoc.id, "missions"),
              where("mode", "==", "ordenar-secuencia")
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
      instruction: mission.data.instruction,
      sequence: mission.data.sequence,
      hints: mission.data.hints || {
        generalHints: [""],
        stepHints: {},
        maxHints: 3
      }
    });
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

  const updateMission = async () => {
    if (!selectedMission) return;

    const invalidSequence = missionForm.sequence.some(step => !step.text.trim());
    if (!missionForm.instruction.trim() || invalidSequence) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Completa la instrucción y todos los eventos de la secuencia',
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
          instruction: missionForm.instruction,
          sequence: missionForm.sequence,
          correctOrder: missionForm.sequence.map(step => step.id),
          hints: {
            generalHints: missionForm.hints.generalHints.filter(hint => hint.trim()),
            stepHints: missionForm.hints.stepHints,
            maxHints: missionForm.hints.maxHints
          }
        },
        updatedAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: '¡Misión actualizada!',
        text: 'Los cambios han sido guardados exitosamente',
        confirmButtonColor: '#8B5CF6'
      });

      fetchOrderPhraseMissions();
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
            <FaSort className="text-4xl text-green-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Editar <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Misiones Ordenar Secuencia</span>
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
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  } border`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FaEdit className="text-green-400" />
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
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Instrucción</label>
                  <textarea
                    value={missionForm.instruction}
                    onChange={(e) => handleInputChange('instruction', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-white/80 text-sm font-medium">Secuencia</label>
                    <button
                      onClick={addSequenceStep}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-2"
                    >
                      <FaPlus size={10} /> Agregar
                    </button>
                  </div>
                  {missionForm.sequence.map((step, index) => (
                    <div key={step.id} className="flex gap-2 mb-2">
                      <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <textarea
                        value={step.text}
                        onChange={(e) => handleSequenceChange(index, e.target.value)}
                        rows={2}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      />
                      {missionForm.sequence.length > 2 && (
                        <button
                          onClick={() => removeSequenceStep(index)}
                          className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        >
                          <FaTrash size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-white text-sm font-semibold mb-3">Pistas</h3>
                  
                  <div className="mb-4">
                    <label className="block text-white/80 text-xs font-medium mb-2">Máximo de pistas</label>
                    <input
                      type="number"
                      value={missionForm.hints.maxHints}
                      onChange={(e) => setMissionForm(prev => ({ ...prev, hints: { ...prev.hints, maxHints: parseInt(e.target.value) || 3 } }))}
                      min="1"
                      max="10"
                      className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-white/80 text-xs font-medium">Pistas Generales</label>
                      <button
                        onClick={addGeneralHint}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1"
                      >
                        <FaPlus size={8} /> Agregar
                      </button>
                    </div>
                    {missionForm.hints.generalHints.map((hint, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <textarea
                          value={hint}
                          onChange={(e) => handleHintChange('general', index, e.target.value)}
                          rows={2}
                          className="flex-1 px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <button
                          onClick={() => removeGeneralHint(index)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          <FaTrash size={8} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-2">Pistas por Paso</label>
                    {missionForm.sequence.map((step, index) => (
                      <div key={step.id} className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white/60 text-xs">Paso {index + 1}:</span>
                          {missionForm.hints.stepHints[step.id] && (
                            <button
                              onClick={() => removeStepHint(step.id)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              <FaTrash size={8} />
                            </button>
                          )}
                        </div>
                        <textarea
                          value={missionForm.hints.stepHints[step.id] || ""}
                          onChange={(e) => handleHintChange('step', step.id, e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={updateMission}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-2 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
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