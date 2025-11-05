// src/pages/SessionNotePage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Target, Pill } from 'lucide-react'; 
import apiClient from '../api';
import { toast } from 'react-toastify';
import ObjectiveModal from '../components/ObjectiveModal';
import PrescriptionModal from '../components/PrescriptionModal';

// --- Constantes de Estilo ---
const btnPrimary = "px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center flex items-center gap-2";
const btnSecondary = "px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-center flex items-center gap-2";
const btnOutline = "px-6 py-3 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors flex items-center gap-2";
const btnWarning = "px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-center flex items-center gap-2";


function SessionNotePage() {
    const { appointmentId } = useParams();
    const [note, setNote] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [appointmentInfo, setAppointmentInfo] = useState(null);

    const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false); 
    const [isPsychiatrist, setIsPsychiatrist] = useState(false); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Obtenemos el perfil del profesional logueado
                const profileResponse = await apiClient.get('/professionals/profile/');
                const profile = profileResponse.data;

                if (profile && profile.specializations) {
                    const normalize = (str) => 
                        (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                    const isPsyc = profile.specializations
                        .some(spec => normalize(spec.name).includes('psiquiatr'));
                    
                    setIsPsychiatrist(isPsyc);
                }

                // 2. Continuamos cargando los datos de la cita
                const appointmentResponse = await apiClient.get(`/appointments/appointments/${appointmentId}/`);
                setAppointmentInfo(appointmentResponse.data);

                // 3. Intentamos obtener la nota
                const noteResponse = await apiClient.get(`/appointments/appointments/${appointmentId}/note/`);
                setNote(noteResponse.data);
                setContent(noteResponse.data.content);

            } catch (error) {
                if (error.response && error.response.status === 404 && error.config.url.includes('/note/')) {
                    console.log('No existe una nota para esta cita. Se creará una nueva.');
                } else {
                    console.error('Error al cargar datos:', error);
                    toast.error('No se pudo cargar la información de la página.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [appointmentId]);

    const handleSave = async () => {
        if (!content.trim()) {
            toast.warning('Por favor escribe algún contenido antes de guardar.');
            return;
        }

        setSaving(true);
        const apiMethod = note ? 'patch' : 'post';
        const apiUrl = note
            ? `/appointments/appointments/${appointmentId}/note/${note.id}/`
            : `/appointments/appointments/${appointmentId}/note/`;

        try {
            const response = await apiClient[apiMethod](apiUrl, { content });
            setNote(response.data);
            toast.success('¡Nota guardada exitosamente!');
        } catch (error) {
            console.error('Error al guardar nota:', error);
            const errorMessage = error.response?.data?.content?.[0] || 
                                 error.response?.data?.detail || 
                                 'No se pudo guardar la nota.';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <p className="text-center text-muted-foreground">Cargando información...</p>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <Link 
                    to="/psychologist-dashboard" 
                    className="flex items-center gap-1 text-primary font-medium hover:underline mb-6"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Volver al Dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-4">Nota de Sesión</h1>
                    
                    {appointmentInfo && (
                        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Paciente:</span>
                                    <p className="font-semibold text-foreground">{appointmentInfo.patient_name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Fecha de la sesión:</span>
                                    <p className="font-semibold text-foreground">{appointmentInfo.appointment_date}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Hora:</span>
                                    <p className="font-semibold text-foreground">{appointmentInfo.start_time}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                    <h2 className="text-xl font-semibold text-primary mb-4">
                        {note ? 'Editar Nota Privada' : 'Crear Nueva Nota'}
                    </h2>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Contenido de la nota:
                        </label>
                        <textarea
                            className="w-full h-80 p-4 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Escribe aquí las notas privadas de la sesión..."
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Esta nota es completamente privada y solo será visible para ti.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsObjectiveModalOpen(true)}
                            className={btnOutline}
                        >
                            <Target className="h-4 w-4" />
                            Asignar Objetivo
                        </button>
                        
                        {isPsychiatrist && (
                            <button 
                                type="button"
                                onClick={() => setIsPrescriptionModalOpen(true)}
                                className={btnWarning}
                            >
                                <Pill className="h-4 w-4" />
                                Gestionar Receta
                            </button>
                        )}
                        
                        <Link to="/psychologist-dashboard" className={btnSecondary}>
                            Cancelar
                        </Link>
                        <button 
                            onClick={handleSave} 
                            disabled={saving || !content.trim()}
                            className={`${btnPrimary} ${(saving || !content.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Guardando...' : (note ? 'Actualizar Nota' : 'Guardar Nota')}
                        </button>
                    </div>
                </div>

                {note && (
                    <div className="mt-6 bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            <strong>Última actualización:</strong> {new Date(note.updated_at).toLocaleString('es-ES')}
                        </p>
                    </div>
                )}
            </div>

            {appointmentInfo && (
                <ObjectiveModal
                    isOpen={isObjectiveModalOpen}
                    onClose={(didSubmit) => setIsObjectiveModalOpen(false)}
                    patientId={appointmentInfo.patient}
                    appointmentId={appointmentInfo.id}
                />
            )}

            {appointmentInfo && (
                <PrescriptionModal
                    isOpen={isPrescriptionModalOpen}
                    onClose={() => setIsPrescriptionModalOpen(false)}
                    patientId={appointmentInfo.patient}
                    patientName={appointmentInfo.patient_name}
                />
            )}
        </>
    );
}

export default SessionNotePage;