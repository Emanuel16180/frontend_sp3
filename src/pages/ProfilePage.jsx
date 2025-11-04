// src/pages/ProfilePage.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'sonner';
// AÑADIMOS NUEVOS ICONOS
import { User, Save, X, Phone, Mail, MapPin, Calendar, Edit, ClipboardList, MessageSquare } from 'lucide-react';

// --- Constantes de Estilo ---
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center";
// ... (resto de tus constantes)
// ... (resto de tus componentes ProfileInput y ProfileField)
// --- Constantes de Estilo ---
const btnOutline = "px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors";

// --- Componente de Input (para modo edición) ---
function ProfileInput({ label, name, value, onChange, disabled = false, type = "text" }) {
// ... (código existente sin cambios)
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

// --- Componente de Campo (para modo lectura) ---
function ProfileField({ label, value, icon: Icon }) {
// ... (código existente sin cambios)
  return (
    <div>
      <label className="text-sm font-medium text-primary">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <p className="text-sm text-foreground">{value || 'No especificado'}</p>
      </div>
    </div>
  );
}

function ProfilePage() {
    const [profileData, setProfileData] = useState(null);
// ... (código existente de estados)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false); // <-- Estado de edición (como en la plantilla)

    // --- Carga de Datos ---
    const fetchProfile = async () => {
// ... (código existente de fetchProfile)
// ... (código existente de fetchProfile)
// ... (código existente de fetchProfile)
        try {
            const response = await apiClient.get('/users/profile/');
            setProfileData(response.data);
        } catch (err) {
            setError('No se pudo cargar tu perfil.');
            toast.error('No se pudo cargar tu perfil.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
// ... (código existente de useEffect)
        fetchProfile();
    }, []);

    // --- Manejador de Cambios (¡NUEVO!) ---
    // Maneja los cambios en los datos del usuario Y en el perfil del paciente anidado
    const handleChange = (e) => {
// ... (código existente de handleChange)
// ... (código existente de handleChange)
// ... (código existente de handleChange)
        const { name, value } = e.target;
        
        // Verifica si el campo pertenece al perfil de paciente
        if (['emergency_contact_name', 'emergency_contact_phone', 'occupation'].includes(name)) {
            setProfileData(prev => ({
                ...prev,
                patient_profile: {
                    ...prev.patient_profile,
                    [name]: value,
                }
            }));
        } else {
            // Es un campo del usuario principal
            setProfileData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // --- Manejador de Envío (¡CORREGIDO!) ---
    // Ahora usa el endpoint correcto del backend (/complete-profile/)
    // y envía los datos en el formato anidado que el backend espera.
    const handleSubmit = async (e) => {
// ... (código existente de handleSubmit)
// ... (código existente de handleSubmit)
// ... (código existente de handleSubmit)
        e.preventDefault();
        try {
            // Preparamos los datos en el formato { user_data: {...}, patient_data: {...} }
            const dataToSubmit = {
                user_data: {
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    phone: profileData.phone,
                    date_of_birth: profileData.date_of_birth,
                    address: profileData.address,
                },
                patient_data: {
                    emergency_contact_name: profileData.patient_profile?.emergency_contact_name,
                    emergency_contact_phone: profileData.patient_profile?.emergency_contact_phone,
                    occupation: profileData.patient_profile?.occupation,
                }
            };

            await apiClient.put('/users/complete-profile/', dataToSubmit);
            toast.success('¡Perfil actualizado con éxito!');
            setIsEditing(false);
            fetchProfile(); // Recargamos los datos
        } catch (err) {
            toast.error('Hubo un error al actualizar tu perfil.');
        }
    };
    
    // --- Cancelar Edición ---
    const handleCancel = () => {
// ... (código existente de handleCancel)
        setIsEditing(false);
        fetchProfile(); // Restaura los datos originales
    }

    if (loading) return <p className="text-center text-muted-foreground">Cargando tu perfil...</p>;
// ... (código existente de loading/error)
    if (error) return <p className="text-center text-destructive">{error}</p>;
    if (!profileData) return null;

    // --- JSX REFACTORIZADO ---
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">

                <h1 className="text-3xl font-bold text-primary">Mi Perfil</h1>
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
                          <span>Guardar</span>
                      </button>
                  </div>
                )}
            </div>

            {/* Tarjeta de Información Personal */}
            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Información Personal</span>
                </h2>

                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isEditing ? (
                            <ProfileInput label="Nombre" name="first_name" value={profileData.first_name} onChange={handleChange} />
                        ) : (
                            <ProfileField label="Nombre" value={profileData.first_name} />
                        )}

                        {isEditing ? (
                            <ProfileInput label="Apellido" name="last_name" value={profileData.last_name} onChange={handleChange} />
                        ) : (
                            <ProfileField label="Apellido" value={profileData.last_name} />
                        )}

                        {isEditing ? (
                            <ProfileInput label="Email" name="email" value={profileData.email} disabled={true} />
                        ) : (
                            <ProfileField label="Email" value={profileData.email} icon={Mail} />
                        )}
                        
                        {isEditing ? (
                            <ProfileInput label="Teléfono" name="phone" value={profileData.phone} onChange={handleChange} />
                        ) : (
                            <ProfileField label="Teléfono" value={profileData.phone} icon={Phone} />
                        )}

                        {isEditing ? (
                            <ProfileInput label="Cédula de Identidad" name="ci" value={profileData.ci} disabled={true} />
                        ) : (
                            <ProfileField label="Cédula de Identidad" value={profileData.ci} />
                        )}

                        {isEditing ? (
                            <ProfileInput label="Fecha de Nacimiento" name="date_of_birth" value={profileData.date_of_birth} onChange={handleChange} type="date" />
                        ) : (
                            <ProfileField label="Fecha de Nacimiento" value={profileData.date_of_birth} icon={Calendar} />
                        )}
                    </div>
                    
                    {isEditing ? (
                        <ProfileInput label="Dirección" name="address" value={profileData.address} onChange={handleChange} />
                    ) : (
                        <ProfileField label="Dirección" value={profileData.address} icon={MapPin} />
                    )}
                </form>
            </div>
            
            {/* Tarjeta de Perfil de Paciente (Campos Adicionales) */}
            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border mt-6">
               <h2 className="text-xl font-semibold text-primary mb-6">
                    Información Adicional
                </h2>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isEditing ? (
                            <ProfileInput label="Contacto de Emergencia" name="emergency_contact_name" value={profileData.patient_profile?.emergency_contact_name} onChange={handleChange} />
                        ) : (
                            <ProfileField label="Contacto de Emergencia" value={profileData.patient_profile?.emergency_contact_name} />
                        )}

                        {isEditing ? (
                            <ProfileInput label="Teléfono de Emergencia" name="emergency_contact_phone" value={profileData.patient_profile?.emergency_contact_phone} onChange={handleChange} />
                        ) : (
                            <ProfileField label="Teléfono de Emergencia" value={profileData.patient_profile?.emergency_contact_phone} />
                        )}

                        {isEditing ? (
                            <ProfileInput label="Ocupación" name="occupation" value={profileData.patient_profile?.occupation} onChange={handleChange} />
                        ) : (
                            <ProfileField label="Ocupación" value={profileData.patient_profile?.occupation} />
                        )}
                    </div>
                </form>
            </div>

            {/* --- INICIO DE LA NUEVA SECCIÓN --- */}
            {/* Solo mostrar si NO estamos editando Y si existe un pre_diagnosis */}
            {!isEditing && profileData.patient_profile?.pre_diagnosis && (
                <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border mt-6">
                    <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        <span>Resumen de Bienestar (Triaje Inicial)</span>
                    </h2>

                    <div className="space-y-6">
                        <ProfileField 
                            label="Pre-diagnóstico" 
                            value={profileData.patient_profile.pre_diagnosis} 
                            icon={ClipboardList} // Reutilizamos el icono
                        />
                        <ProfileField 
                            label="Recomendación" 
                            value={profileData.patient_profile.recommendation} 
                            icon={MessageSquare}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
                        Este es un resumen basado en tus respuestas iniciales al registrarte. No es un diagnóstico definitivo y tu profesional asignado realizará una evaluación completa.
                    </p>
                </div>
            )}
            {/* --- FIN DE LA NUEVA SECCIÓN --- */}

        </div>
    );
}

export default ProfilePage;
