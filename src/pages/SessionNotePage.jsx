// src/pages/SessionNotePage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Target } from 'lucide-react'; // <-- AÑADIDO Target
import apiClient from '../api';
import { toast } from 'react-toastify';
import ObjectiveModal from '../components/ObjectiveModal'; // <-- 1. IMPORTAR NUEVO MODAL

// --- Constantes de Estilo ---
const btnPrimary = "px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center flex items-center gap-2";
const btnSecondary = "px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-center flex items-center gap-2";
// Nuevo estilo para el botón de objetivos
const btnOutline = "px-6 py-3 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors flex items-center gap-2";


function SessionNotePage() {
    const { appointmentId } = useParams(); // Obtiene el ID de la cita de la URL
    const [note, setNote] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [appointmentInfo, setAppointmentInfo] = useState(null);

    // --- 2. AÑADIR ESTADO PARA EL MODAL ---
    const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener información de la cita primero
                const appointmentResponse = await apiClient.get(`/appointments/appointments/${appointmentId}/`);
                setAppointmentInfo(appointmentResponse.data);

                // Intentar obtener la nota existente
                const noteResponse = await apiClient.get(`/appointments/appointments/${appointmentId}/note/`);
                setNote(noteResponse.data);
                setContent(noteResponse.data.content);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // Si da 404, significa que no hay nota, lo cual está bien.
                    console.log('No existe una nota para esta cita. Se creará una nueva.');
                } else {
                    toast.error('No se pudo cargar la información de la nota.');
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
        const apiMethod = note ? 'patch' : 'post'; // Si hay nota, actualiza (PATCH); si no, crea (POST)
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
        <> {/* 3. AÑADIR FRAGMENTO Y MODAL AL FINAL */}
            <div className="max-w-4xl mx-auto">
                {/* Navegación de retorno */}
                <Link 
                    to="/psychologist-dashboard" 
                    className="flex items-center gap-1 text-primary font-medium hover:underline mb-6"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Volver al Dashboard
                </Link>

                {/* Encabezado */}
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
                            <div className="mt-4">
                                <span className="text-sm text-muted-foreground">Estado:</span>
                                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                                    appointmentInfo.status === 'completed' 
                                        ? 'bg-gray-100 text-gray-800' 
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {appointmentInfo.status_display}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Área de edición de nota */}
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
                            placeholder="Escribe aquí las notas privadas de la sesión...&#10;&#10;Ejemplo:&#10;- Progreso observado&#10;- Temas tratados&#10;- Recomendaciones&#10;- Próximos pasos"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Esta nota es completamente privada y solo será visible para ti.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                        {/* 4. AÑADIR BOTÓN "ASIGNAR OBJETIVO" */}
                        <button 
                            type="button"
                            onClick={() => setIsObjectiveModalOpen(true)}
                            className={btnOutline} // Estilo diferente
                        >
                            <Target className="h-4 w-4" />
                            Asignar Objetivo
                        </button>
                        
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

                {/* Información adicional */}
                {note && (
                    <div className="mt-6 bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            <strong>Última actualización:</strong> {new Date(note.updated_at).toLocaleString('es-ES')}
                        </p>
                    </div>
                )}
            </div>

            {/* 5. AÑADIR EL MODAL AL FINAL DEL RETURN */}
            {appointmentInfo && (
                <ObjectiveModal
                    isOpen={isObjectiveModalOpen}
                    onClose={(didSubmit) => setIsObjectiveModalOpen(false)}
                    patientId={appointmentInfo.patient}
                    appointmentId={appointmentInfo.id}
                />
            )}
        </>
    );
}

export default SessionNotePage;