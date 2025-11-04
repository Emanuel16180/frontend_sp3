// src/pages/DocumentsPage.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import { Upload, FileText, User } from 'lucide-react';

// Constantes de estilo para mantener consistencia
const btnPrimary = "px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2";
const btnDisabled = "px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed flex items-center gap-2";

function DocumentsPage() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. Cargar la lista de pacientes del psicólogo
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await apiClient.get('/clinical-history/my-patients/');
                // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
                // La API devuelve un objeto paginado: { count, next, previous, results }
                // Necesitamos extraer solo el array 'results'
                setPatients(response.data.results || []); 
            } catch (error) {
                console.error('Error al cargar pacientes:', error);
                toast.error("No se pudo cargar tu lista de pacientes.");
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    // 2. Manejar la subida del formulario
    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!selectedPatient || !description || !file) {
            toast.warning("Por favor, completa todos los campos.");
            return;
        }

        // Validar tipo de archivo
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            toast.error("Tipo de archivo no permitido. Solo se aceptan PDF, DOC, DOCX, TXT, JPG y PNG.");
            return;
        }

        // Validar tamaño del archivo (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("El archivo es demasiado grande. El tamaño máximo es 10MB.");
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('patient', selectedPatient);
        formData.append('description', description);
        formData.append('file', file);

        try {
            await apiClient.post('/clinical-history/documents/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            const selectedPatientName = patients.find(p => p.id.toString() === selectedPatient)?.full_name || 'el paciente';
            toast.success(`¡Documento subido exitosamente para ${selectedPatientName}!`);
            
            // Limpiar formulario
            setSelectedPatient('');
            setDescription('');
            setFile(null);
            e.target.reset(); // Limpia el input de archivo
            
        } catch (error) {
            console.error('Error al subir documento:', error);
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.detail || 
                               "Error al subir el documento.";
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return <p className="text-center text-muted-foreground">Cargando tu lista de pacientes...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-8">Subir Documento para Paciente</h1>
            
            {patients.length === 0 ? (
                <div className="bg-card text-card-foreground p-8 rounded-xl text-center shadow-lg">
                    <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-2">No tienes pacientes aún</h3>
                    <p className="text-muted-foreground">
                        Necesitas tener al menos una cita con un paciente antes de poder subirle documentos.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleUpload} className="bg-card p-8 rounded-xl shadow-lg space-y-6">
                    {/* Selector de Paciente */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Seleccionar Paciente *
                        </label>
                        <select 
                            value={selectedPatient} 
                            onChange={(e) => setSelectedPatient(e.target.value)} 
                            required
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">-- Elige un paciente --</option>
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.full_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Descripción del Documento */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Descripción del Documento *
                        </label>
                        <input 
                            type="text" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Ej: Libro de apoyo sobre ansiedad, ejercicios de relajación..." 
                            required
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Selector de Archivo */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Archivo *
                        </label>
                        <input 
                            type="file" 
                            onChange={(e) => setFile(e.target.files[0])} 
                            required
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:hover:bg-primary/90"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Archivos permitidos: PDF, DOC, DOCX, TXT, JPG, PNG. Tamaño máximo: 10MB
                        </p>
                        {file && (
                            <div className="mt-2 p-2 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-sm">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                        <button 
                            type="submit" 
                            disabled={isUploading}
                            className={isUploading ? btnDisabled : btnPrimary}
                        >
                            <Upload className="h-4 w-4" />
                            {isUploading ? 'Subiendo...' : 'Subir Documento'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default DocumentsPage;