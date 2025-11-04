// src/pages/MyCarePlansPage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import { Loader, Plus, Save, Trash2, DollarSign, Package, FileText, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/Modal';

// Estilos
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm flex items-center gap-2";
const btnDestructive = "px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-colors text-sm flex items-center gap-2";
const btnOutline = "px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors text-sm flex items-center gap-2";

function MyCarePlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Estados del formulario
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [numberOfSessions, setNumberOfSessions] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Acción 1: Ver sus planes creados
    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/professionals/care-plans/');
            setPlans(response.data.results || response.data);
        } catch (err) {
            console.error("Error al cargar planes:", err);
            setError("No se pudieron cargar tus planes de cuidado.");
            toast.error("No se pudieron cargar tus planes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // Acción 2: Crear un nuevo plan
    const handleCreatePlan = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await apiClient.post('/professionals/care-plans/', {
                title: title,
                description: description,
                number_of_sessions: numberOfSessions,
                total_price: totalPrice,
            });
            toast.success("¡Plan creado exitosamente!");
            resetForm();
            setIsModalOpen(false);
            fetchPlans(); // Recargar la lista
        } catch (err) {
            console.error("Error al crear plan:", err);
            toast.error(err.response?.data?.error || "No se pudo crear el plan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setNumberOfSessions(1);
        setTotalPrice(0);
    };

    const handleDeactivatePlan = async (planId) => {
        // (Opcional: El backend debe implementar la lógica de desactivación/borrado)
        if (window.confirm("¿Estás seguro de que quieres desactivar este plan?")) {
            try {
                // Asumiendo un endpoint DELETE o un PATCH con active=false
                // await apiClient.delete(`/professionals/care-plans/${planId}/`);
                // await apiClient.patch(`/professionals/care-plans/${planId}/`, { is_active: false });
                toast.info("Función de desactivar pendiente de implementación en backend.");
                // fetchPlans(); // Recargar
            } catch (err) {
                toast.error("No se pudo desactivar el plan.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader className="animate-spin h-8 w-8 text-primary" />
                <p className="ml-4 text-muted-foreground">Cargando tus planes...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-destructive">{error}</p>;
    }

    return (
        <>
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">Mis Planes de Cuidado</h1>
                    <button onClick={() => setIsModalOpen(true)} className={btnPrimary}>
                        <Plus className="h-4 w-4" />
                        Crear Nuevo Plan
                    </button>
                </div>

                {plans.length === 0 ? (
                    <div className="bg-card text-card-foreground p-12 rounded-xl text-center shadow-lg">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-primary mb-2">Aún no tienes planes</h3>
                        <p className="text-muted-foreground">
                            Crea un plan para ofrecer paquetes de sesiones a tus pacientes.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-card p-6 rounded-xl shadow border border-border flex flex-col">
                                <h2 className="text-xl font-bold text-primary mb-2">{plan.title}</h2>
                                <p className="text-sm text-muted-foreground mb-4 flex-grow">{plan.description}</p>
                                
                                <div className="space-y-2 py-4 border-t border-b border-border">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Sesiones:</span>
                                        <span className="font-bold">{plan.number_of_sessions}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Precio Total:</span>
                                        <span className="font-bold text-green-600">Bs. {plan.total_price}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button 
                                        onClick={() => handleDeactivatePlan(plan.id)}
                                        className={btnDestructive}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para Crear Nuevo Plan */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleCreatePlan} className="space-y-4">
                    <h2 className="text-2xl font-semibold text-primary mb-6">Crear Nuevo Plan</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Título del Plan</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Paquete Bienestar 10"
                            required
                            className="w-full p-3 bg-input border border-border rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Ej: 10 sesiones de terapia cognitivo-conductual"
                            required
                            className="w-full p-3 bg-input border border-border rounded-lg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">N° de Sesiones</label>
                            <input
                                type="number"
                                value={numberOfSessions}
                                onChange={(e) => setNumberOfSessions(e.target.value)}
                                min="1"
                                required
                                className="w-full p-3 bg-input border border-border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Precio Total (Bs.)</label>
                            <input
                                type="number"
                                value={totalPrice}
                                onChange={(e) => setTotalPrice(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                                className="w-full p-3 bg-input border border-border rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className={btnOutline}>Cancelar</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={isSubmitting ? "opacity-50 cursor-not-allowed " + btnPrimary : btnPrimary}
                        >
                            {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                            Guardar Plan
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default MyCarePlansPage;