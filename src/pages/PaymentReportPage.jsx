// src/pages/PaymentReportPage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import { Loader, DollarSign, Banknote, Briefcase, Calendar, Filter, PieChart, Download } from 'lucide-react';
import SmartReportBot from '../components/SmartReportBot'; // <--- Importamos el Bot

// Tarjeta de Estadística (Componente interno)
function StatCard({ label, value, icon: Icon, formatAsCurrency = false }) {
    const displayValue = formatAsCurrency 
        ? `Bs. ${parseFloat(value || 0).toFixed(2)}` 
        : value;

    return (
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md flex items-center gap-4 bg-white border border-gray-200">
            <div className="p-3 bg-blue-50 rounded-full">
                <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
                <span className="text-sm text-gray-500">{label}</span>
                <strong className="block text-2xl font-bold text-gray-800">{displayValue}</strong>
            </div>
        </div>
    );
}

// Componente Principal
function PaymentReportPage() {
    // --- ESTADOS ---
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false); // Estado para descarga

    // Filtros
    const [psychologists, setPsychologists] = useState([]);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        psychologist_id: ''
    });

    // 1. Cargar lista de psicólogos al inicio
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const response = await apiClient.get('/admin/users/', {
                    params: { user_type: 'professional' }
                });
                setPsychologists(response.data.results || response.data);
            } catch (err) {
                console.error("Error cargando psicólogos:", err);
                toast.error("No se pudo cargar la lista de psicólogos.");
            }
        };
        fetchFilterData();
    }, []);

    // Manejo de cambios en los inputs
    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    // 2. Generar Reporte en Pantalla
    const handleGenerateReport = async () => {
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
            console.error("Error reporte:", err);
            const errorMsg = err.response?.data?.error || "Error al generar el reporte.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // 3. Descargar Reporte (PDF/CSV)
    const handleDownloadReport = async (format) => {
        setIsDownloading(true);
        toast.info(`Generando reporte ${format.toUpperCase()}...`);

        try {
            const params = new URLSearchParams();
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            if (filters.psychologist_id) params.append('psychologist_id', filters.psychologist_id);

            // Llamada al backend esperando un BLOB
            const response = await apiClient.get(`/admin/reports/payments/download_${format}/`, {
                params,
                responseType: 'blob', 
            });

            // Crear enlace temporal y descargar
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Nombre del archivo
            const contentDisposition = response.headers['content-disposition'];
            let filename = `reporte_pagos_${new Date().toISOString().split('T')[0]}.${format}`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/);
                if (match && match[1]) filename = match[1];
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Limpieza
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("¡Descarga iniciada!");

        } catch (err) {
            console.error(`Error descarga ${format}:`, err);
            toast.error("Error al descargar el archivo.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <PieChart className="w-8 h-8 text-indigo-600" />
                Reportes Financieros
            </h1>

            {/* --- LAYOUT DE 2 COLUMNAS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMNA IZQUIERDA: Chatbot Inteligente */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <SmartReportBot />
                    </div>
                </div>

                {/* COLUMNA DERECHA: Reportes Manuales */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Panel de Filtros */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-500" />
                            Filtros Manuales
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={filters.start_date}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={filters.end_date}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Psicólogo</label>
                                <select
                                    name="psychologist_id"
                                    value={filters.psychologist_id}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Todos los profesionales</option>
                                    {psychologists.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.full_name || `${p.first_name} ${p.last_name}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="w-full p-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader className="animate-spin h-5 w-5" /> : <PieChart className="w-5 h-5" />}
                            Generar Reporte en Pantalla
                        </button>
                    </div>

                    {/* Resumen de Estadísticas */}
                    {summary && (
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <StatCard label="Ingreso Total" value={summary.total_revenue} icon={DollarSign} formatAsCurrency />
                            <StatCard label="Ganancia Clínica" value={summary.total_clinic_earning} icon={Banknote} formatAsCurrency />
                            <StatCard label="Pago a Psicólogos" value={summary.total_psychologist_earning} icon={Briefcase} formatAsCurrency />
                        </section>
                    )}

                    {/* Tabla de Transacciones */}
                    {transactions.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <h2 className="text-xl font-semibold text-gray-800">Detalle de Transacciones</h2>
                                
                                {/* BOTONES DE DESCARGA */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDownloadReport('csv')}
                                        disabled={isDownloading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                                    >
                                        {isDownloading ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        CSV
                                    </button>
                                    <button
                                        onClick={() => handleDownloadReport('pdf')}
                                        disabled={isDownloading}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                                    >
                                        {isDownloading ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        PDF
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="p-3 text-sm font-semibold text-gray-500">Fecha</th>
                                            <th className="p-3 text-sm font-semibold text-gray-500">Paciente</th>
                                            <th className="p-3 text-sm font-semibold text-gray-500">Psicólogo</th>
                                            <th className="p-3 text-sm font-semibold text-gray-500">Monto</th>
                                            <th className="p-3 text-sm font-semibold text-gray-500">Clínica</th>
                                            <th className="p-3 text-sm font-semibold text-gray-500">Prof.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-3 text-sm text-gray-600">
                                                    {new Date(tx.paid_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-3 text-sm font-medium text-gray-800">{tx.patient_name}</td>
                                                <td className="p-3 text-sm text-gray-600">{tx.psychologist_name}</td>
                                                <td className="p-3 text-sm font-bold text-gray-800">Bs. {tx.amount}</td>
                                                <td className="p-3 text-sm text-green-600 font-medium">Bs. {tx.clinic_earning.toFixed(2)}</td>
                                                <td className="p-3 text-sm text-blue-600 font-medium">Bs. {tx.psychologist_earning.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Mensajes de Estado */}
                    {!loading && !summary && !error && (
                        <div className="text-center text-gray-500 p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <PieChart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p>Usa el <b>Asistente Inteligente</b> a la izquierda o los <b>Filtros Manuales</b> para ver datos.</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-center text-red-600 p-8 bg-red-50 rounded-xl border border-red-200">
                            <p>{error}</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default PaymentReportPage;