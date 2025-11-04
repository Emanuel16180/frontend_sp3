// src/pages/MyAppointmentsPage.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { toast } from 'react-toastify'; // <-- IMPORTA TOAST

// --- Constantes de Clases de Tailwind ---
// (Puedes moverlas a main.jsx si quieres usarlas globalmente)
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center";
const btnSecondary = "px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-sm text-center";
const btnDestructive = "px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-colors text-sm text-center";

// Helper para las "pills" de estado
const getPillClasses = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-muted text-muted-foreground';
  }
};


function MyAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para reprogramación
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Estados para calificaciones
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewingAppointment, setReviewingAppointment] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Obtener tipo de usuario desde localStorage
    const userType = localStorage.getItem('userType');

    // --- Tu lógica de JS (fetchAppointments, handleUpdateStatus) no cambia ---
    const fetchAppointments = async () => {
        try {
            const response = await apiClient.get('/appointments/appointments/');
            setAppointments(response.data.results);
        } catch (err) {
            setError('No se pudieron cargar tus citas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleUpdateStatus = async (apptId, newStatus) => {
        const actionText = newStatus === 'cancelled' ? 'cancelar' : 'confirmar';
        
        if (!window.confirm(`¿Estás seguro de que quieres ${actionText} esta cita?`)) {
            return;
        }

        try {
            const response = await apiClient.patch(`/appointments/appointments/${apptId}/`, {
                status: newStatus
            });
            
            console.log(`Respuesta del backend al ${actionText}:`, response.data);
            
            // Actualización mejorada que preserva todos los datos existentes
            setAppointments(prevAppointments => 
                prevAppointments.map(appt => 
                    appt.id === apptId 
                        ? {
                            ...appt, // Mantener todos los datos originales
                            status: newStatus, // Actualizar el estado
                            status_display: newStatus === 'cancelled' ? 'Cancelada' : 'Confirmada', // Actualizar el display
                            ...response.data // Sobrescribir con datos del backend si existen
                        }
                        : appt 
                )
            );
            toast.success(`¡Cita ${actionText}da exitosamente!`);

        } catch (err) {
            console.error(`Error al ${actionText}:`, err);
            toast.error(`Error al ${actionText} la cita. Por favor, inténtalo de nuevo.`);
        }
    };

    // Función para abrir el modal de reprogramación
    const handleOpenReschedule = (appointment) => {
        setSelectedAppointment(appointment);
        setNewDate('');
        setNewTime('');
        setAvailableSlots([]);
        setShowRescheduleModal(true);
    };

    // Función para cerrar el modal
    const handleCloseReschedule = () => {
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        setNewDate('');
        setNewTime('');
        setAvailableSlots([]);
    };

    // Función para obtener horarios disponibles cuando se selecciona una fecha
    const fetchAvailableSlots = async (date) => {
        if (!selectedAppointment || !date) return;
        
        setLoadingSlots(true);
        try {
            // Usar la misma URL que funciona en ProfessionalDetailPage
            const response = await apiClient.get(
                `/appointments/psychologist/${selectedAppointment.psychologist}/schedule/`
            );
            
            // Buscar el día específico en el schedule
            const selectedDay = response.data.schedule?.find(day => day.date === date);
            
            if (selectedDay && selectedDay.time_slots) {
                // Extraer solo los horarios disponibles
                const availableTimeSlots = selectedDay.time_slots
                    .filter(slot => slot.is_available)
                    .map(slot => slot.start_time);
                setAvailableSlots(availableTimeSlots);
            } else {
                setAvailableSlots([]);
            }
        } catch (err) {
            console.error('Error al obtener horarios disponibles:', err);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Función para manejar el cambio de fecha
    const handleDateChange = (date) => {
        setNewDate(date);
        setNewTime(''); // Resetear la hora cuando cambia la fecha
        fetchAvailableSlots(date);
    };

    // Función para reprogramar la cita
    const handleReschedule = async () => {
        if (!newDate || !newTime) {
            toast.warning('Por favor selecciona una fecha y hora.');
            return;
        }

        try {
            const response = await apiClient.patch(
                `/appointments/appointments/${selectedAppointment.id}/`,
                {
                    appointment_date: newDate,
                    start_time: newTime,
                },
            );

            console.log('Respuesta del backend al reprogramar:', response.data);

            // En lugar de usar solo la respuesta del backend (que puede estar incompleta),
            // vamos a actualizar manualmente los campos que sabemos que cambiaron
            setAppointments(prevAppointments => 
                prevAppointments.map(appt => 
                    appt.id === selectedAppointment.id 
                        ? {
                            ...appt, // Mantener todos los datos originales
                            appointment_date: newDate, // Actualizar fecha
                            start_time: newTime, // Actualizar hora
                            ...response.data // Sobrescribir con cualquier dato nuevo del backend
                        }
                        : appt 
                )
            );

            toast.success('¡Cita reprogramada exitosamente!');
            handleCloseReschedule();

        } catch (err) {
            console.error('Error al reprogramar:', err);
            const errorMessage = err.response?.data?.detail || 
                               err.response?.data?.error || 
                               'No se pudo reprogramar la cita. El horario ya no está disponible.';
            toast.error(errorMessage);
        }
    };

    // Funciones para el modal de calificaciones
    const handleOpenReviewModal = (appointment) => {
        setReviewingAppointment(appointment);
        setShowReviewModal(true);
        setRating(0);
        setComment('');
    };

    const handleCloseReviewModal = () => {
        setShowReviewModal(false);
        setReviewingAppointment(null);
        setRating(0);
        setComment('');
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            toast.warning("Por favor, selecciona una calificación.");
            return;
        }

        setIsSubmittingReview(true);

        try {
            await apiClient.post('/professionals/reviews/create/', {
                appointment: reviewingAppointment.id,
                rating: rating,
                comment: comment,
            });

            toast.success("¡Gracias por tu calificación!");
            handleCloseReviewModal();
            
            // Actualizar el estado local para mostrar que ya fue calificada
            setAppointments(prevAppointments => 
                prevAppointments.map(appt => 
                    appt.id === reviewingAppointment.id 
                        ? { ...appt, has_review: true }
                        : appt 
                )
            );

        } catch (error) {
            console.error('Error al enviar calificación:', error);
            const errorMessage = error.response?.data?.detail || 
                               error.response?.data?.error || 
                               "No se pudo enviar la calificación.";
            toast.error(errorMessage);
        } finally {
            setIsSubmittingReview(false);
        }
    };
    // --- Fin de la lógica de JS ---


    if (loading) return <p className="text-center text-muted-foreground">Cargando tus citas...</p>;
    if (error) return <p className="text-center text-destructive">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-8">Mis Citas</h1>
            
            {appointments.length === 0 ? (
                <div className="bg-card text-card-foreground p-12 rounded-xl text-center shadow-lg">
                    <h3 className="text-2xl font-semibold text-primary mb-2">Aún no tienes citas</h3>
                    <p className="text-muted-foreground">
                        Puedes <Link to="/dashboard" className="font-medium text-primary hover:underline">explorar psicólogos</Link> para agendar tu primera sesión.
                    </p>
                </div>
            ) : (
                // Reemplazamos .agenda-grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map(appt => (
                        // Reemplazamos .clinic-card
                        <div key={appt.id} className="bg-background border border-border p-5 rounded-xl shadow flex flex-col gap-4">
                            
                            {/* Reemplazamos .card-top */}
                            <header className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xl font-bold">
                                  {appt.psychologist_name?.charAt(0) ?? 'P'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-primary">{appt.psychologist_name ?? 'Psicólogo'}</h3>
                                    {/* Reemplazamos .pill */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPillClasses(appt.status ?? 'pending')}`}>
                                        {appt.status_display ?? 'Estado desconocido'}
                                    </span>
                                </div>
                            </header>

                            {/* Reemplazamos .card-info y .kv */}
                            <div className="border-t border-border pt-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Fecha</span>
                                    <strong className="text-foreground">{appt.appointment_date ?? 'No disponible'}</strong>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Hora</span>
                                    <strong className="text-foreground">{appt.start_time ?? 'No disponible'}</strong>
                                </div>
                            
                                {appt.status === 'confirmed' && appt.meeting_link && (
                                    <div className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-border/50">
                                        <span className="text-muted-foreground">Enlace</span>
                                        <a href={appt.meeting_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                                          Unirse a videollamada
                                        </a>
                                    </div>
                                )}
                            </div>
                            
                            {/* Reemplazamos .card-actions */}
                            <footer className="flex flex-col sm:flex-row gap-2 justify-end mt-auto pt-4 border-t border-border">
                                {/* 1. Acciones para citas PENDIENTES */}
                                {appt.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(appt.id, 'confirmed')} className={btnPrimary}>
                                            Confirmar
                                        </button>
                                        <Link to={`/chat/${appt.id}`} className={btnSecondary}>Chat</Link>
                                        <button onClick={() => handleOpenReschedule(appt)} className={btnSecondary}>
                                            Reprogramar
                                        </button>
                                        <button onClick={() => handleUpdateStatus(appt.id, 'cancelled')} className={btnDestructive}>
                                            Cancelar
                                        </button>
                                    </>
                                )}

                                {/* 2. Acciones para citas CONFIRMADAS */}
                                {appt.status === 'confirmed' && (
                                    <>
                                        <Link to={`/chat/${appt.id}`} className={btnPrimary}>Ir al Chat</Link>
                                        <button onClick={() => handleOpenReschedule(appt)} className={btnSecondary}>
                                            Reprogramar
                                        </button>
                                        <button onClick={() => handleUpdateStatus(appt.id, 'cancelled')} className={btnDestructive}>
                                            Cancelar Cita
                                        </button>
                                    </>
                                )}

                                {/* 3. Sin acciones */}
                                {['completed', 'cancelled'].includes(appt.status) && (
                                    <em className="text-muted-foreground text-sm text-right w-full">Cita {(appt.status_display ?? 'finalizada').toLowerCase()}</em>
                                )}

                                {/* 4. Botón de Calificación para Pacientes (solo citas completadas) */}
                                {userType === 'patient' && appt.status === 'completed' && (
                                    <>
                                        {appt.has_review ? (
                                            <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                                                ✓ Calificada
                                            </span>
                                        ) : (
                                            <button 
                                                onClick={() => handleOpenReviewModal(appt)} 
                                                className={btnPrimary}
                                            >
                                                ⭐ Calificar
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* 5. Botón de Notas para Psicólogos */}
                                {userType === 'professional' && ['completed', 'confirmed'].includes(appt.status) && (
                                    <Link 
                                        to={`/appointment/${appt.id}/note`} 
                                        className={btnSecondary}
                                    >
                                        📝 Ver/Añadir Nota
                                    </Link>
                                )}
                            </footer>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Reprogramación */}
            <Modal isOpen={showRescheduleModal} onClose={handleCloseReschedule}>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-primary">Reprogramar Cita</h2>
                    
                    {selectedAppointment && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg">{selectedAppointment.psychologist_name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Cita actual: {selectedAppointment.appointment_date} a las {selectedAppointment.start_time}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Selector de fecha */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Nueva fecha:
                            </label>
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Selector de hora */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Nueva hora:
                            </label>
                            {loadingSlots ? (
                                <p className="text-muted-foreground">Cargando horarios disponibles...</p>
                            ) : availableSlots.length > 0 ? (
                                <select
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Selecciona una hora</option>
                                    {availableSlots.map((slot, index) => (
                                        <option key={`${slot}-${index}`} value={slot}>
                                            {slot}
                                        </option>
                                    ))}
                                </select>
                            ) : newDate ? (
                                <p className="text-muted-foreground">
                                    No hay horarios disponibles para esta fecha. Selecciona otra fecha.
                                </p>
                            ) : (
                                <p className="text-muted-foreground">
                                    Primero selecciona una fecha para ver los horarios disponibles.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={handleCloseReschedule}
                            className={btnSecondary}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleReschedule}
                            disabled={!newDate || !newTime}
                            className={`${btnPrimary} ${(!newDate || !newTime) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Reprogramar Cita
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Calificación */}
            <Modal isOpen={showReviewModal} onClose={handleCloseReviewModal}>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-primary">Calificar Sesión</h2>
                    
                    {reviewingAppointment && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg">{reviewingAppointment.psychologist_name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Sesión del {reviewingAppointment.appointment_date} a las {reviewingAppointment.start_time}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Selector de calificación */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3">
                                ¿Cómo calificarías esta sesión? *
                            </label>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`text-3xl transition-colors ${
                                            star <= rating 
                                                ? 'text-yellow-400 hover:text-yellow-500' 
                                                : 'text-gray-300 hover:text-yellow-300'
                                        }`}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-sm text-muted-foreground mt-2">
                                {rating > 0 && `${rating} de 5 estrellas`}
                            </p>
                        </div>

                        {/* Comentario opcional */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Comentario (opcional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Comparte tu experiencia para ayudar a otros pacientes..."
                                rows={4}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={handleCloseReviewModal}
                            className={btnSecondary}
                            disabled={isSubmittingReview}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmitReview}
                            disabled={rating === 0 || isSubmittingReview}
                            className={`${btnPrimary} ${(rating === 0 || isSubmittingReview) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmittingReview ? 'Enviando...' : 'Enviar Calificación'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default MyAppointmentsPage;