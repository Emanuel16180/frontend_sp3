// src/pages/BackupsPage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
// Importamos los iconos nuevos y existentes
import { Save, Upload, History, Download, Cloud, CloudDownload, Loader } from 'lucide-react';

// Helper para formatear la fecha
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

// Helper para el tipo de backup
const getBackupTypePill = (type) => {
    if (type === 'automatic') {
        return <span className="px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Automático</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">Manual</span>;
};

function BackupsPage() {
    // --- ESTADOS ---
    const [isCreating, setIsCreating] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    // --- NUEVOS ESTADOS PARA EL HISTORIAL ---
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null); // Para el spinner de descarga

    // --- Cargar Historial (NUEVO) ---
    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const response = await apiClient.get('/backups/history/');
            setHistory(response.data.results || response.data || []);
        } catch (error) {
            console.error("Error al cargar el historial:", error);
            toast.error("No se pudo cargar el historial de backups.");
        } finally {
            setLoadingHistory(false);
        }
    };

    // Cargar historial al montar la página
    useEffect(() => {
        fetchHistory();
    }, []);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // --- LÓGICA DE CREACIÓN ACTUALIZADA ---

    // Opción 1: Solo guardar en la nube
    const handleCreateCloudOnly = async () => {
        setIsCreating(true);
        toast.info("Generando copia de seguridad en la nube...");
        try {
            await apiClient.post('/backups/create/?cloud_only=true');
            toast.success("¡Copia de seguridad guardada en la nube exitosamente!");
            fetchHistory(); // Refrescar la lista
        } catch (error) {
            console.error("Error al crear la copia en la nube:", error);
            toast.error("No se pudo generar la copia de seguridad.");
        } finally {
            setIsCreating(false);
        }
    };

    // Opción 2: Guardar en la nube Y descargar
    const handleCreateAndDownload = async () => {
        setIsCreating(true);
        toast.info("Generando y descargando copia de seguridad...");
        try {
            const response = await apiClient.post('/backups/create/?download=true', {}, {
                responseType: 'blob', // Importante para la descarga
            });

            const header = response.headers['content-disposition'];
            const filename = header ? header.split('filename=')[1].replace(/"/g, '') : 'backup.sql';

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("¡Copia de seguridad descargada exitosamente!");
            fetchHistory(); // Refrescar la lista
        } catch (error) {
            console.error("Error al crear y descargar la copia:", error);
            toast.error("No se pudo generar la copia de seguridad.");
        } finally {
            setIsCreating(false);
        }
    };
    
    // --- LÓGICA DE DESCARGA DE HISTORIAL (NUEVA) ---
    const handleDownloadSpecific = async (backupId, filename) => {
        setDownloadingId(backupId); // Activar spinner para este item
        toast.info(`Descargando "${filename}"...`);
        try {
            const response = await apiClient.get(`/backups/history/${backupId}/download/`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("¡Descarga completada!");
        } catch (error) {
            console.error("Error al descargar el backup:", error);
            toast.error("No se pudo descargar el archivo.");
        } finally {
            setDownloadingId(null); // Desactivar spinner
        }
    };

    // --- LÓGICA PARA RESTAURAR (SIN CAMBIOS) ---
    const handleRestore = async () => {
        if (!selectedFile) return;

        setIsRestoring(true);
        setIsModalOpen(false);
        toast.info("Iniciando restauración... La aplicación podría no responder por un momento.");

        const formData = new FormData();
        formData.append('backup_file', selectedFile);

        try {
            await apiClient.post('/backups/restore/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("¡Restauración completada! Se recomienda recargar la página.");
        } catch (error) {
            console.error("Error al restaurar:", error);
            const errorMessage = error.response?.data?.error || "Error desconocido.";
            toast.error(`Fallo en la restauración: ${errorMessage}`);
        } finally {
            setIsRestoring(false);
            setConfirmText('');
            setSelectedFile(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold text-gray-900">Copias de Seguridad</h1>
                    <p className="text-gray-600 mt-2">
                        Crea, descarga y restaura respaldos de los datos de tu clínica.
                    </p>
                </div>

                {/* Sección para Crear Copia de Seguridad (ACTUALIZADA) */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Save className="w-6 h-6 text-blue-600" />
                        Crear Respaldo Manual
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Puedes generar una copia de seguridad y guardarla en la nube, o descargarla directamente a tu computadora.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={handleCreateCloudOnly} 
                            disabled={isCreating} 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            {isCreating ? <Loader className="animate-spin h-5 w-5" /> : <Cloud className="w-5 h-5" />}
                            {isCreating ? 'Generando...' : 'Guardar en la Nube'}
                        </button>
                        <button 
                            onClick={handleCreateAndDownload} 
                            disabled={isCreating} 
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            {isCreating ? <Loader className="animate-spin h-5 w-5" /> : <CloudDownload className="w-5 h-5" />}
                            {isCreating ? 'Generando...' : 'Guardar y Descargar'}
                        </button>
                    </div>
                </div>

                {/* NUEVA SECCIÓN: Historial de Copias de Seguridad */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <History className="w-6 h-6 text-blue-600" />
                            Historial de Copias de Seguridad
                        </h2>
                    </div>
                    
                    {loadingHistory ? (
                        <div className="p-6 text-center text-gray-500">Cargando historial...</div>
                    ) : history.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No hay copias de seguridad guardadas en la nube.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map(backup => (
                                        <tr key={backup.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(backup.created_at)}</td>
                                            <td className="px-6 py-4">{getBackupTypePill(backup.backup_type)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{backup.file_name}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDownloadSpecific(backup.id, backup.file_name)}
                                                    disabled={downloadingId === backup.id}
                                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-gray-100 font-medium py-2 px-3 rounded-lg text-sm flex items-center gap-1"
                                                >
                                                    {downloadingId === backup.id ? (
                                                        <Loader className="animate-spin h-4 w-4" />
                                                    ) : (
                                                        <Download className="w-4 h-4" />
                                                    )}
                                                    Descargar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Sección para Restaurar Copia de Seguridad (SIN CAMBIOS) */}
                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                    <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2 mb-4">
                        <Upload className="w-6 h-6" />
                        Restaurar desde Archivo
                    </h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        {/* ... (Contenido de advertencia sin cambios) ... */}
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-red-800 font-semibold">ADVERTENCIA</span>
                        </div>
                        <p className="text-red-700 text-sm mt-2">
                            Esta acción es destructiva y reemplazará TODOS los datos actuales. Asegúrate de tener un respaldo antes de proceder.
                        </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Selecciona un archivo de respaldo previamente descargado para restaurar el estado de tu clínica.
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <input
                            type="file"
                            accept=".sql,.backup"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            disabled={!selectedFile || isRestoring} 
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                        >
                            {isRestoring ? (
                                <>
                                    <Loader className="animate-spin h-4 w-4" />
                                    Restaurando...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Restaurar
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Sección de Configuración Automática (Placeholder) */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        Configuración Automática
                    </h2>
                    <p className="text-sm text-gray-600">
                        Los backups automáticos (ej. cada 24 horas) se configuran directamente desde el panel de administración de tu servidor.
                        Aquí en el historial puedes ver los backups automáticos que el sistema ha generado.
                    </p>
                </div>

                {/* Modal de Confirmación para Restaurar (SIN CAMBIOS) */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    {/* ... (Contenido del modal sin cambios) ... */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Estás absolutamente seguro?</h2>
                        <p className="text-gray-600 mb-4">
                            Esta acción <strong>borrará permanentemente</strong> todos los datos actuales y los reemplazará con los del archivo:
                        </p>
                        <div className="bg-gray-100 p-3 rounded-lg mb-4">
                            <p className="font-mono text-sm text-gray-800">{selectedFile?.name}</p>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Para confirmar, por favor escribe <strong className="text-red-600 font-mono">RESTAURAR</strong> en el campo de abajo:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-center font-mono text-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Escribe RESTAURAR"
                        />
                        <div className="flex justify-center gap-4 mt-6">
                            <button 
                                onClick={() => { setIsModalOpen(false); setConfirmText(''); }} 
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRestore}
                                disabled={confirmText !== 'RESTAURAR'}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Entiendo las consecuencias, restaurar datos
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default BackupsPage;