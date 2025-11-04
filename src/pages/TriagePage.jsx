// src/pages/TriagePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { toast } from 'react-toastify';
import { Loader, Send, CheckCircle, ArrowLeft } from 'lucide-react';

// --- Definición del Árbol de Decisiones (basado en tu lógica) ---
const triageTree = {
  nodo1: {
    question: "¿Cuál de las siguientes opciones describe mejor cómo te has sentido últimamente?",
    options: [
      { text: "Triste o sin ganas de hacer cosas", value: "triste_o_sin_ganas", nextNode: "nodo2" },
      { text: "Ansioso, preocupado o con miedo", value: "ansioso_preocupado_o_con_miedo", nextNode: "nodo3" },
      { text: "Irritable, con problemas para dormir o concentrarme", value: "irritable_o_dificultad_dormir", nextNode: "nodo4" },
      { text: "Con conflictos personales o de pareja", value: "conflictos_personales_o_pareja", nextNode: "nodo5" },
      { text: "Consumiendo más alcohol o sustancias de lo habitual", value: "consumo_alcohol_o_sustancias", nextNode: "nodo6" },
      { text: "En general bien, sin cambios mayores", value: "bien_sin_cambios", nextNode: "submit" },
    ],
  },
  nodo2: { // Depresión
    question: "¿Con qué frecuencia has perdido el interés o el placer en hacer cosas?",
    options: [
      { text: "Casi todos los días", value: "casi_todos_los_dias", nextNode: "submit" },
      { text: "Algunos días", value: "algunos_dias", nextNode: "submit" },
      { text: "Rara vez", value: "rara_vez", nextNode: "submit" },
    ],
  },
  nodo3: { // Ansiedad
    question: "¿Sientes que te preocupas constantemente por diferentes cosas?",
    options: [
      { text: "Sí, constantemente y me cuesta controlarlo", value: "si_constantemente", nextNode: "submit" },
      { text: "A veces, especialmente en situaciones sociales o en público", value: "a_veces_en_publico", nextNode: "submit" },
      { text: "No realmente", value: "no_realmente", nextNode: "submit" },
    ],
  },
  nodo4: { // Estrés
    question: "¿Cuál crees que es la fuente principal de tu estrés o irritabilidad?",
    options: [
      { text: "El trabajo o los estudios", value: "trabajo_o_estudios", nextNode: "submit" },
      { text: "La familia o las relaciones personales", value: "familia_o_relaciones", nextNode: "submit" },
      { text: "No estoy seguro", value: "no_estoy_seguro", nextNode: "submit" },
    ],
  },
  nodo5: { // Relaciones
    question: "¿Tienes conflictos frecuentes con tu pareja u otras personas importantes para ti?",
    options: [
      { text: "Sí, con frecuencia", value: "si_con_frecuencia", nextNode: "submit" },
      { text: "A veces, pero lo normal", value: "a_veces", nextNode: "submit" },
      { text: "No, rara vez", value: "no_rara_vez", nextNode: "submit" },
    ],
  },
  nodo6: { // Adicciones
    question: "¿Sientes que pierdes el control sobre tu consumo de alcohol o sustancias?",
    options: [
      { text: "Sí, a menudo siento que no puedo parar", value: "si_pierdo_control", nextNode: "submit" },
      { text: "A veces he consumido más de lo que quería", value: "a_veces_mas", nextNode: "submit" },
      { text: "No, controlo mi consumo", value: "no_pierdo_control", nextNode: "submit" },
    ],
  },
};
// --- Fin del Árbol ---

function TriagePage() {
  const [currentNode, setCurrentNode] = useState('nodo1');
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleAnswer = (value, nextNode) => {
    const newAnswers = { ...answers, [currentNode]: value };
    setAnswers(newAnswers);

    if (nextNode === 'submit') {
      handleSubmit(newAnswers);
    } else {
      setCurrentNode(nextNode);
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    // Esta es una lógica simple para volver atrás.
    // Para un árbol complejo, se necesitaría un historial de nodos.
    if (step > 1) {
      setStep(prev => prev - 1);
      // Reseteamos al nodo1 (simplificado)
      setCurrentNode('nodo1');
      setAnswers({});
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/clinical-history/triage/', {
        answers: finalAnswers,
      });
      
      setResult(response.data); // Guardamos el pre-diagnóstico y recomendación
      
      // Marcamos el triaje como completado en localStorage
      localStorage.setItem('triageCompleted', 'true');
      
      // También actualizamos el objeto 'user' en localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        user.has_completed_triage = true;
        localStorage.setItem('user', JSON.stringify(user));
      }

    } catch (err) {
      console.error("Error al enviar el triaje:", err);
      toast.error("Hubo un error al guardar tus respuestas. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = Object.keys(triageTree).length; // Total de nodos principales

  // --- Pantalla de Carga o de Pregunta ---
  if (!result) {
    const node = triageTree[currentNode];
    return (
      <div className="flex justify-center items-center min-h-screen p-4 bg-background">
        <div className="bg-card text-card-foreground p-8 sm:p-12 rounded-xl shadow-xl w-full max-w-2xl relative">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader className="animate-spin h-12 w-12 text-primary mb-4" />
              <p className="text-muted-foreground">Enviando tus respuestas...</p>
            </div>
          ) : (
            <>
              {/* Botón de volver */}
              {step > 1 && (
                <button 
                  onClick={handleBack} 
                  className="absolute top-6 left-6 text-muted-foreground hover:text-primary flex items-center gap-1 text-sm"
                >
                  <ArrowLeft size={16} /> Volver
                </button>
              )}

              {/* Barra de Progreso */}
              <div className="mb-8">
                <p className="text-sm font-medium text-primary mb-2">Paso {step} de {totalSteps}</p>
                <div className="w-full bg-input rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Pregunta */}
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">{node.question}</h2>
              
              {/* Opciones */}
              <div className="space-y-4">
                {node.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value, option.nextNode)}
                    className="w-full p-4 bg-input border border-border rounded-lg text-foreground text-left hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Pantalla de Resultado ---
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-background">
      <div className="bg-card text-card-foreground p-8 sm:p-12 rounded-xl shadow-xl w-full max-w-2xl text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-primary mb-4">¡Gracias por completar tu perfil!</h2>
        
        <div className="bg-input p-6 rounded-lg border border-border text-left mb-8">
          <p className="text-sm text-muted-foreground mb-1">Pre-diagnóstico (basado en tus respuestas):</p>
          <p className="text-lg font-semibold text-foreground mb-4">
            {result.pre_diagnosis || "Análisis completado."}
          </p>
          <p className="text-sm text-muted-foreground mb-1">Recomendación:</p>
          <p className="text-foreground">
            {result.recommendation || "Siempre puedes hablar con un profesional si lo necesitas."}
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full p-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors"
        >
          Ir a mi Panel
        </button>
      </div>
    </div>
  );
}

export default TriagePage;
