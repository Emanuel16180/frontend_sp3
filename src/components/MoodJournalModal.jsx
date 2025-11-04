// src/components/MoodJournalModal.jsx
import { useState } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import Modal from './Modal';
import { Loader, Send } from 'lucide-react';

// Opciones de ánimo amigables
const moodOptions = [
  { mood: 'feliz', emoji: '😊', label: 'Feliz' },
  { mood: 'tranquilo', emoji: '😌', label: 'Tranquilo' },
  { mood: 'neutral', emoji: '😐', label: 'Neutral' },
  { mood: 'triste', emoji: '😢', label: 'Triste' },
  { mood: 'ansioso', emoji: '😟', label: 'Ansioso' },
  { mood: 'irritable', emoji: '😠', label: 'Irritable' },
];

// Estilos de botones
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center";
const btnDisabled = "px-4 py-2 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed text-sm text-center";

function MoodJournalModal({ isOpen, onClose }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Idea 2: Lógica de envío
  const handleSaveMood = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.warning("Por favor, selecciona un estado de ánimo.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/clinical-history/mood-journal/', {
        mood: selectedMood,
        notes: notes,
      });
      toast.success("¡Gracias por registrar tu día!");
      onClose(true); // Envía 'true' para indicar que se completó
    } catch (err) {
      console.error("Error al guardar el ánimo:", err);
      toast.error("No se pudo guardar tu registro. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Resetear estado cuando se cierra
  const handleClose = () => {
    onClose(false);
    setTimeout(() => {
        setSelectedMood(null);
        setNotes('');
    }, 300); // Esperar que la animación del modal termine
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSaveMood} className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary mb-4 text-center">¿Cómo te sientes hoy?</h2>
        <p className="text-center text-muted-foreground -mt-4 mb-6">
          Tus psicólogos valoran tu seguimiento.
        </p>

        {/* Selector de Emojis Amigable */}
        <div className="flex flex-wrap justify-center gap-3">
          {moodOptions.map((option) => (
            <button
              type="button"
              key={option.mood}
              onClick={() => setSelectedMood(option.mood)}
              className={`
                flex flex-col items-center p-3 rounded-lg border-2 w-20 h-20
                transition-all duration-200
                ${selectedMood === option.mood
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-border bg-input hover:border-secondary'
                }
              `}
            >
              <span className="text-4xl">{option.emoji}</span>
              <span className="text-xs font-medium mt-1">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Notas Opcionales */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
            Notas (Opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="¿Hay algo más que quieras compartir sobre tu día?"
            className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Botón de envío */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || !selectedMood}
            className={loading || !selectedMood ? btnDisabled : btnPrimary}
          >
            {loading ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default MoodJournalModal;
