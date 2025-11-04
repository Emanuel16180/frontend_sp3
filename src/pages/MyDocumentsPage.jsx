import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import { Download, FileText, Calendar, User, BookOpen } from 'lucide-react';

function MyDocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await apiClient.get('/clinical-history/my-documents/');
                setDocuments(response.data.results || []);
            } catch (error) {
                console.error('Error al cargar documentos:', error);
                toast.error("No se pudieron cargar tus documentos.");
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    // Función para descargar documento de forma segura usando el endpoint de descarga
    const handleDownload = async (docId, fileName) => {
        try {
            const response = await apiClient.get(`/clinical-history/documents/${docId}/download/`, {
                responseType: 'blob'
            });
            
            // Crear URL temporal del blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'documento.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Documento descargado exitosamente');
        } catch (error) {
            console.error('Error al descargar documento:', error);
            toast.error('No se pudo descargar el documento');
        }
    };

    // Función para obtener el icono según el tipo de archivo
    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf': return '';
            case 'doc':
            case 'docx': return '';
            case 'txt': return '';
            case 'jpg':
            case 'jpeg':
            case 'png': return '';
            default: return '';
        }
    };

    // Función para formatear el tamaño del archivo
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return <p className="text-center text-muted-foreground">Cargando tus documentos...</p>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-8">Mis Documentos</h1>

            {documents.length === 0 ? (
                <div className="bg-card text-card-foreground p-12 rounded-xl text-center shadow-lg">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-primary mb-2">No tienes documentos aún</h3>
                    <p className="text-muted-foreground">
                        Cuando tus psicólogos te compartan material de apoyo, aparecerá aquí.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-6 p-4 bg-primary/10 border-l-4 border-primary rounded-lg">
                        <p className="text-sm text-primary">
                            <strong>Total de documentos:</strong> {documents.length}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {documents.map(doc => (
                            <div
                                key={doc.id}
                                className="bg-card p-6 rounded-xl shadow hover:shadow-md transition-shadow border border-border"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Icono del archivo */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                                                {getFileIcon(doc.file_name || '')}
                                            </div>
                                        </div>

                                        {/* Información del documento */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-foreground mb-1">
                                                {doc.description}
                                            </h3>

                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    <span>Subido por: <strong>{doc.uploaded_by_name}</strong></span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Fecha: {new Date(doc.uploaded_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>

                                                {doc.file_size && (
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        <span>Tamaño: {formatFileSize(doc.file_size)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón de descarga */}
                                    <div className="flex-shrink-0 ml-4">
                                        <button
                                            onClick={() => handleDownload(doc.id, doc.file_name)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            Descargar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default MyDocumentsPage;
