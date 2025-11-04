// src/pages/UserProfilePage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api';
import { Mail, Phone, User, Calendar, Briefcase, HeartPulse, ArrowLeft, ExternalLink } from 'lucide-react';

// Componente reutilizable para mostrar un campo de información
const InfoField = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="text-primary mt-1">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium text-foreground">{value || <span className="text-gray-400">No especificado</span>}</p>
        </div>
    </div>
);

function UserProfilePage() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await apiClient.get(`/admin/users/${userId}/`);
                setUser(response.data);
            } catch (err) {
                console.error("Error fetching user:", err);
                setError('No se pudo cargar el perfil del usuario.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
    );
    
    if (error) return (
        <div className="max-w-4xl mx-auto p-4">
            <Link to="/admin-dashboard" className="text-sm text-primary hover:underline mb-4 inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Volver al Dashboard
            </Link>
            <p className="text-center mt-8 text-destructive">{error}</p>
        </div>
    );
    
    if (!user) return (
        <div className="max-w-4xl mx-auto p-4">
            <Link to="/admin-dashboard" className="text-sm text-primary hover:underline mb-4 inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Volver al Dashboard
            </Link>
            <p className="text-center mt-8">Usuario no encontrado.</p>
        </div>
    );

    const isProfessional = user.user_type === 'professional';
    const isPatient = user.user_type === 'patient';

    return (
        <div className="max-w-4xl mx-auto p-4">
            <Link to="/admin-dashboard" className="text-sm text-primary hover:underline mb-4 inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Volver al Dashboard
            </Link>

            <div className="bg-card rounded-xl shadow-lg overflow-hidden">
                {/* Header del perfil */}
                <div className="p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-foreground">
                                {user.full_name || `${user.first_name} ${user.last_name}`}
                            </h1>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                                <span className={`px-3 py-1 inline-block text-sm font-bold rounded-full ${
                                    isProfessional ? 'bg-green-100 text-green-800' : 
                                    isPatient ? 'bg-blue-100 text-blue-800' : 
                                    'bg-purple-100 text-purple-800'
                                }`}>
                                    {isProfessional ? 'Psicólogo' : isPatient ? 'Paciente' : 'Administrador'}
                                </span>
                                
                                {/* 👇 BOTÓN AÑADIDO AQUÍ 👇 */}
                                {isProfessional && (
                                    <Link 
                                        to={`/admin/professional-profile/${user.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Ver Perfil Profesional <ExternalLink size={16} />
                                    </Link>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Miembro desde: {new Date(user.date_joined).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información Básica */}
                <div className="border-t border-border p-8">
                     <h2 className="text-xl font-semibold text-primary mb-6">Información de Contacto</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField icon={<Mail size={20} />} label="Email" value={user.email} />
                        <InfoField icon={<Phone size={20} />} label="Teléfono" value={user.phone} />
                        <InfoField icon={<User size={20} />} label="Cédula de Identidad" value={user.ci} />
                        <InfoField icon={<Calendar size={20} />} label="Fecha de Nacimiento" value={
                            user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('es-ES') : null
                        } />
                     </div>
                </div>

                {/* Perfil Específico para Profesionales */}
                {isProfessional && user.professional_profile && (
                    <div className="border-t border-border p-8 bg-green-50">
                        <h2 className="text-xl font-semibold text-green-700 mb-6">Resumen Profesional</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField 
                                icon={<Briefcase size={20} />} 
                                label="Licencia" 
                                value={user.professional_profile.license_number} 
                            />
                            <InfoField 
                                icon={<Calendar size={20} />} 
                                label="Años de Experiencia" 
                                value={user.professional_profile.experience_years ? `${user.professional_profile.experience_years} años` : null} 
                            />
                            <InfoField 
                                icon={<HeartPulse size={20} />} 
                                label="Tarifa por consulta" 
                                value={user.professional_profile.consultation_fee ? `Bs. ${user.professional_profile.consultation_fee}` : null} 
                            />
                            <InfoField 
                                icon={<Briefcase size={20} />} 
                                label="Especialidades" 
                                value={user.professional_profile.specializations?.map(s => s.name).join(', ')} 
                            />
                        </div>
                    </div>
                )}

                {/* Perfil Específico para Pacientes */}
                {isPatient && user.patient_profile && (
                    <div className="border-t border-border p-8 bg-blue-50">
                        <h2 className="text-xl font-semibold text-blue-700 mb-6">Perfil del Paciente</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField 
                                icon={<User size={20} />} 
                                label="Contacto de Emergencia" 
                                value={user.patient_profile.emergency_contact_name} 
                            />
                            <InfoField 
                                icon={<Phone size={20} />} 
                                label="Teléfono de Emergencia" 
                                value={user.patient_profile.emergency_contact_phone} 
                            />
                            <InfoField 
                                icon={<Briefcase size={20} />} 
                                label="Ocupación" 
                                value={user.patient_profile.occupation} 
                            />
                            <InfoField 
                                icon={<HeartPulse size={20} />} 
                                label="Estado Civil" 
                                value={user.patient_profile.marital_status} 
                            />
                        </div>
                        {user.patient_profile.medical_history && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-blue-700 mb-2">Historial Médico</h3>
                                <p className="text-foreground">{user.patient_profile.medical_history}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Información de Estado de la Cuenta */}
                <div className="border-t border-border p-8 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-700 mb-6">Estado de la Cuenta</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium">
                                {user.is_active ? 'Cuenta Activa' : 'Cuenta Desactivada'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${user.email_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-sm font-medium">
                                {user.email_verified ? 'Email Verificado' : 'Email Pendiente'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium">
                                Último acceso: {user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;