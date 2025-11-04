// src/pages/ProfessionalDetailPage.jsx
import { toast } from 'react-toastify';
import { useState, useEffect, useMemo } from 'react'; // <-- AÑADIDO useMemo
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api';
// Importamos los iconos
import { Star, MapPin, Clock, BookOpen, Briefcase, ChevronLeft, Calendar, CheckCircle, Package, Zap, DollarSign, Loader } from 'lucide-react'; // <-- AÑADIDOS
// Importamos el componente de reseñas
import ReviewsList from '../components/ReviewsList';
// Importamos el componente de pago
import PaymentButton from '../components/PaymentButton';
// Importamos el componente de información de pago
import PaymentInfo from '../components/PaymentInfo';

// --- Constantes de Estilo ---
const btnBookable = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center cursor-pointer";
const btnBooked = "px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed text-sm text-center";
const btnPrimary = "w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center";
const btnDisabled = "w-full px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed text-center"; // <-- AÑADIDO

// --- Componente de Estrellas (sin cambios) ---
function StarRating({ rating = 0 }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// --- Componente de Pestañas (Tabs) ---
function Tabs({ activeTab, setActiveTab }) {
  const tabs = ["Acerca de", "Experiencia", "Especialidades", "Planes", "Reseñas"]; // <-- MODIFICADO: AÑADIDO "Planes"
  const getClasses = (tabName) => {
    return activeTab === tabName
      ? "pb-2 border-b-2 border-primary text-primary font-semibold"
      : "pb-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground";
  };

  return (
    <nav className="flex space-x-8 border-b border-border mb-6 overflow-x-auto">
      {tabs.map(tab => (
        <button key={tab} className={`flex-shrink-0 ${getClasses(tab)}`} onClick={() => setActiveTab(tab)}>
          {tab}
        </button>
      ))}
    </nav>
  );
}

// --- Componente Principal ---
function ProfessionalDetailPage() {
    const [professional, setProfessional] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [reviewsData, setReviewsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const { id } = useParams();

    // Estado para la nueva UI
    const [activeTab, setActiveTab] = useState("Acerca de");
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    
    // --- NUEVOS ESTADOS PARA PLANES (FLUJO B y C) ---
    const [availablePlans, setAvailablePlans] = useState([]); // Planes para comprar
    const [myPlans, setMyPlans] = useState([]); // Planes ya comprados
    const [selectedPatientPlanId, setSelectedPatientPlanId] = useState(null); // Plan seleccionado para agendar
    const [isPurchasing, setIsPurchasing] = useState(null); // ID del plan que se está comprando
    const [loadingSchedule, setLoadingSchedule] = useState(false); // Loading para agendar

    // --- Función para obtener el horario (separada para reutilización) ---
    const fetchSchedule = async (userId) => {
        if (!userId) return;
        setLoadingSchedule(true);
        try {
            const scheduleResponse = await apiClient.get(`/appointments/psychologist/${userId}/schedule/`);
            setSchedule(scheduleResponse.data);
            
            // Si no hay fecha seleccionada O la fecha seleccionada ya no es válida
            const currentSelectedDateStillValid = scheduleResponse.data?.schedule.find(d => d.date === selectedDate?.date && d.is_available);
            
            if (!selectedDate || !currentSelectedDateStillValid) {
                const firstAvailableDay = scheduleResponse.data?.schedule.find(d => d.is_available);
                if (firstAvailableDay) {
                    setSelectedDate(firstAvailableDay);
                } else {
                    setSelectedDate(null); // No hay días disponibles
                }
            } else {
                // Actualiza la fecha seleccionada con los nuevos datos
                const updatedSelectedDay = scheduleResponse.data?.schedule.find(d => d.date === selectedDate.date);
                if (updatedSelectedDay) {
                    setSelectedDate(updatedSelectedDay);
                }
            }
            
            return scheduleResponse.data;
        } catch (err) {
            console.error("Error al cargar el horario:", err);
            throw err;
        } finally {
            setLoadingSchedule(false);
        }
    };

    // --- Lógica de Carga de Datos (ACTUALIZADA) ---
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // 1. Obtener información del usuario actual
                apiClient.get('/users/profile/').then(res => setCurrentUser(res.data)).catch(console.error);

                // 2. Primero obtenemos el perfil profesional usando el ID de la URL
                const profResponse = await apiClient.get(`/professionals/${id}/`);
                setProfessional(profResponse.data);
                
                // 3. Extraemos el user_id del perfil para la segunda llamada
                const userId = profResponse.data.user_id;
                
                if (userId) {
                    // 4. Cargar horario, reseñas, y planes en paralelo
                    await Promise.all([
                        fetchSchedule(userId),
                        
                        // Cargar Reseñas
                        apiClient.get(`/professionals/${id}/reviews/`)
                            .then(res => setReviewsData(res.data))
                            .catch(err => {
                                console.error("Error al cargar reseñas:", err);
                                setReviewsData({ total_reviews: 0, reviews: [], average_rating: 0 });
                            }),
                        
                        // FLUJO B: Ver planes disponibles de este psicólogo
                        apiClient.get(`/payments/plans/list/?psychologist_id=${userId}`)
                            .then(res => setAvailablePlans(res.data.results || res.data))
                            .catch(err => console.error("Error al cargar planes disponibles:", err)),
                        
                        // FLUJO C: Ver mis planes ya comprados
                        apiClient.get(`/payments/plans/my-plans/`)
                            .then(res => setMyPlans(res.data.results || res.data))
                            .catch(err => console.error("Error al cargar mis planes:", err)),
                    ]);
                }

                if (!userId) {
                    console.error("El user_id no fue encontrado en la respuesta del perfil.");
                    setError('No se pudo obtener la información de disponibilidad del profesional.');
                }

            } catch (err) {
                console.error("Error al cargar los datos del profesional:", err);
                setError('No se pudo cargar la información del profesional.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    // --- FLUJO B (Acción 2): Comprar un Plan ---
    const handlePurchasePlan = async (planId) => {
        setIsPurchasing(planId);
        try {
            const response = await apiClient.post('/payments/plans/purchase/', {
                plan_id: planId
            });
            
            // Redirigir a Stripe para el pago
            const { checkout_url } = response.data;
            if (checkout_url) {
                window.location.href = checkout_url;
            } else {
                throw new Error("No se recibió una URL de pago.");
            }
        } catch (err) {
            console.error("Error al iniciar la compra del plan:", err);
            toast.error(err.response?.data?.error || "No se pudo procesar la compra.");
            setIsPurchasing(null);
        }
    };
    
    // --- FLUJO C (Acción 2): Agendar Cita (ACTUALIZADO) ---
    // Esta función AHORA maneja la lógica de "Usar Plan"
    // La lógica de pago individual se queda en <PaymentButton>
    const handleBookAppointment = async () => {
        if (!selectedDate || !selectedTime) {
            toast.warning('Por favor, selecciona una fecha y hora disponibles.');
            return;
        }

        // Si se seleccionó un plan, agendar sin pagar
        if (selectedPatientPlanId) {
            setLoadingSchedule(true); // Usamos el loading de la agenda
            try {
                const appointmentData = {
                    psychologist: professional.user_id,
                    appointment_date: selectedDate.date,
                    start_time: selectedTime,
                    patient_plan_id: selectedPatientPlanId // ¡La clave!
                };
                
                await apiClient.post('/appointments/appointments/', appointmentData);
                
                toast.success(`¡Cita reservada exitosamente usando tu plan!`);
                
                // Refrescar todo
                await Promise.all([
                    fetchSchedule(professional.user_id),
                    apiClient.get(`/payments/plans/my-plans/`).then(res => setMyPlans(res.data.results || res.data))
                ]);
                
                setSelectedTime(null);
                setSelectedPatientPlanId(null);
                
            } catch (err) {
                console.error('Error al agendar con plan:', err);
                toast.error(err.response?.data?.error || 'No se pudo agendar la cita con tu plan.');
            } finally {
                setLoadingSchedule(false);
            }
        }
        // El caso else (pago individual) es manejado por el componente PaymentButton
        // Tu lógica original de PaymentButton se encarga de esto, no necesitamos el 'handleBookAppointment' original
    };

    // --- Lógica para filtrar mis planes (Flujo C) ---
    const usablePlans = useMemo(() => {
        if (!professional || !myPlans) return [];
        // Filtra planes que sean de este psicólogo y que aún tengan sesiones
        return myPlans.filter(p => 
            p.plan.psychologist_id === professional.user_id && p.sessions_remaining > 0
        );
    }, [myPlans, professional]);


    if (loading) return <p className="text-center text-muted-foreground">Cargando perfil y disponibilidad...</p>;
    if (error) return <p className="text-center text-destructive">{error}</p>;
    if (!professional || !schedule) return <p className="text-center text-muted-foreground">No hay datos para mostrar.</p>;

    // --- JSX REFACTORIZADO ---
    return (
        <main className="max-w-7xl mx-auto p-4">
            <Link to="/dashboard" className="flex items-center gap-1 text-primary font-medium hover:underline mb-6">
                <ChevronLeft className="h-4 w-4" />
                Volver a resultados
            </Link>

            {/* Encabezado del Perfil (sin cambios) */}
            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border mb-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-5xl font-semibold text-primary">
                            {professional.full_name.split(" ").map(n => n[0]).join("")}
                        </span>
                    </div>
                    <div className="flex-1 space-y-3">
                        <h1 className="text-3xl font-bold text-foreground">{professional.full_name}</h1>
                        <p className="text-lg font-medium text-primary">{professional.specializations.map(s => s.name).join(', ')}</p>
                        <div className="flex items-center gap-2">
                            <StarRating rating={professional.average_rating || 0} />
                            <span className="text-sm font-medium">{professional.average_rating || 0}</span>
                            <span className="text-sm text-muted-foreground">({professional.total_reviews || 0} reseñas)</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Disponible hoy</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{professional.city || 'Ubicación no especificada'}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {professional.accepts_online_sessions && <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">Online</span>}
                            {professional.accepts_in_person_sessions && <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">Presencial</span>}
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end justify-between gap-4 sm:min-w-[170px]">
                        <div className="text-left sm:text-right">
                            <div className="flex items-center gap-1 text-3xl font-bold text-primary">
                                <span>Bs. {professional.consultation_fee}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">por consulta</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal (Pestañas y Agenda) */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Columna Izquierda: Pestañas de Info */}
                <div className="flex-1 lg:max-w-2xl">
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    
                    {activeTab === "Acerca de" && (
                        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                            <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Biografía
                            </h2>
                            <p className="text-foreground whitespace-pre-line">{professional.bio}</p>
                        </div>
                    )}
                    {activeTab === "Experiencia" && (
                        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                            <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Educación y Experiencia
                            </h2>
                            <p className="text-foreground font-semibold">Años de experiencia: {professional.experience_years}</p>
                            <p className="text-foreground whitespace-pre-line mt-2">{professional.education}</p>
                        </div>
                    )}
                    {activeTab === "Especialidades" && (
                        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                            <h2 className="text-xl font-semibold text-primary mb-3">Especialidades</h2>
                            <ul className="list-disc list-inside space-y-2 text-foreground">
                                {professional.specializations.map(s => <li key={s.id}>{s.name}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* --- INICIO FLUJO B (Idea 2A): Tab de Planes --- */}
                    {activeTab === "Planes" && (
                        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border space-y-6">
                            <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Planes Disponibles
                            </h2>
                            {availablePlans.length === 0 ? (
                                <p className="text-muted-foreground">Este profesional no ofrece planes de cuidado actualmente.</p>
                            ) : (
                                availablePlans.map(plan => (
                                    <div key={plan.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start">
                                        <div className="flex-1 mb-4 md:mb-0">
                                            <h3 className="font-bold text-lg text-foreground">{plan.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                                            <div className="flex gap-4">
                                                <span className="text-sm font-medium">
                                                    Sesiones: <strong className="text-primary">{plan.number_of_sessions}</strong>
                                                </span>
                                                <span className="text-sm font-medium">
                                                    Precio: <strong className="text-primary">Bs. {plan.total_price}</strong>
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handlePurchasePlan(plan.id)}
                                            disabled={isPurchasing === plan.id}
                                            className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-sm flex items-center justify-center gap-2 disabled:bg-muted"
                                        >
                                            {isPurchasing === plan.id ? (
                                                <Loader className="animate-spin h-4 w-4" />
                                            ) : (
                                                <DollarSign className="h-4 w-4" />
                                            )}
                                            {isPurchasing === plan.id ? "Procesando..." : "Comprar Plan"}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {/* --- FIN FLUJO B --- */}

                    {activeTab === "Reseñas" && (
                        <ReviewsList data={reviewsData} />
                    )}
                </div>

                {/* Columna Derecha: Agenda */}
                <div className="w-full lg:w-96 flex-shrink-0">
                    {/* Información de Pago */}
                    <PaymentInfo />
                    
                    <div className="bg-card p-6 rounded-xl shadow-lg border border-border sticky top-24">
                        <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Seleccionar Fecha y Hora
                        </h2>
                        
                        {/* Selección de Fecha */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {schedule.schedule.map(day => {
                                const isSelected = day.date === selectedDate?.date;
                                const baseClasses = "p-2 rounded-lg text-center cursor-pointer border";
                                const stateClasses = isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-input text-foreground border-border hover:bg-muted";
                                const disabledClasses = !day.is_available ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : stateClasses;

                                return (
                                    <button 
                                        key={day.date} 
                                        disabled={!day.is_available}
                                        className={`${baseClasses} ${disabledClasses}`}
                                        onClick={() => { setSelectedDate(day); setSelectedTime(null); setSelectedPatientPlanId(null); }}
                                    >
                                        <span className="text-xs font-medium uppercase">{day.day_name.substring(0,3)}</span>
                                        <span className="block text-sm font-bold">{day.date.substring(8, 10)}</span>
                                        <span className="block text-xs">{day.date.substring(5, 7)}</span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Selección de Hora */}
                        <div className="border-t border-border pt-4 mb-4">
                            <h3 className="font-semibold text-foreground mb-3">Horas disponibles</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedDate ? (
                                    selectedDate.time_slots.length > 0 ? (
                                        selectedDate.time_slots.map((slot, index) => (
                                            slot.is_available ? (
                                                <button 
                                                    key={`${slot.start_time}-${index}`} 
                                                    className={`
                                                        ${btnBookable} 
                                                        ${selectedTime === slot.start_time ? 'ring-2 ring-offset-2 ring-primary' : ''}
                                                    `}
                                                    onClick={() => setSelectedTime(slot.start_time)}
                                                >
                                                    {slot.start_time}
                                                </button>
                                            ) : (
                                                <button key={`${slot.start_time}-${index}`} className={btnBooked} disabled>
                                                    Ocupado
                                                </button>
                                            )
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No hay horarios disponibles este día.</p>
                                    )
                                ) : (
                                    <p className="text-sm text-muted-foreground">Selecciona una fecha.</p>
                                )}
                            </div>
                        </div>

                        {/* --- INICIO FLUJO C (Idea 3A y 3B) --- */}
                        {selectedTime && (
                            <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-4">
                                <h3 className="font-semibold text-primary">¿Cómo deseas agendar?</h3>
                                
                                {/* Opción 1: Usar un Plan Comprado */}
                                {usablePlans.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-foreground">Usar un plan comprado:</p>
                                        {usablePlans.map(p => (
                                            <label 
                                                key={p.id}
                                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${selectedPatientPlanId === p.id ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'bg-background border-border'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentOption"
                                                    checked={selectedPatientPlanId === p.id}
                                                    onChange={() => setSelectedPatientPlanId(p.id)}
                                                    className="h-4 w-4 text-primary focus:ring-primary"
                                                />
                                                <div>
                                                    <span className="font-semibold text-sm">{p.plan.title}</span>
                                                    <span className="block text-xs text-muted-foreground">{p.sessions_remaining} sesiones restantes</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Opción 2: Pagar Cita Individual */}
                                <label 
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${selectedPatientPlanId === null ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'bg-background border-border'}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentOption"
                                        checked={selectedPatientPlanId === null}
                                        onChange={() => setSelectedPatientPlanId(null)}
                                        className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm">Pagar cita individual</span>
                                        <span className="block text-xs text-muted-foreground">Bs. {professional.consultation_fee}</span>
                                    </div>
                                </label>
                                
                                <div className="border-t border-border pt-4">
                                    {/* Mostrar Botón de Pago o Botón de Agendar con Plan */}
                                    {selectedPatientPlanId === null ? (
                                        // Pagar con Stripe
                                        <PaymentButton
                                            appointmentData={{
                                                psychologist: professional.user_id,
                                                appointment_date: selectedDate.date,
                                                start_time: selectedTime,
                                                price: professional.consultation_fee
                                            }}
                                            user={currentUser}
                                            onSuccess={() => {
                                                toast.success('¡Pago exitoso! Tu cita ha sido confirmada.');
                                                fetchSchedule(professional.user_id);
                                                setSelectedTime(null);
                                            }}
                                            onError={(error) => {
                                                toast.error(`Error en el pago: ${error}`);
                                            }}
                                            className="w-full"
                                        >
                                            Pagar y Confirmar Cita
                                        </PaymentButton>
                                    ) : (
                                        // Agendar con Plan (sin pago)
                                        <button
                                            onClick={handleBookAppointment}
                                            disabled={loadingSchedule}
                                            className={`${loadingSchedule ? btnDisabled : btnPrimary} flex items-center justify-center gap-2`}
                                        >
                                            {loadingSchedule ? <Loader className="animate-spin h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                            Usar Plan y Confirmar
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* --- FIN FLUJO C --- */}
                        
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ProfessionalDetailPage;