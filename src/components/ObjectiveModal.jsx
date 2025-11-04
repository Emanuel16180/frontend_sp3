// src/components/ObjectiveModal.jsx
import { useState } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import Modal from './Modal';
import { Loader, Send, Plus, X } from 'lucide-react';

// Estilos de botones
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center";
const btnOutline = "px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors";
const btnDisabled = "px-4 py-2 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed text-sm text-center";

function ObjectiveModal({ isOpen, onClose, patientId, appointmentId }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [recurrence, setRecurrence] = useState('daily');
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState('');
    const [loading, setLoading] = useState(false);

    // Lógica para añadir tareas dinámicamente
    const handleAddTask = () => {
        if (!currentTask.trim()) return;
        setTasks([...tasks, currentTask]);
        setCurrentTask(''); // Limpiar el input
    };

    // Lógica para quitar tareas
    const handleRemoveTask = (indexToRemove) => {
        setTasks(tasks.filter((_, index) => index !== indexToRemove));
    };

    // Lógica de envío (Idea 1)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || tasks.length === 0) {
            toast.warning("El objetivo debe tener un título y al menos una tarea.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/clinical-history/objectives/', {
                patient: patientId,
                appointment: appointmentId,
                title: title,
                description: description,
                tasks: tasks,
                recurrence: recurrence,
            });
            toast.success("¡Objetivo asignado con éxito!");
            onClose(true); // Enviar 'true' para indicar éxito
        } catch (err) {
            console.error("Error al asignar objetivo:", err);
            toast.error(err.response?.data?.error || "No se pudo asignar el objetivo.");
        } finally {
            setLoading(false);
        }
    };

    // Resetear el formulario al cerrar
    const handleClose = () => {
        onClose(false);
        setTimeout(() => {
            setTitle('');
            setDescription('');
            setRecurrence('daily');
            setTasks([]);
            setCurrentTask('');
        }, 300);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <h2 className="text-2xl font-semibold text-primary mb-6">Asignar Nuevo Objetivo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Título */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">Título del Objetivo</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Mejorar manejo de la ansiedad"
                        required
                        className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Descripción */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">Descripción (Opcional)</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Ej: Técnicas de respiración y mindfulness"
                        className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Recurrencia */}
                <div>
                    <label htmlFor="recurrence" className="block text-sm font-medium text-foreground mb-2">Recurrencia de Tareas</label>
                    <select
                        id="recurrence"
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value)}
                        className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="daily">Diaria</option>
                        <option value="weekly">Semanal</option>
                        <option value="once">Una vez</option>
                    </select>
                </div>

                {/* Tareas Dinámicas */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tareas</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={currentTask}
                            onChange={(e) => setCurrentTask(e.target.value)}
                            placeholder="Ej: Meditar 10 minutos"
                            className="flex-1 p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                            type="button"
                            onClick={handleAddTask}
                            className={btnPrimary}
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <ul className="mt-3 space-y-2">
                        {tasks.map((task, index) => (
                            <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                <span className="text-sm text-foreground">{task}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTask(index)}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 pt-4 border-t border-border">
                    <button type="button" onClick={handleClose} className={btnOutline} disabled={loading}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || tasks.length === 0 || !title.trim()}
                        className={loading || tasks.length === 0 || !title.trim() ? btnDisabled : btnPrimary}
                    >
                        {loading ? <Loader className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                        Asignar Objetivo
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ObjectiveModal;