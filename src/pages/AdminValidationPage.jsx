// src/pages/AdminValidationPage.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import { Check, X, FileText, Download, User, ShieldAlert, Loader, ShieldCheck } from 'lucide-react';

// Estilos de botones (sin cambios)
const btnApprove = "px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center gap-2";
const btnReject = "px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm flex items-center gap-2";
const btnSecondary = "px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-sm";
const badgeVerified = "px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold";
const badgePending = "px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold";

function AdminValidationPage() {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Cargar TODOS los profesionales ---
    const fetchAllProfessionals = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/users/', {
                params: {
                    user_type: 'professional'
                }
            });
            
            const allProfessionals = (response.data.results || response.data).filter(
                user => user.professional_profile
            );
            
            const professionalsWithDocs = await Promise.all(
                allProfessionals.map(async (prof) => {
                    try {
                        // --- ¡FIX 1! ---
                        // Cambiado de /admin/professionals/<profile_id>/...
                        // a /admin/users/<user_id>/...
                        const docsResponse = await apiClient.get(
                            `/admin/users/${prof.id}/verification-documents/`
                        );
                        // --- FIN DEL FIX 1 ---
                        
                        return { ...prof, verification_documents: docsResponse.data.results || [] };
                    } catch (err) {
                        // Ignoramos los 404 (aún no existe el endpoint o no hay docs)
                        if (err.response && err.response.status === 404) {
                            return { ...prof, verification_documents: [] };
                        }
                        console.error(`Error cargando docs para ${prof.email}:`, err);
                        return { ...prof, verification_documents: [] };
                    }
                })
            );

            setProfessionals(professionalsWithDocs);
            
        } catch (err) {
            console.error("Error fetching users:", err);
            let errorMsg = 'No se pudo cargar la lista de profesionales.';
            if (err.code === 'ECONNABORTED') {
                 errorMsg = 'La petición tardó demasiado (timeout). Verifica el rendimiento del backend.';
            }
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllProfessionals();
    }, []);

    // --- Acción para APROBAR ---
    const handleApprove = async (profileId, userId) => {
        if (!window.confirm("¿Estás seguro de que quieres APROBAR a este profesional?")) return;

        try {
            // --- ¡FIX 2! ---
            // Cambiado de PATCH /admin/professionals/<profile_id>/
            // a POST /admin/users/<user_id>/verify-profile/
            await apiClient.post(`/admin/users/${userId}/verify-profile/`);
            // --- FIN DEL FIX 2 ---

            toast.success("¡Profesional aprobado exitosamente!");
            setProfessionals(prev => prev.map(p =>
                p.id === userId
                ? { ...p, professional_profile: { ...p.professional_profile, is_verified: true } }
                : p
            ));
        } catch (err) {
            console.error("Error al aprobar:", err);
            toast.error("Error al aprobar el profesional.");
        }
    };

    // --- Acción para RECHAZAR (Sin cambios, ya estaba bien) ---
    const handleReject = async (userId, fullName) => {
        if (!window.confirm(`¿Estás seguro de que quieres RECHAZAR y ELIMINAR a ${fullName}? Esta acción no se puede deshacer.`)) return;

        try {
            await apiClient.delete(`/admin/users/${userId}/`);
            toast.success(`Profesional "${fullName}" rechazado y eliminado.`);
            setProfessionals(prev => prev.filter(p => p.id !== userId));
        } catch (err) {
            console.error("Error al rechazar:", err);
            toast.error("Error al rechazar el profesional.");
        }
    };

    // --- Renderizado (Sin cambios) ---
    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader className="animate-spin h-8 w-8 text-primary" />
                <p className="ml-4 text-muted-foreground">Cargando profesionales...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-destructive">{error}</p>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-2">Gestión de Profesionales</h1>
            <p className="text-muted-foreground mb-8">
                Administra y valida a todos los psicólogos registrados en la clínica.
            </p>
            
            {professionals.length === 0 ? (
                <div className="bg-card text-card-foreground p-12 rounded-xl text-center shadow-lg">
                    <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-primary mb-2">No hay Profesionales</h3>
                    <p className="text-muted-foreground">
                        Aún no se ha registrado ningún profesional en esta clínica.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {professionals.map(prof => {
                        const isVerified = prof.professional_profile?.is_verified;

                        return (
                            <div key={prof.id} className="bg-card p-6 rounded-xl shadow-lg border border-border">
                                <div className="flex flex-col md:flex-row justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-2xl font-bold text-foreground">{prof.full_name}</h2>
                                            <span className={isVerified ? badgeVerified : badgePending}>
                                                {isVerified ? 'Verificado' : 'Pendiente'}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground">{prof.email}</p>
                                        <p className="font-mono text-sm text-primary mt-1">
                                            Licencia: {prof.professional_profile?.license_number || "N/A"}
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-2 mt-4 md:mt-0 flex-shrink-0">
                                        {isVerified ? (
                                            <span className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-semibold text-sm flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-green-600" /> Aprobado
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleReject(prof.id, prof.full_name)}
                                                    className={btnReject}
                                                >
                                                    <X className="h-4 w-4" /> Rechazar
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(prof.professional_profile.id, prof.id)}
                                                    className={btnApprove}
                                                >
                                                    <Check className="h-4 w-4" /> Aprobar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-border my-4"></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-2">Especialidades Solicitadas:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {prof.professional_profile?.specializations.length > 0 ? (
                                                prof.professional_profile.specializations.map(spec => (
                                                    <span key={spec.id} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                                                        {spec.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No especificó especialidades.</p>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-foreground mt-4 mb-2">Datos Adicionales:</h4>
                                        <p className="text-sm text-muted-foreground">
                                            <strong>Años de Exp:</strong> {prof.professional_profile?.experience_years || 'N/A'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <strong>Ciudad:</strong> {prof.professional_profile?.city || 'N/A'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-2">Documentos de Verificación:</h4>
                                        {prof.verification_documents.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">El profesional no ha subido documentos.</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {prof.verification_documents.map(doc => (
                                                    <li key={doc.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                                            <span className="text-sm font-medium text-foreground truncate" title={doc.description}>
                                                                {doc.description}
                                                            </span>
                                                        </div>
                                                        <a
                                                            href={doc.file_url} 
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={btnSecondary}
                                                        >
                                                            <Download className="h-4 w-4" /> Ver
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

export default AdminValidationPage;