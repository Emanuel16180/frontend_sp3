// src/pages/PatientPaymentsPage.jsx
import { useState, useEffect } from 'react';
import { getMyPayments, downloadInvoicePdf } from '../api';
import { toast } from 'react-toastify';
import { FileText, Calendar, CreditCard, Loader, Download } from 'lucide-react';

function PatientPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await getMyPayments();
            setPayments(response.data.results || response.data);
        } catch (error) {
            console.error("Error cargando pagos:", error);
            toast.error("No se pudo cargar el historial de pagos.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (payment) => {
        setDownloadingId(payment.id);
        try {
            await downloadInvoicePdf(payment.id, `Factura-${payment.id}.pdf`);
            toast.success("Factura descargada correctamente");
        } catch (error) {
            toast.error("Error al descargar la factura");
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="w-8 h-8 text-blue-600" />
                Historial de Pagos
            </h1>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {payments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No tienes pagos registrados aún.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Fecha</th>
                                    <th className="p-4 font-semibold text-gray-600">Concepto</th>
                                    <th className="p-4 font-semibold text-gray-600">Monto</th>
                                    <th className="p-4 font-semibold text-gray-600">Estado</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Factura</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                       <td className="p-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {/* ✨ CORRECCIÓN DE FECHA ✨ */}
                                                {payment.appointment_date ? (
                                                    // Si hay fecha de cita, la mostramos tal cual (YYYY-MM-DD -> DD/MM/YYYY)
                                                    // Esto evita el error de zona horaria que resta 1 día
                                                    payment.appointment_date.split('-').reverse().join('/')
                                                ) : (
                                                    // Si no hay cita (ej. un bono), mostramos la fecha de pago
                                                    new Date(payment.paid_at).toLocaleDateString()
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-gray-800">
                                            {payment.description || "Consulta Psicológica"}
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">
                                            Bs {payment.amount}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                payment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {payment.status === 'completed' ? 'Pagado' : payment.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {payment.status === 'completed' && (
                                                <button 
                                                    onClick={() => handleDownload(payment)}
                                                    disabled={downloadingId === payment.id}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {downloadingId === payment.id ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                                    PDF
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientPaymentsPage;