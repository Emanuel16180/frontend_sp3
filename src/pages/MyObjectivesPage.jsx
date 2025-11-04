// src/pages/MyObjectivesPage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import { Loader, CheckCircle, Target, Activity, Zap, BarChart3, CheckSquare, Square } from 'lucide-react';

// Tarjeta de Estadística (CU-43)
function StatCard({ label, value, icon: Icon }) {
    return (
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <span className="text-sm text-muted-foreground">{label}</span>
                <strong className="block text-2xl font-bold text-foreground">{value}</strong>
            </div>
        </div>
    );
}

// Componente de Tarea (CU-47)
function TaskItem({ task, onTaskCompleted }) {
    const [isCompleted, setIsCompleted] = useState(task.is_completed_today);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCheck = async () => {
        if (isCompleted || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await apiClient.post(`/clinical-history/tasks/${task.id}/complete/`, {
                notes: "Completado desde el dashboard."
            });
            
            setIsCompleted(true);
            onTaskCompleted(task.id);
            toast.success(`¡Tarea "${task.title}" completada!`); // <-- CORREGIDO (task.title)

        } catch (err) {
            console.error("Error al completar la tarea:", err);
            toast.error("No se pudo marcar la tarea. Inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
            <button
                onClick={handleCheck}
                disabled={isCompleted || isSubmitting}
                className="flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
                {isCompleted ? (
                    <CheckSquare className="h-5 w-5 text-green-500" />
                ) : (
                    <Square className="h-5 w-5 text-muted-foreground hover:text-primary" />
                )}
            </button>
            {/* --- CORRECCIÓN 1: De task.name a task.title --- */}
            <span className={`flex-1 text-sm ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {task.title}
            </span>
            {isSubmitting && <Loader className="animate-spin h-4 w-4 text-primary" />}
        </div>
    );
}

// --- NUEVO: Helper para traducir la recurrencia ---
const getRecurrenceLabel = (recurrence) => {
    switch (recurrence) {
        case 'daily': return 'Diarias';
        case 'weekly': return 'Semanales';
        case 'once': return 'Únicas';
        default: return 'Semanales'; // Fallback
    }
};

// Componente Principal
function MyObjectivesPage() {
    const [stats, setStats] = useState(null);
    const [objectives, setObjectives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsResponse, objectivesResponse] = await Promise.all([
                apiClient.get('/clinical-history/objectives/my/stats/'),
                apiClient.get('/clinical-history/objectives/my/')
            ]);
            
            setStats(statsResponse.data.stats);
            setObjectives(objectivesResponse.data.results || objectivesResponse.data);
            
        } catch (err) {
            console.error("Error al cargar objetivos o estadísticas:", err);
            setError("No se pudo cargar tu plan de objetivos. Inténtalo más tarde.");
            toast.error("Error al cargar tu plan de objetivos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTaskCompleted = (completedTaskId) => {
        setObjectives(prevObjectives => 
            prevObjectives.map(obj => ({
                ...obj,
                tasks: obj.tasks.map(task => 
                    task.id === completedTaskId 
                    ? { ...task, is_completed_today: true } 
                    : task
                )
            }))
        );
        
        // Refrescar las stats para que "Completadas (Semana)" y "Racha" se actualicen
        apiClient.get('/clinical-history/objectives/my/stats/')
            .then(response => setStats(response.data.stats))
            .catch(err => console.error("Error refrescando stats:", err));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader className="animate-spin h-8 w-8 text-primary" />
                <p className="ml-4 text-muted-foreground">Cargando tus objetivos...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-destructive">{error}</p>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-8">Mis Objetivos y Tareas</h1>

            {/* Sección de Estadísticas (CU-43) */}
            {stats && (
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Objetivos Activos" value={stats.active_objectives} icon={Target} />
                    <StatCard label="Tareas Diarias" value={stats.active_daily_tasks} icon={Activity} />
                    <StatCard label="Completadas (Semana)" value={stats.completions_this_week} icon={CheckCircle} />
                    <StatCard label="Racha Actual" value={`${stats.current_streak_days} días`} icon={Zap} />
                </section>
            )}

            {/* Sección de Objetivos y Tareas (CU-46 & 47) */}
            {objectives.length === 0 ? (
                <div className="bg-card text-card-foreground p-12 rounded-xl text-center shadow-lg">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-primary mb-2">Aún no tienes objetivos</h3>
                    <p className="text-muted-foreground">
                        Tu psicólogo te asignará objetivos y tareas después de tu consulta.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {objectives.map(obj => {
                        // --- CORRECCIÓN 2: Leer la recurrencia de la primera tarea ---
                        const recurrence = obj.tasks[0]?.recurrence || obj.recurrence;
                        
                        return (
                            <div key={obj.id} className="bg-card p-6 rounded-xl shadow border border-border">
                                <h2 className="text-xl font-bold text-primary mb-2">{obj.title}</h2>
                                <p className="text-sm text-muted-foreground mb-4">{obj.description}</p>
                                
                                <h4 className="text-sm font-semibold text-foreground mb-3">
                                    {/* Usamos el helper para mostrar el label correcto */}
                                    Tareas {getRecurrenceLabel(recurrence)}:
                                </h4>
                                <div className="space-y-2">
                                    {obj.tasks.length > 0 ? (
                                        obj.tasks.map(task => (
                                            <TaskItem 
                                                key={task.id} 
                                                task={task} 
                                                onTaskCompleted={handleTaskCompleted} 
                                            />
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Este objetivo aún no tiene tareas.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyObjectivesPage;