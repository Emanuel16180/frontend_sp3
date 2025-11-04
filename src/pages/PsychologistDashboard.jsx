// src/pages/PsychologistDashboard.jsx

import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api';
import Modal from '../components/Modal'; // Tu Modal refactorizado
import ReferralModal from '../components/ReferralModal'; // <-- IMPORTAR EL NUEVO MODAL
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Para notificaciones
import { CornerUpRight } from 'lucide-react'; // <-- IMPORTAR NUEVO ICONO

// --- Constantes de Clases de Tailwind ---
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm";
const btnSecondary = "px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-sm";
const btnGhost = "px-4 py-2 bg-transparent border border-secondary text-secondary rounded-lg font-semibold hover:bg-secondary/10 transition-colors";
// Nuevo estilo para el botón de derivar
const btnWarning = "px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-sm flex items-center gap-1";


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

function PsychologistDashboard() {
  // ---- Estados existentes ----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [appointmentToComplete, setAppointmentToComplete] = useState(null);

  // --- NUEVOS ESTADOS PARA DERIVACIÓN ---
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [appointmentToRefer, setAppointmentToRefer] = useState(null);

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
  useEffect(() => { fetchAppointments(); }, []);

  // --- Lógica de modales existentes ---
  const handleOpenModal = (appointment) => {
    setSelectedAppt(appointment);
    setMeetingLink(appointment.meeting_link || '');
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppt(null);
    setMeetingLink('');
  };
  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      await apiClient.patch(`/appointments/appointments/${selectedAppt.id}/`, {
        meeting_link: meetingLink,
      });
      toast.success('¡Enlace guardado con éxito!');
      handleCloseModal();
      fetchAppointments();
    } catch (err) {
      toast.error('No se pudo guardar el enlace.');
    }
  };
  const handleOpenCompleteModal = (appointment) => {
    setAppointmentToComplete(appointment);
    setIsCompleteModalOpen(true);
  };
  const handleCompleteAppointment = async () => {
    if (!appointmentToComplete) return;
    try {
      await apiClient.post(`/appointments/appointments/${appointmentToComplete.id}/complete/`);
      toast.success("¡Cita marcada como completada! El paciente ahora puede calificarla.");
      fetchAppointments();
      setIsCompleteModalOpen(false);
      setAppointmentToComplete(null);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "No se pudo completar la cita.";
      toast.error(errorMessage);
    }
  };
  const handleCancelComplete = () => {
    setIsCompleteModalOpen(false);
    setAppointmentToComplete(null);
  };
  
  // --- NUEVAS FUNCIONES PARA EL MODAL DE DERIVACIÓN ---
  const handleOpenReferralModal = (appointment) => {
    setAppointmentToRefer(appointment);
    setIsReferralModalOpen(true);
  };

  const handleCloseReferralModal = (didRefer = false) => {
    setIsReferralModalOpen(false);
    setAppointmentToRefer(null);
    if (didRefer) {
      // Si la derivación fue exitosa (el modal devuelve true)
      // refrescamos la lista de citas.
      fetchAppointments();
    }
  };

  // --- Resto de la lógica (sin cambios) ---
  const getInitials = (fullName = '') => {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  };
  const groupByDateLabel = (list) => {
    const groups = {};
    for (const a of list) {
      const label = a.appointment_date;
      if (!groups[label]) groups[label] = [];
      groups[label].push(a);
    }
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  };
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(a => (statusFilter === 'all' ? true : a.status === statusFilter))
      .filter(a => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (a.patient_name || '').toLowerCase().includes(q)
          || (a.appointment_date || '').toLowerCase().includes(q)
          || (a.start_time || '').toLowerCase().includes(q);
      });
  }, [appointments, statusFilter, query]);
  const stats = useMemo(() => {
    const total = appointments.length;
    const by = (s) => appointments.filter(a => a.status === s).length;
    return {
      total,
      pending: by('pending'),
      confirmed: by('confirmed'),
      cancelled: by('cancelled'),
      completed: by('completed'),
    };
  }, [appointments]);

  if (loading) return <p className="text-center text-muted-foreground">Cargando tus citas...</p>;
  if (error) return <p className="text-center text-destructive">{error}</p>;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <header className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-primary">Agenda Clínica</h1>
            <p className="text-lg text-muted-foreground">Coordina tus sesiones con claridad y calma.</p>
          </div>
        </header>

        {/* Métricas */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md">
            <span className="text-sm text-muted-foreground">Total</span>
            <strong className="block text-2xl font-bold text-primary">{stats.total}</strong>
          </div>
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md">
            <span className="text-sm text-muted-foreground">Pendientes</span>
            <strong className="block text-2xl font-bold text-yellow-600">{stats.pending}</strong>
          </div>
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md">
            <span className="text-sm text-muted-foreground">Confirmadas</span>
            <strong className="block text-2xl font-bold text-green-600">{stats.confirmed}</strong>
          </div>
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md">
            <span className="text-sm text-muted-foreground">Canceladas</span>
            <strong className="block text-2xl font-bold text-destructive">{stats.cancelled}</strong>
          </div>
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md">
            <span className="text-sm text-muted-foreground">Completadas</span>
            <strong className="block text-2xl font-bold text-gray-600">{stats.completed}</strong>
          </div>
        </section>

        {/* Filtros y búsqueda */}
        <section className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all','pending','confirmed','cancelled','completed'].map(s => (
              <button
                key={s}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${statusFilter === s 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'Todas' :
                 s === 'pending' ? 'Pendientes' :
                 s === 'confirmed' ? 'Confirmadas' :
                 s === 'cancelled' ? 'Canceladas' : 'Completadas'}
              </button>
            ))}
          </div>
          <div className="md:w-1/3">
            <input
              type="text"
              placeholder="Buscar paciente, fecha u hora…"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </section>

        {/* Agenda agrupada por fecha */}
        <section className="flex flex-col gap-8">
          {filteredAppointments.length === 0 ? (
            <div className="bg-card text-center p-12 rounded-xl">
              <h3 className="text-xl font-semibold text-card-foreground">Sin resultados</h3>
              <p className="text-muted-foreground">Prueba otro filtro o término de búsqueda.</p>
            </div>
          ) : (
            groupByDateLabel(filteredAppointments).map(([date, items]) => (
              <div className="bg-card p-6 rounded-xl shadow-lg" key={date}>
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <span className="px-4 py-1 bg-secondary text-secondary-foreground rounded-full font-semibold">{date}</span>
                  <span className="text-muted-foreground font-medium">{items.length} {items.length > 1 ? 'citas' : 'cita'}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
                  {items.map(appt => (
                    <article key={appt.id} className="bg-background border border-border p-5 rounded-xl shadow flex flex-col gap-4">
                      <header className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xl font-bold">
                          {getInitials(appt.patient_name)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-primary">{appt.patient_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPillClasses(appt.status)}`}>
                            {appt.status_display}
                          </span>
                        </div>
                      </header>

                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Hora</span>
                          <strong className="text-foreground">{appt.start_time}</strong>
                        </div>
                        <div className="flex justify-between items-center text-sm py-2">
                          <span className="text-muted-foreground">Enlace</span>
                          {appt.meeting_link ? (
                            <a href={appt.meeting_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                              Abrir videollamada
                            </a>
                          ) : (
                            <em className="text-muted-foreground">No añadido</em>
                          )}
                        </div>
                      </div>

                      <footer className="flex flex-wrap gap-2 justify-end mt-auto">
                        {/* --- BOTÓN DE DERIVAR --- */}
                        {(appt.status === 'pending' || appt.status === 'confirmed') && (
                            <button 
                              onClick={() => handleOpenReferralModal(appt)} 
                              className={btnWarning}
                              title="Derivar esta cita a otro colega"
                            >
                                <CornerUpRight className="h-4 w-4" /> Derivar
                            </button>
                        )}
                        
                        {/* Botones existentes */}
                        <button onClick={() => handleOpenModal(appt)} className={btnPrimary}>
                          {appt.meeting_link ? 'Editar enlace' : 'Añadir enlace'}
                        </button>
                        <Link to={`/psychologist/chat/${appt.id}`} className={btnSecondary}>
                          Abrir chat
                        </Link>
                        <Link 
                          to={`/clinical-history/patient/${appt.patient}`} 
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
                          title="Ver historial clínico del paciente"
                        >
                          📋 Historial
                        </Link>
                        {appt.status === 'confirmed' && (
                          <button 
                            onClick={() => handleOpenCompleteModal(appt)} 
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                          >
                            ✅ Completar Cita
                          </button>
                        )}
                        {['completed', 'confirmed'].includes(appt.status) && (
                          <Link to={`/appointment/${appt.id}/note`} className={btnSecondary}>
                            📝 Nota
                          </Link>
                        )}
                      </footer>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* --- MODALES AL FINAL --- */}

      {/* Modal para enlace */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-2xl font-semibold text-primary mb-2">Gestionar enlace</h2>
        {selectedAppt && (
          <p className="text-muted-foreground mb-6">
            Cita con <strong>{selectedAppt.patient_name}</strong> — {selectedAppt.appointment_date} {selectedAppt.start_time}
          </p>
        )}
        <form onSubmit={handleLinkSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Enlace (Google Meet, Zoom, etc.)</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              required
              className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" className={btnGhost} onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className={btnPrimary}>Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación para completar cita */}
      <Modal isOpen={isCompleteModalOpen} onClose={handleCancelComplete}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Completar Cita</h2>
          
          {appointmentToComplete && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                ¿Estás seguro de que quieres marcar como completada la cita con:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">{appointmentToComplete.patient_name}</p>
                <p className="text-sm text-gray-600">
                  {appointmentToComplete.appointment_date} - {appointmentToComplete.start_time}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Una vez completada, el paciente podrá calificar la cita y ya no podrás revertir esta acción.
              </p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button 
              onClick={handleCancelComplete}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleCompleteAppointment}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              ✅ Sí, Completar Cita
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Derivación (NUEVO) */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={handleCloseReferralModal}
        appointment={appointmentToRefer}
      />
    </>
  );
}

export default PsychologistDashboard;