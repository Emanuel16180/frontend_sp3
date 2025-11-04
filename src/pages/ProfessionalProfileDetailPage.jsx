// src/pages/ProfessionalProfileDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api';
import { Award, Briefcase, Calendar, Clock, DollarSign, GraduationCap, Home, Mail, Phone, ShieldCheck, Star, ArrowLeft, MapPin } from 'lucide-react';

const InfoCard = ({ icon, label, value, className = "" }) => (
    <div className={`bg-background p-4 border border-border rounded-lg flex items-start gap-4 ${className}`}>
        <div className="text-green-600 mt-1">{icon}</div>
        <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold text-foreground text-base">{value || "No especificado"}</p>
        </div>
    </div>
);

function ProfessionalProfileDetailPage() {
    const { userId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Reutilizamos el mismo endpoint, ya que devuelve el perfil profesional anidado
                const response = await apiClient.get(`/admin/users/${userId}/`);
                if (response.data && response.data.user_type === 'professional' && response.data.professional_profile) {
                    setProfileData(response.data);
                } else {
                    setError('Este usuario no es un profesional o no tiene un perfil completo.');
                }
            } catch (err) {
                console.error("Error fetching professional profile:", err);
                setError('No se pudo cargar el perfil profesional.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-muted-foreground">Cargando perfil profesional...</p>
        </div>
    );
    
    if (error) return (
        <div className="max-w-5xl mx-auto p-4">
            <Link to={`/admin/user/${userId}`} className="text-sm text-primary hover:underline mb-4 inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Volver al perfil de usuario
            </Link>
            <p className="text-center mt-8 text-destructive">{error}</p>
        </div>
    );
    
    if (!profileData) return null;

    const { professional_profile: profile, full_name, email, phone, first_name, last_name } = profileData;

    return (
        <div className="max-w-5xl mx-auto p-4">
            <Link to={`/admin/user/${userId}`} className="text-sm text-primary hover:underline mb-4 inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Volver al perfil de usuario
            </Link>

            <div className="bg-card rounded-xl shadow-lg p-8">
                <header className="flex flex-col sm:flex-row items-center gap-6 mb-8 border-b border-border pb-8">
                    <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center text-5xl font-bold text-green-600">
                        {first_name?.charAt(0)}{last_name?.charAt(0)}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-4xl font-bold text-foreground">{full_name || `${first_name} ${last_name}`}</h1>
                        <p className="text-green-600 font-semibold text-lg mt-1">Psicólogo Profesional</p>
                        <div className="flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-6 mt-4 text-sm">
                            <span className="flex items-center gap-2 text-muted-foreground">
                                <Mail size={16} /> {email}
                            </span>
                            {phone && (
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Phone size={16} /> {phone}
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Información principal en tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <InfoCard 
                        icon={<Award size={24} />} 
                        label="Nro. de Licencia" 
                        value={profile.license_number} 
                    />
                    <InfoCard 
                        icon={<ShieldCheck size={24} />} 
                        label="Estado de Verificación" 
                        value={profile.is_verified ? "✅ Verificado" : "⏳ Pendiente de Verificación"} 
                    />
                    <InfoCard 
                        icon={<Calendar size={24} />} 
                        label="Años de Experiencia" 
                        value={profile.experience_years ? `${profile.experience_years} años` : null} 
                    />
                    <InfoCard 
                        icon={<DollarSign size={24} />} 
                        label="Tarifa por Sesión" 
                        value={profile.consultation_fee ? `Bs. ${profile.consultation_fee}` : null} 
                    />
                    <InfoCard 
                        icon={<Clock size={24} />} 
                        label="Duración de Sesión" 
                        value={profile.session_duration ? `${profile.session_duration} minutos` : null} 
                    />
                    <InfoCard 
                        icon={<Star size={24} />} 
                        label="Calificación Promedio" 
                        value={profile.average_rating && profile.total_reviews ? 
                            `⭐ ${profile.average_rating}/5 (${profile.total_reviews} reseñas)` : 
                            "Sin calificaciones aún"
                        } 
                    />
                </div>

                {/* Secciones completas */}
                <div className="space-y-6">
                    {/* Especialidades */}
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                            <Briefcase size={20} />
                            Especialidades
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.specializations && profile.specializations.length > 0 ? (
                                profile.specializations.map((spec, index) => (
                                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {spec.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-green-600">No se han especificado especialidades</span>
                            )}
                        </div>
                    </div>

                    {/* Educación */}
                    {profile.education && (
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <GraduationCap size={20} />
                                Formación Académica
                            </h3>
                            <p className="text-blue-700 leading-relaxed">{profile.education}</p>
                        </div>
                    )}

                    {/* Dirección del consultorio */}
                    {profile.office_address && (
                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                <MapPin size={20} />
                                Dirección del Consultorio
                            </h3>
                            <p className="text-purple-700">{profile.office_address}</p>
                        </div>
                    )}

                    {/* Biografía */}
                    {profile.bio && (
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Award size={20} />
                                Biografía Profesional
                            </h3>
                            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                        </div>
                    )}
                </div>

                {/* Información adicional */}
                <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Información Adicional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Perfil creado:</span>
                            <span className="font-medium">{new Date(profileData.date_joined).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Último acceso:</span>
                            <span className="font-medium">
                                {profileData.last_login ? 
                                    new Date(profileData.last_login).toLocaleDateString('es-ES') : 
                                    'Nunca'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Estado de cuenta:</span>
                            <span className={`font-medium ${profileData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                {profileData.is_active ? '✅ Activa' : '❌ Desactivada'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email verificado:</span>
                            <span className={`font-medium ${profileData.email_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                {profileData.email_verified ? '✅ Verificado' : '⏳ Pendiente'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfessionalProfileDetailPage;