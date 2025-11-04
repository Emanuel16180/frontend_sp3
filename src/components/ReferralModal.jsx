// src/components/ReferralModal.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import Modal from './Modal';
import { Loader, Send, User, Brain } from 'lucide-react';

// Estilos de botones
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center";
const btnOutline = "px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors";
const btnDisabled = "px-4 py-2 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed text-sm text-center";

function ReferralModal({ isOpen, onClose, appointment }) {
    const [colleagues, setColleagues] = useState([]);
    const [selectedColleague, setSelectedColleague] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Idea 3A: Cargar la lista de colegas ---
    useEffect(() => {
        // Solo cargar si el modal está abierto y la lista está vacía
        if (isOpen && colleagues.length === 0) {
            setLoading(true);
            setError('');
            
            const fetchColleagues = async () => {
                try {
                    const response = await apiClient.get('/professionals/colleagues/');
                    setColleagues(response.data.results || response.data || []);
                } catch (err) {
                    console.error("Error al cargar colegas:", err);
                    setError("No se pudo cargar la lista de colegas.");
                    toast.error("No se pudo cargar la lista de colegas.");
                } finally {
                    setLoading(false);
                }
            };

            fetchColleagues();
        }
        
        // Resetear formulario al abrir
        if (isOpen) {
            setSelectedColleague('');
            setReason('');
        }
    }, [isOpen]); // Depende de 'isOpen'

    // --- Idea 3B: Enviar el formulario ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedColleague || !reason.trim()) {
            toast.warning("Por favor, selecciona un colega y escribe un motivo.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post(
                `/appointments/appointments/${appointment.id}/refer/`,
                {
                    referred_psychologist_id: selectedColleague,
                    reason: reason,
                }
            );
            toast.success("¡Cita derivada con éxito!");
            onClose(true); // Pasamos 'true' para indicar que se debe refrescar la lista
        } catch (err) {
            console.error("Error al derivar la cita:", err);
            const errorMsg = err.response?.data?.error || "No se pudo completar la derivación.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => onClose(false)}>
            <h2 className="text-2xl font-semibold text-primary mb-6">Derivar Cita</h2>

            {loading && colleagues.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48">
                    <Loader className="animate-spin h-8 w-8 text-primary" />
                    <p className="mt-4 text-muted-foreground">Cargando colegas...</p>
                </div>
            ) : error ? (
                <p className="text-center text-destructive">{error}</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Paciente a derivar */}
                    {appointment && (
                        <div className="bg-muted/50 p-4 rounded-lg border border-border">
                            <label className="text-sm font-medium text-muted-foreground">Paciente:</label>
                            <div className="flex items-center gap-2 mt-1">
                                <User className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-foreground">{appointment.patient_name}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Selector de Colegas */}
                    <div>
                        <label htmlFor="colleague" className="block text-sm font-medium text-foreground mb-2">
                            Derivar a:
                        </label>
                        <select
                            id="colleague"
                            value={selectedColleague}
                            onChange={(e) => setSelectedColleague(e.target.value)}
                            required
                            className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">-- Selecciona un especialista --</option>
                            {colleagues.map(colleague => (
                                <option key={colleague.user_id} value={colleague.user_id}>
                                    {colleague.full_name} ({colleague.specializations.map(s => s.name).join(', ') || 'General'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Motivo de Derivación */}
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-2">
                            Motivo de la derivación:
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            required
                            placeholder="Ej: El paciente necesita terapia cognitivo-conductual y este colega es experto."
                            className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className={btnOutline}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={loading ? btnDisabled : btnPrimary}
                        >
                            {loading ? (
                                <Loader className="animate-spin h-4 w-4" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            Confirmar Derivación
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}

export default ReferralModal;
