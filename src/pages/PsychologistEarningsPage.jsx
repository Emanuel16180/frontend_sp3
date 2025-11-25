// src/pages/PsychologistEarningsPage.jsx
import { useState, useEffect } from 'react';
import { getPsychologistEarnings, downloadInvoicePdf } from '../api';
import { toast } from 'react-toastify';
import { TrendingUp, Filter, Download, Loader, DollarSign } from 'lucide-react';

function PsychologistEarningsPage() {
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ start_date: '', patient_name: '' });
    const [downloadingId, setDownloadingId] = useState(null);

    // Totales calculados (Usamos 'your_earning' que ya viene calculado del backend o lo calculamos aquí)
    const totalEarnings = earnings.reduce((acc, curr) => {
        const earning = parseFloat(curr.your_earning || (parseFloat(curr.amount) * 0.75));
        return acc + earning;
    }, 0);

    useEffect(() => {
        fetchEarnings();
    }, []); 

    const fetchEarnings = async () => {
        setLoading(true);
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await getPsychologistEarnings(activeFilters);
            setEarnings(response.data.results || response.data);
        } catch (error) {
            console.error("Error cargando ingresos:", error);
            toast.error("Error al cargar reporte de ingresos.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id) => {
        setDownloadingId(id);
        try {
            await downloadInvoicePdf(id, `Comprobante-${id}.pdf`);
        } catch (error) {
            toast.error("Error al descargar.");
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            
            {/* Header y Totales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                        Mis Ingresos
                    </h1>
                    <p className="text-gray-500 mt-1">Reporte detallado de ganancias netas por consultas.</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col justify-center">
                    <span className="text-sm text-green-700 font-semibold uppercase">Ganancia Neta Total</span>
                    <div className="text-3xl font-bold text-green-800 mt-1">
                        Bs {totalEarnings.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        value={filters.patient_name}
                        onChange={e => setFilters({...filters, patient_name: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desde fecha</label>
                    <input 
                        type="date" 
                        value={filters.start_date}
                        onChange={e => setFilters({...filters, start_date: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <button 
                    onClick={fetchEarnings}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                    <Filter className="w-4 h-4" /> Filtrar
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-10 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></div>
                ) : earnings.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No se encontraron ingresos con estos filtros.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Paciente</th>
                                    <th className="p-4">Monto Cita</th>
                                    <th className="p-4 text-red-600">Comisión (25%)</th>
                                    <th className="p-4 text-green-700 font-bold">Tu Ganancia</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {earnings.map((item) => {
                                    // Cálculos manuales para asegurar que se vea bien
                                    const totalAmount = parseFloat(item.amount);
                                    const commission = totalAmount * 0.25;
                                    // Usamos 'your_earning' si viene del backend, si no, calculamos
                                    const myEarning = item.your_earning ? parseFloat(item.your_earning) : (totalAmount - commission);

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="p-4 text-gray-600">
                                                {/* ✨ CORRECCIÓN FECHA: Evitar desfase de zona horaria */}
                                                {new Date(item.paid_at).toLocaleDateString('es-BO', { timeZone: 'UTC' })}
                                                <div className="text-xs text-gray-400">
                                                    {new Date(item.paid_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-gray-800">
                                                {item.patient_name || "Paciente"}
                                            </td>
                                            <td className="p-4 text-gray-600">Bs {totalAmount.toFixed(2)}</td>
                                            <td className="p-4 text-red-600">- Bs {commission.toFixed(2)}</td>
                                            <td className="p-4 text-green-700 font-bold text-base">
                                                Bs {myEarning.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleDownload(item.id)}
                                                    disabled={downloadingId === item.id}
                                                    className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                                    title="Descargar Comprobante"
                                                >
                                                    {downloadingId === item.id ? <Loader className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PsychologistEarningsPage;