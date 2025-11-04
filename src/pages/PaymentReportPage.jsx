// src/pages/PaymentReportPage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
// Importamos el nuevo icono
import { Loader, DollarSign, Banknote, Briefcase, Calendar, Filter, PieChart, Download } from 'lucide-react';

// Tarjeta de Estadística (para el Resumen)
function StatCard({ label, value, icon: Icon, formatAsCurrency = false }) {
// ... (código existente sin cambios)
    const displayValue = formatAsCurrency 
        ? `Bs. ${parseFloat(value || 0).toFixed(2)}` 
        : value;

    return (
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <span className="text-sm text-muted-foreground">{label}</span>
                <strong className="block text-2xl font-bold text-foreground">{displayValue}</strong>
            </div>
        </div>
    );
}

// Componente Principal
function PaymentReportPage() {
    // Estados para los datos del reporte
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estados para los filtros
    const [psychologists, setPsychologists] = useState([]);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        psychologist_id: ''
    });
    
    // --- NUEVO: Estado para los botones de descarga ---
    const [isDownloading, setIsDownloading] = useState(false);

    // Cargar los psicólogos para el dropdown (Idea 2)
    useEffect(() => {
// ... (código existente sin cambios)
        const fetchFilterData = async () => {
            try {
                const response = await apiClient.get('/admin/users/', {
                    params: { user_type: 'professional' }
                });
                setPsychologists(response.data.results || response.data);
            } catch (err) {
                console.error("Error cargando lista de psicólogos:", err);
                toast.error("No se pudo cargar la lista de psicólogos para filtrar.");
            }
        };
        fetchFilterData();
    }, []);

    const handleFilterChange = (e) => {
// ... (código existente sin cambios)
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    // Consumir el Endpoint de Reportes (Idea 3)
    const handleGenerateReport = async () => {
// ... (código existente sin cambios)
        setLoading(true);
        setError('');
        setSummary(null);
        setTransactions([]);
        
        try {
            const params = new URLSearchParams();
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            if (filters.psychologist_id) params.append('psychologist_id', filters.psychologist_id);

            const response = await apiClient.get(`/admin/reports/payments/`, { params });
            
            setSummary(response.data.summary);
            setTransactions(response.data.transactions || []);
            
            if (response.data.transactions.length === 0) {
                toast.info("No se encontraron transacciones para estos filtros.");
            }

        } catch (err) {
            console.error("Error al generar el reporte:", err);
            const errorMsg = err.response?.data?.error || "No se pudo generar el reporte.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // --- ¡NUEVA FUNCIÓN PARA DESCARGAR REPORTES! ---
    const handleDownloadReport = async (format) => {
        setIsDownloading(true);
        toast.info(`Generando tu reporte ${format.toUpperCase()}...`);

        try {
            // 1. Construir los mismos parámetros de filtro
            const params = new URLSearchParams();
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            if (filters.psychologist_id) params.append('psychologist_id', filters.psychologist_id);

            // 2. Llamar al endpoint de descarga (ej: /download_pdf/ o /download_csv/)
            // ⚠️ TU BACKEND DEBE CREAR ESTOS ENDPOINTS
            const response = await apiClient.get(`/admin/reports/payments/download_${format}/`, {
                params,
                responseType: 'blob', // ¡Importante para recibir un archivo!
            });

            // 3. Crear y simular clic en el enlace de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Extraer nombre del archivo del header (o poner uno por defecto)
            const contentDisposition = response.headers['content-disposition'];
            let filename = `reporte_pagos_${new Date().toISOString().split('T')[0]}.${format}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Limpieza
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("¡Reporte descargado!");

        } catch (err) {
            console.error(`Error al descargar ${format}:`, err);
            toast.error(`No se pudo descargar el reporte ${format}. ¿El endpoint del backend está listo?`);
        } finally {
            setIsDownloading(false);
        }
    };


    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-8">Reporte de Pagos</h1>

            {/* Idea 2: El Panel de Filtros (sin cambios) */}
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border mb-8">
                {/* ... (código de filtros existente sin cambios) ... */}
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtrar Reporte
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Fecha de Inicio</label>
                        <input
                            type="date"
                            name="start_date"
                            value={filters.start_date}
                            onChange={handleFilterChange}
                            className="w-full p-2 bg-input border border-border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Fecha de Fin</label>
                        <input
                            type="date"
                            name="end_date"
                            value={filters.end_date}
                            onChange={handleFilterChange}
                            className="w-full p-2 bg-input border border-border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Psicólogo</label>
                        <select
                            name="psychologist_id"
                            value={filters.psychologist_id}
                            onChange={handleFilterChange}
                            className="w-full p-2 bg-input border border-border rounded-lg"
                        >
                            <option value="">Todos los psicólogos</option>
                            {psychologists.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.full_name || `${p.first_name} ${p.last_name}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="self-end">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="w-full p-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:bg-muted"
                        >
                            {loading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : "Generar Reporte"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Idea 3: Resumen de Totales (sin cambios) */}
            {summary && (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* ... (código de StatCards existente sin cambios) ... */}
                    <StatCard label="Ingresos Totales (Bruto)" value={summary.total_revenue} icon={DollarSign} formatAsCurrency />
                    <StatCard label="Ganancia Clínica" value={summary.total_clinic_earning} icon={Banknote} formatAsCurrency />
                    <StatCard label="Ganancia Psicólogos" value={summary.total_psychologist_earning} icon={Briefcase} formatAsCurrency />
                </section>
            )}

            {/* Idea 3: Tabla de Transacciones */}
            {/* --- MODIFICADO: Añadidos botones de descarga --- */}
            {transactions.length > 0 && (
                <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <h2 className="text-xl font-semibold text-foreground">Transacciones Detalladas</h2>
                        {/* --- INICIO DE NUEVOS BOTONES --- */}
                        <div className="flex gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => handleDownloadReport('csv')}
                                disabled={isDownloading}
                                className="px-4 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 text-sm flex items-center gap-2 disabled:bg-muted"
                            >
                                <Download className="h-4 w-4" />
                                {isDownloading ? "..." : "CSV"}
                            </button>
                            <button
                                onClick={() => handleDownloadReport('pdf')}
                                disabled={isDownloading}
                                className="px-4 py-2 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 text-sm flex items-center gap-2 disabled:bg-muted"
                            >
                                <Download className="h-4 w-4" />
                                {isDownloading ? "..." : "PDF"}
                            </button>
                        </div>
                        {/* --- FIN DE NUEVOS BOTONES --- */}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            {/* ... (código de la tabla existente sin cambios) ... */}
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="p-3 text-sm font-semibold text-muted-foreground">Fecha</th>
                                    <th className="p-3 text-sm font-semibold text-muted-foreground">Paciente</th>
                                    <th className="p-3 text-sm font-semibold text-muted-foreground">Psicólogo</th>
                                    <th className="p-3 text-sm font-semibold text-muted-foreground">Monto Total</th>
                                    <th className="p-3 text-sm font-semibold text-muted-foreground">Ganancia Clínica</th>
                                    <th className="p-3 text-sm font-semibold text-muted-foreground">Ganancia Psicólogo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-muted/50">
                                        <td className="p-3 text-sm">
                                            {new Date(tx.paid_at).toLocaleString('es-ES')}
                                        </td>
                                        <td className="p-3 text-sm">{tx.patient_name}</td>
                                        <td className="p-3 text-sm">{tx.psychologist_name}</td>
                                        <td className="p-3 text-sm font-medium">Bs. {tx.amount}</td>
                                        <td className="p-3 text-sm text-green-600 font-medium">Bs. {tx.clinic_earning.toFixed(2)}</td>
                                        <td className="p-3 text-sm text-blue-600 font-medium">Bs. {tx.psychologist_earning.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mensajes de estado (sin cambios) */}
            {!loading && !summary && !error && (
                // ... (código existente sin cambios)
                <div className="text-center text-muted-foreground p-12 bg-card rounded-lg shadow">
                    <p>Selecciona un rango de fechas y haz clic en "Generar Reporte" para ver los datos.</p>
                </div>
            )}
            {error && (
                // ... (código existente sin cambios)
                <div className="text-center text-destructive p-12 bg-destructive/10 rounded-lg">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

export default PaymentReportPage;