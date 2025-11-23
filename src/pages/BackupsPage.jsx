// src/pages/BackupsPage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
// Importamos los iconos
import { Save, Upload, History, Download, Cloud, CloudDownload, Loader, Settings, Clock, Calendar } from 'lucide-react';

// --- HELPER 1: Formatear fecha para MOSTRAR en texto (ej: "22/11/2025 20:30") ---
const formatDateTimeDisplay = (isoString) => {
    if (!isoString) return 'N/A';
    // Esto usa la configuración regional del navegador automáticamente
    return new Date(isoString).toLocaleString('es-BO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

// --- HELPER 2: Convertir fecha UTC (del backend) a String Local para el Input (YYYY-MM-DDTHH:mm) ---
const convertUtcToLocalInput = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Truco para obtener la fecha local en formato ISO sin que JavaScript la convierta a UTC
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
};

// Helper para el tipo de backup (pill visual)
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

    // --- ESTADOS PARA EL HISTORIAL ---
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);

    // --- ESTADOS DE CONFIGURACIÓN ---
    const [schedule, setSchedule] = useState('disabled');
    const [scheduledDate, setScheduledDate] = useState(''); // Fecha para el input
    const [lastBackupAt, setLastBackupAt] = useState(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    // --- Cargar Historial ---
    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const response = await apiClient.get('/backups/history/');
            setHistory(response.data.results || response.data || []);
        } catch (error) {
            console.error("Error al cargar el historial:", error);
            toast.error("No se pudo cargar el historial.");
        } finally {
            setLoadingHistory(false);
        }
    };

    // --- Cargar Configuración ---
    const fetchBackupConfig = async () => {
        try {
            setLoadingConfig(true);
            const response = await apiClient.get('/admin/config/backup/');
            setSchedule(response.data.backup_schedule || 'disabled');
            setLastBackupAt(response.data.last_backup_at);
            
            // Si hay una fecha programada, la convertimos a LOCAL para que el input la muestre bien
            if (response.data.next_scheduled_backup) {
                 const localInputValue = convertUtcToLocalInput(response.data.next_scheduled_backup);
                 setScheduledDate(localInputValue);
            }
        } catch (error) {
            console.error("Error config:", error);
            toast.error("Error cargando configuración.");
        } finally {
            setLoadingConfig(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchBackupConfig(); 
    }, []);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // --- HANDLERS DE BACKUP MANUAL (Sin cambios) ---
    const handleCreateCloudOnly = async () => {
        setIsCreating(true);
        toast.info("Iniciando respaldo...");
        try {
            await apiClient.post('/backups/create/?cloud_only=true');
            toast.success("¡Respaldo creado en la nube!");
            fetchHistory(); 
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al crear respaldo.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateAndDownload = async () => {
        setIsCreating(true);
        toast.info("Generando respaldo...");
        try {
            const response = await apiClient.post('/backups/create/?download=true', {}, { responseType: 'blob' });
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
            toast.success("¡Respaldo descargado!");
            fetchHistory(); 
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al descargar respaldo.");
        } finally {
            setIsCreating(false);
        }
    };
    
    const handleDownloadSpecific = async (backupId, filename) => {
        setDownloadingId(backupId);
        toast.info("Iniciando descarga...");
        try {
            const response = await apiClient.get(`/backups/history/${backupId}/download/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Descarga completada");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error en la descarga.");
        } finally {
            setDownloadingId(null);
        }
    };

    // --- ✨ GUARDAR CONFIGURACIÓN (CORREGIDO) ---
    const handleSaveConfig = async () => {
        if (schedule === 'scheduled' && !scheduledDate) {
            toast.warning("Selecciona una fecha y hora.");
            return;
        }

        setIsSavingConfig(true);
        try {
            let payload = { backup_schedule: schedule };

            if (schedule === 'scheduled') {
                // Enviamos la fecha TAL CUAL la ve el usuario, reemplazando T por espacio
                // El backend la recibirá como string "YYYY-MM-DD HH:mm"
                const formattedDate = scheduledDate.replace('T', ' ') + ':00';
                payload.next_scheduled_backup = formattedDate;
            }

            await apiClient.patch('/admin/config/backup/', payload);
            toast.success("Configuración actualizada");
            fetchBackupConfig(); // Recargamos para verificar
        } catch (error) {
            console.error("Error saving config:", error);
            toast.error("No se pudo guardar la configuración.");
        } finally {
            setIsSavingConfig(false);
        }
    };

    // --- RESTAURAR (Sin cambios) ---
    const handleRestore = async () => {
        if (!selectedFile) return;
        setIsRestoring(true);
        setIsModalOpen(false);
        toast.info("Restaurando...");
        const formData = new FormData();
        formData.append('backup_file', selectedFile);

        try {
            await apiClient.post('/backups/restore/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("¡Restauración exitosa! Recarga la página.");
        } catch (error) {
            console.error("Error restore:", error);
            toast.error("Fallo en la restauración.");
        } finally {
            setIsRestoring(false);
            setConfirmText('');
            setSelectedFile(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Título */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold text-gray-900">Copias de Seguridad</h1>
                    <p className="text-gray-600 mt-2">Gestión de respaldos y restauración del sistema.</p>
                </div>

                {/* Crear Respaldo */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Save className="w-6 h-6 text-blue-600" />
                        Crear Respaldo Manual
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={handleCreateCloudOnly} 
                            disabled={isCreating} 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
                        >
                            {isCreating ? <Loader className="animate-spin h-5 w-5" /> : <Cloud className="w-5 h-5" />}
                            Guardar en Nube
                        </button>
                        <button 
                            onClick={handleCreateAndDownload} 
                            disabled={isCreating} 
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
                        >
                            {isCreating ? <Loader className="animate-spin h-5 w-5" /> : <CloudDownload className="w-5 h-5" />}
                            Guardar y Descargar
                        </button>
                    </div>
                </div>

                {/* --- CONFIGURACIÓN AUTOMÁTICA (FIXED) --- */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Settings className="w-6 h-6 text-blue-600" />
                        Configuración Automática
                    </h2>
                    
                    {loadingConfig ? (
                        <p className="text-gray-500">Cargando...</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Selector Frecuencia */}
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                                    <select
                                        value={schedule}
                                        onChange={(e) => setSchedule(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                                    >
                                        <option value="disabled">Desactivado</option>
                                        <option value="hourly">Cada hora</option>
                                        <option value="daily">Diario</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="scheduled">Fecha Específica</option>
                                    </select>
                                </div>

                                {/* Input Fecha (SOLO SI ES SCHEDULED) */}
                                {schedule === 'scheduled' && (
                                    <div className="flex-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Fecha y Hora (Local)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            // 🔥 SIN PROPIEDAD MIN - Libertad total 🔥
                                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleSaveConfig} 
                                disabled={isSavingConfig} 
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
                            >
                                {isSavingConfig ? <Loader className="animate-spin h-5 w-5" /> : <Save className="w-5 h-5" />}
                                Guardar Configuración
                            </button>

                            {lastBackupAt && (
                                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>Último backup auto: {formatDateTimeDisplay(lastBackupAt)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Historial (Sin cambios) */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <History className="w-6 h-6 text-blue-600" />
                            Historial
                        </h2>
                    </div>
                    
                    {loadingHistory ? (
                        <div className="p-6 text-center text-gray-500">Cargando historial...</div>
                    ) : history.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">Sin copias de seguridad.</div>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTimeDisplay(backup.created_at)}</td>
                                            <td className="px-6 py-4">{getBackupTypePill(backup.backup_type)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{backup.file_name}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDownloadSpecific(backup.id, backup.file_name)}
                                                    disabled={downloadingId === backup.id}
                                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-gray-100 font-medium py-2 px-3 rounded-lg text-sm flex items-center gap-1"
                                                >
                                                    {downloadingId === backup.id ? <Loader className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
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

                {/* Restaurar (Sin cambios) */}
                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                    <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2 mb-4">
                        <Upload className="w-6 h-6" />
                        Restaurar desde Archivo
                    </h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                         <p className="text-red-700 text-sm font-bold">⚠️ ADVERTENCIA: Esto reemplazará TODOS los datos actuales.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                            type="file"
                            accept=".sql,.backup"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"
                        />
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            disabled={!selectedFile || isRestoring} 
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
                        >
                            {isRestoring ? <Loader className="animate-spin h-4 w-4" /> : <Upload className="w-4 h-4" />}
                            Restaurar
                        </button>
                    </div>
                </div>

                {/* Modal Confirmación */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Estás seguro?</h2>
                        <p className="text-gray-600 mb-4">Escribe <strong className="text-red-600">RESTAURAR</strong> para confirmar.</p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-center mb-4"
                            placeholder="Escribe RESTAURAR"
                        />
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                            <button
                                onClick={handleRestore}
                                disabled={confirmText !== 'RESTAURAR'}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-400"
                            >
                                Restaurar Datos
                            </button>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
}

export default BackupsPage;