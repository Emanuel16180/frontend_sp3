// src/pages/BackupsPage.jsx
import { useState } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

function BackupsPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // --- LÓGICA PARA CREAR Y DESCARGAR RESPALDO ---
    const handleCreateBackup = async () => {
        setIsCreating(true);
        toast.info("Generando copia de seguridad... Esto puede tardar unos segundos.");
        try {
            const response = await apiClient.post('/backups/create/', {}, {
                responseType: 'blob', // ¡Muy importante para que Axios maneje la descarga!
            });

            // Extraer el nombre del archivo del header de la respuesta
            const header = response.headers['content-disposition'];
            const filename = header ? header.split('filename=')[1].replace(/"/g, '') : 'backup.sql';

            // Crear un enlace temporal para iniciar la descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("¡Copia de seguridad descargada exitosamente!");
        } catch (error) {
            console.error("Error al crear la copia de seguridad:", error);
            toast.error("No se pudo generar la copia de seguridad.");
        } finally {
            setIsCreating(false);
        }
    };

    // --- LÓGICA PARA RESTAURAR DESDE ARCHIVO ---
    const handleRestore = async () => {
        if (!selectedFile) return;

        setIsRestoring(true);
        setIsModalOpen(false);
        toast.info("Iniciando restauración... La aplicación podría no responder por un momento.");

        const formData = new FormData();
        formData.append('backup_file', selectedFile);

        try {
            await apiClient.post('/backups/restore/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success("¡Restauración completada! Se recomienda cerrar sesión y volver a iniciar para ver todos los cambios.");
        } catch (error) {
            console.error("Error al restaurar:", error);
            const errorMessage = error.response?.data?.error || "Error desconocido durante la restauración.";
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
                        Crea respaldos de los datos de tu clínica o restaura el sistema a un punto anterior.
                    </p>
                </div>

                {/* Sección para Crear Copia de Seguridad */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Crear y Descargar Respaldo
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Esto generará un archivo cifrado con todos los datos de tu clínica (pacientes, citas, historiales) y lo descargará a tu computadora. Guarda este archivo en un lugar seguro.
                    </p>
                    <button 
                        onClick={handleCreateBackup} 
                        disabled={isCreating} 
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {isCreating ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Generando...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Iniciar Creación
                            </>
                        )}
                    </button>
                </div>

                {/* Sección para Restaurar Copia de Seguridad */}
                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                    <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Restaurar desde Archivo
                    </h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
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
                        Selecciona un archivo de respaldo previamente descargado para restaurar el estado de tu clínica a ese punto.
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <input
                            type="file"
                            accept=".sql"
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
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Restaurando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                    Restaurar
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Modal de Confirmación para Restaurar */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Estás absolutamente seguro?</h2>
                        
                        <p className="text-gray-600 mb-4">
                            Esta acción <strong>borrará permanentemente</strong> todos los datos actuales de la clínica y los reemplazará con los del archivo:
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
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setConfirmText('');
                                }} 
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