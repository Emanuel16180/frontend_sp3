// src/pages/PsychologistProfilePage.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'sonner';
// Iconos añadidos: Upload y ShieldCheck
import { User, Save, X, Edit, DollarSign, Brain, BookOpen, Clock, MapPin, Upload, ShieldCheck, FileText } from 'lucide-react';

// --- Constantes de Estilo ---
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center";
const btnOutline = "px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors";
const btnDisabled = "px-4 py-2 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed text-sm text-center";

// --- Componente de Input (reutilizado) ---
function ProfileInput({ label, name, value, onChange, disabled = false, type = "text" }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/50"
      />
    </div>
  );
}

// --- Componente de Textarea (reutilizado) ---
function ProfileTextarea({ label, name, value, onChange, disabled = false, rows = 3 }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/50"
      />
    </div>
  );
}

// --- NUEVO: Componente de Checkbox ---
function CheckboxInput({ label, name, checked, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-input border border-border rounded-lg">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked || false}
        onChange={onChange}
        disabled={disabled}
        className="h-5 w-5 rounded text-primary focus:ring-ring disabled:bg-muted/50"
      />
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
    </div>
  );
}


function PsychologistProfilePage() {
    const [profile, setProfile] = useState({
      specializations: [] // Asegurarse que specializations sea un array
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // --- NUEVO: Estado para subida de verificación ---
    const [verificationFile, setVerificationFile] = useState(null);
    const [verificationDesc, setVerificationDesc] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // --- Carga de Datos ---
    const fetchProfile = async () => {
        try {
            const response = await apiClient.get('/professionals/profile/');
            // Asegurarse que specializations siempre sea un array
            setProfile({ ...response.data, specializations: response.data.specializations || [] });
        } catch (err) {
            setError('No se pudo cargar tu perfil profesional.');
            toast.error('No se pudo cargar tu perfil profesional.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // --- Manejador de Cambios (ACTUALIZADO para checkboxes) ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setProfile(prev => ({
            ...prev,
            // Si es un checkbox, usa 'checked', si no, usa 'value'
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- Manejador de Envío (ACTUALIZADO para nuevos campos) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                // Datos del perfil
                license_number: profile.license_number,
                city: profile.city,
                experience_years: profile.experience_years,
                consultation_fee: profile.consultation_fee,
                bio: profile.bio,
                education: profile.education,
                
                // --- NUEVOS CAMPOS AÑADIDOS ---
                state: profile.state,
                session_duration: profile.session_duration,
                accepts_online_sessions: profile.accepts_online_sessions,
                accepts_in_person_sessions: profile.accepts_in_person_sessions,

                // Enviar solo los IDs de especialización
                specialization_ids: profile.specializations.map(s => s.id) 
            };
            
            await apiClient.put('/professionals/profile/', dataToSubmit);
            toast.success('¡Perfil actualizado con éxito!');
            setIsEditing(false);
            fetchProfile(); // Recargamos
        } catch (err) {
            toast.error('Hubo un error al guardar tu perfil.');
        }
    };

    // --- Cancelar Edición ---
    const handleCancel = () => {
        setIsEditing(false);
        fetchProfile(); // Restaura los datos originales
    }

// --- NUEVO: Manejador para subida de verificación ---
    const handleVerificationUpload = async (e) => {
        e.preventDefault();
        if (!verificationFile) {
            toast.error("Por favor, selecciona un archivo para subir.");
            return;
        }
        if (!verificationDesc.trim()) {
            toast.error("Por favor, añade una descripción (ej: 'Título de Licenciatura').");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', verificationFile);
        formData.append('description', verificationDesc);

        try {
            // --- ¡CORRECCIÓN! ---
            // Se eliminó el error simulado y se activó la llamada real.
            
            // Esta es la llamada real a tu backend
            await apiClient.post('/professionals/upload-verification/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('¡Documento enviado para verificación!');
            
            // Limpiamos los campos después de subir
            setVerificationFile(null);
            setVerificationDesc('');
            // Limpiamos el input del archivo visualmente
            document.getElementById('verificationFile').value = null; 
            // ---------------------

        } catch (err) {
            console.error("Error subiendo documento:", err);
            // Mensaje de error real del backend
            const errorMessage = err.response?.data?.error || "No se pudo subir el archivo.";
            toast.error(`Error al subir: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };


    if (loading) return <p className="text-center text-muted-foreground">Cargando perfil...</p>;
    if (error) return <p className="text-center text-destructive">{error}</p>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-primary">Mi Perfil Profesional</h1>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className={`${btnPrimary} flex items-center gap-2`}>
                      <Edit className="h-4 w-4" />
                      <span>Editar Perfil</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                      <button onClick={handleCancel} className={`${btnOutline} flex items-center gap-2`}>
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                      </button>
                      <button onClick={handleSubmit} className={`${btnPrimary} flex items-center gap-2`}>
                          <Save className="h-4 w-4" />
                          <span>Guardar Cambios</span>
                      </button>
                  </div>
                )}
            </div>

            {/* Tarjeta de Perfil Profesional (Formulario Principal) */}
            <form onSubmit={handleSubmit} className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                <div className="space-y-4">
                    {/* --- FILA 1 --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileInput label="Nombre Completo" name="full_name" value={profile.full_name} disabled={true} />
                        <ProfileInput label="Email" name="email" value={profile.email} disabled={true} />
                    </div>
                    {/* --- FILA 2 --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileInput label="Número de Licencia" name="license_number" value={profile.license_number} onChange={handleChange} disabled={!isEditing} />
                        <ProfileInput label="Años de Experiencia" name="experience_years" value={profile.experience_years} onChange={handleChange} disabled={!isEditing} type="number" />
                    </div>
                    {/* --- FILA 3 (NUEVOS CAMPOS) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <ProfileInput label="Ciudad" name="city" value={profile.city} onChange={handleChange} disabled={!isEditing} />
                         <ProfileInput label="Estado / Departamento" name="state" value={profile.state} onChange={handleChange} disabled={!isEditing} />
                    </div>
                     {/* --- FILA 4 (NUEVOS CAMPOS) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileInput label="Tarifa por Consulta (Bs.)" name="consultation_fee" value={profile.consultation_fee} onChange={handleChange} disabled={!isEditing} type="number" />
                        <ProfileInput label="Duración de Sesión (min)" name="session_duration" value={profile.session_duration} onChange={handleChange} disabled={!isEditing} type="number" />
                    </div>
                     {/* --- FILA 5 (NUEVOS CAMPOS) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CheckboxInput label="Acepta Sesiones Online" name="accepts_online_sessions" checked={profile.accepts_online_sessions} onChange={handleChange} disabled={!isEditing} />
                        <CheckboxInput label="Acepta Sesiones Presenciales" name="accepts_in_person_sessions" checked={profile.accepts_in_person_sessions} onChange={handleChange} disabled={!isEditing} />
                    </div>
                    
                    <ProfileTextarea label="Biografía" name="bio" value={profile.bio} onChange={handleChange} disabled={!isEditing} rows={4} />
                    <ProfileTextarea label="Formación Académica" name="education" value={profile.education} onChange={handleChange} disabled={!isEditing} rows={3} />

                    {/* Mostrar Especialidades (Modo lectura) */}
                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Especialidades</label>
                            <div className="flex flex-wrap gap-2">
                                {profile.specializations && profile.specializations.length > 0 ? (
                                    profile.specializations.map(spec => (
                                        <span key={spec.id} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                                            {spec.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay especialidades asignadas.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </form>

            {/* --- NUEVA SECCIÓN: VERIFICACIÓN DE PERFIL --- */}
            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Verificación de Perfil
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Sube tus documentos (título, licencia, etc.) para que los administradores puedan verificar tu perfil. Esto aumentará la confianza de los pacientes.
                </p>

                <form onSubmit={handleVerificationUpload} className="space-y-4">
                    <div>
                        <label htmlFor="verificationDesc" className="block text-sm font-medium text-foreground mb-1">Descripción del Documento</label>
                        <input
                            type="text"
                            id="verificationDesc"
                            value={verificationDesc}
                            onChange={(e) => setVerificationDesc(e.target.value)}
                            placeholder="Ej: Título de Licenciatura en Psicología"
                            className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <div>
                        <label htmlFor="verificationFile" className="block text-sm font-medium text-foreground mb-1">Archivo (PDF, JPG, PNG)</label>
                        <input
                            type="file"
                            id="verificationFile"
                            onChange={(e) => setVerificationFile(e.target.files[0])}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:hover:bg-primary/90"
                        />
                    </div>
                    
                    {verificationFile && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm">{verificationFile.name}</span>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isUploading || !verificationFile}
                            className={isUploading || !verificationFile ? btnDisabled : btnPrimary}
                        >
                            <Upload className="h-4 w-4" />
                            {isUploading ? 'Subiendo...' : 'Subir Documento'}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}

export default PsychologistProfilePage;