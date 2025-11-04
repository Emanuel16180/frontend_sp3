// src/pages/PsychologistAvailabilityPage.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import Modal from '../components/Modal';

// --- Constantes de Estilo ---
const btnDestructive = "w-8 h-8 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors";
const btnGhost = "w-full p-3 mt-4 border-2 border-dashed border-accent text-accent rounded-lg font-semibold hover:bg-accent/10 transition-colors flex items-center justify-center gap-2";
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center";
const btnOutline = "px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors";

// --- INICIO DEL COMPONENTE (una sola vez) ---
function PsychologistAvailabilityPage() {
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- Estados para el Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDayId, setSelectedDayId] = useState(null);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('12:00');
    
    const weekdays = [
        { id: 0, name: 'Lunes' }, { id: 1, name: 'Martes' },
        { id: 2, name: 'Miércoles' }, { id: 3, name: 'Jueves' },
        { id: 4, name: 'Viernes' }, { id: 5, name: 'Sábado' },
        { id: 6, name: 'Domingo' }
    ];

    // --- Definición de Funciones ---

    const fetchAvailability = async () => {
        try {
            // Solución anti-caché (headers + timestamp)
            const url = `/appointments/availability/?_t=${new Date().getTime()}`;
            const response = await apiClient.get(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
            
            let data = [];
            if (response.data && response.data.results) {
                data = response.data.results;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            }
            
            setAvailability(data);
            
            // --- CONSOLE.LOG 1 ---
            // Muestra los datos crudos recibidos de la API
            console.log("DATOS RECIBIDOS DESDE LA API:", data);

        } catch (err) {
            setError('No se pudo cargar tu disponibilidad.');
            toast.error('No se pudo cargar tu disponibilidad.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (dayId) => {
        setSelectedDayId(dayId);
        setStartTime('09:00');
        setEndTime('12:00');
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!startTime || !endTime) {
            toast.error("Ambos campos son requeridos.");
            return;
        }
        try {
            await apiClient.post('/appointments/availability/', {
                weekday: selectedDayId,
                start_time: startTime,
                end_time: endTime,
            });
            toast.success('Horario añadido con éxito.');
            fetchAvailability(); // Recarga la lista
            setIsModalOpen(false);
        } catch (err) {
            let errorMessage = 'Error al añadir el horario.';
            if (err.response && err.response.data) {
                errorMessage = Object.values(err.response.data).join(' ');
            }
            toast.error(errorMessage);
        }
    };

    const handleDeleteTimeSlot = async (slotId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este horario?')) {
            try {
                await apiClient.delete(`/appointments/availability/${slotId}/`);
                toast.success('Horario eliminado.');
                fetchAvailability(); // Recarga la lista
            } catch (err) {
                toast.error('No se pudo eliminar el horario.');
            }
        }
    };

    // --- useEffect (se llama 1 vez al cargar) ---
    useEffect(() => {
        fetchAvailability();
    }, []);

    // --- Renderizado ---
    if (loading) return <p className="text-center text-muted-foreground">Cargando tu disponibilidad...</p>;
    if (error) return <p className="text-center text-destructive">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-4">Gestionar mi Disponibilidad Semanal</h1>
            <p className="text-muted-foreground mb-8">Define los bloques de tiempo en los que estarás disponible para atender citas.</p>
            
            {/* Grid de días de la semana */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {weekdays.map(day => {
                    
                    // --- CONSOLE.LOG 2 ---
                    // Filtra los datos y nos muestra qué encontró para CADA día
                    const slotsForDay = availability.filter(slot => slot.weekday === day.id);
                    console.log(`Para ${day.name} (ID: ${day.id}), se encontraron ${slotsForDay.length} slots:`, slotsForDay);
                    // --------------------

                    return (
                        <div key={day.id} className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                            <h3 className="text-xl font-semibold text-primary mb-4">{day.name}</h3>
                            
                            <div className="space-y-2">
                                {/* Usamos la variable 'slotsForDay' que creamos arriba */}
                                {slotsForDay.map(slot => (
                                    <div key={slot.id} className="flex justify-between items-center bg-background p-3 rounded-lg border border-border">
                                        <span className="font-semibold text-foreground">
                                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                        </span>
                                        <button onClick={() => handleDeleteTimeSlot(slot.id)} className={btnDestructive} title="Eliminar horario">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => handleOpenModal(day.id)} className={btnGhost}>
                                <Plus className="h-4 w-4" />
                                Añadir bloque
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Modal para añadir horario */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-2xl font-semibold text-primary mb-6">Añadir Nuevo Bloque de Horario</h2>
                <form onSubmit={handleModalSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-foreground mb-2">Día</label>
                        <input 
                            type="text"
                            value={weekdays.find(d => d.id === selectedDayId)?.name || ''}
                            disabled
                            className="w-full p-3 bg-muted border border-border rounded-lg text-muted-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2" htmlFor="startTime">Hora de Inicio</label>
                            <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2" htmlFor="endTime">Hora de Fin</label>
                            <input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" className={btnOutline} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className={btnPrimary}>Guardar Horario</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default PsychologistAvailabilityPage;