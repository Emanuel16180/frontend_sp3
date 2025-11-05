// src/components/PrescriptionModal.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import Modal from './Modal';
import { Loader, Send, Pill, Trash2, XCircle, CheckCircle, FileText } from 'lucide-react';

// Estilos de botones
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm flex items-center gap-2";
const btnOutline = "px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors text-sm";
const btnDisabled = "px-4 py-2 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed text-sm text-center";
const btnSmallDestructive = "p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors";

function PrescriptionModal({ isOpen, onClose, patientId, patientName }) {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Formulario para nueva receta
    const [medication, setMedication] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('');
    const [notes, setNotes] = useState('');

    const fetchPrescriptions = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const response = await apiClient.get(`/clinical-history/patient/${patientId}/prescriptions/`);
            setPrescriptions(response.data.results || response.data || []);
        } catch (err) {
            console.error("Error al cargar recetas:", err);
            toast.error("No se pudieron cargar las recetas del paciente.");
        } finally {
            setLoading(false);
        }
    };

    // Cargar historial al abrir el modal
    useEffect(() => {
        if (isOpen) {
            fetchPrescriptions();
        }
    }, [isOpen, patientId]);

    const clearForm = () => {
        setMedication('');
        setDosage('');
        setFrequency('');
        setNotes('');
    };

    // Crear nueva receta
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post(`/clinical-history/patient/${patientId}/prescriptions/`, {
                // --- ¡ESTA ES LA LÍNEA AÑADIDA! ---
                patient: patientId, 
                // ----------------------------------
                medication_name: medication,
                dosage: dosage,
                frequency: frequency,
                notes: notes,
            });
            toast.success("Receta añadida exitosamente.");
            clearForm();
            fetchPrescriptions(); // Recargar lista
        } catch (err) {
            console.error("Error al crear receta:", err);
            // Esto ahora debería mostrar el error específico si algo más falla
            const errorMsg = JSON.stringify(err.response?.data) || "No se pudo añadir la receta."
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Desactivar una receta
    const handleDeactivate = async (prescriptionId) => {
        if (!window.confirm("¿Estás seguro de que quieres desactivar este medicamento? El paciente seguirá viéndolo en su historial como 'Inactivo'.")) return;
        
        try {
            await apiClient.patch(`/clinical-history/patient/${patientId}/prescriptions/${prescriptionId}/`, {
                is_active: false
            });
            toast.success("Tratamiento desactivado.");
            fetchPrescriptions(); // Recargar lista
        } catch (err) {
            console.error("Error al desactivar:", err);
            toast.error("No se pudo desactivar el tratamiento.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-semibold text-primary mb-2">Tratamiento Farmacológico</h2>
            <p className="text-muted-foreground mb-6">Paciente: <strong className="text-foreground">{patientName}</strong></p>

            {/* Formulario de Nueva Receta */}
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border mb-6">
                <h3 className="text-lg font-semibold text-foreground">Añadir Nuevo Medicamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={medication}
                        onChange={(e) => setMedication(e.target.value)}
                        placeholder="Nombre del Medicamento" required
                        className="w-full p-2 bg-input border border-border rounded-lg"
                    />
                    <input
                        type="text"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        placeholder="Dosis (ej: 50mg)" required
                        className="w-full p-2 bg-input border border-border rounded-lg"
                    />
                </div>
                <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="Frecuencia (ej: 1 por la mañana)" required
                    className="w-full p-2 bg-input border border-border rounded-lg"
                />
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Notas adicionales (ej: Iniciar por 6 meses)"
                    className="w-full p-2 bg-input border border-border rounded-lg"
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={isSubmitting ? btnDisabled : btnPrimary}
                    >
                        {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                        Guardar Receta
                    </button>
                </div>
            </form>

            {/* Historial de Recetas */}
            <h3 className="text-lg font-semibold text-foreground mb-4">Historial del Paciente</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex justify-center">
                        <Loader className="animate-spin h-6 w-6 text-primary" />
                    </div>
                ) : prescriptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Este paciente no tiene recetas.</p>
                ) : (
                    prescriptions.map(item => (
                        <div key={item.id} className="p-3 bg-background rounded-lg border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-foreground">{item.medication_name}</p>
                                    <p className="text-sm text-muted-foreground">{item.dosage} - {item.frequency}</p>
                                </div>
                                {item.is_active ? (
                                    <button 
                                        onClick={() => handleDeactivate(item.id)}
                                        className={btnSmallDestructive}
                                        title="Desactivar tratamiento"
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                                        <CheckCircle className="h-3 w-3" /> Inactivo
                                    </span>
                                )}
                            </div>
                            {item.notes && <p className="text-sm text-foreground mt-2 pt-2 border-t border-border">{item.notes}</p>}
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
}

export default PrescriptionModal;