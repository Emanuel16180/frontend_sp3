// src/pages/MyPrescriptionsPage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
// --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
// Cambiamos ClipboardHeart por ClipboardList
import { Loader, ClipboardList, Pill, Calendar, User, FileText, CheckCircle, XCircle } from 'lucide-react';

// Helper para el ícono de estado
const StatusIcon = ({ isActive }) => (
  isActive ? (
    <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <CheckCircle className="h-3 w-3" /> Activo
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
      <XCircle className="h-3 w-3" /> Inactivo
    </span>
  )
);

function MyPrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await apiClient.get('/clinical-history/prescriptions/my-prescriptions/');
                setPrescriptions(response.data.results || response.data || []);
            } catch (err) {
                console.error("Error al cargar recetas:", err);
                setError("No se pudieron cargar tus recetas.");
                toast.error("No se pudieron cargar tus recetas.");
            } finally {
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader className="animate-spin h-8 w-8 text-primary" />
                <p className="ml-4 text-muted-foreground">Cargando tu tratamiento...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-destructive">{error}</p>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* --- ¡Y AQUÍ! --- */}
            <h1 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
                <ClipboardList className="h-8 w-8" />
                Mi Tratamiento
            </h1>

            {prescriptions.length === 0 ? (
                <div className="bg-card text-card-foreground p-12 rounded-xl text-center shadow-lg">
                    <Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-primary mb-2">Sin recetas</h3>
                    <p className="text-muted-foreground">
                        Aún no tienes ningún medicamento recetado por un psiquiatra.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map(item => (
                        <div key={item.id} className="bg-card p-6 rounded-xl shadow border border-border">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 pb-3 border-b border-border">
                                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                    <Pill className="h-5 w-5" />
                                    {item.medication_name}
                                </h2>
                                <StatusIcon isActive={item.is_active} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>Recetado por: <strong className="text-foreground">{item.psychiatrist_name}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Fecha: <strong className="text-foreground">{new Date(item.prescribed_date).toLocaleDateString('es-ES')}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-muted-foreground ml-6">Dosis:</span>
                                    <strong className="text-foreground">{item.dosage}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-muted-foreground ml-6">Frecuencia:</span>
                                    <strong className="text-foreground">{item.frequency}</strong>
                                </div>
                            </div>

                            {item.notes && (
                                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                                        <FileText className="h-4 w-4" />
                                        Notas del Doctor
                                    </label>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{item.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyPrescriptionsPage;