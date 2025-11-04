// src/pages/ClinicalHistoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api';
import { toast } from 'react-toastify';

function ClinicalHistoryPage() {
    const { patientId } = useParams();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('datos-personales');
    const [saving, setSaving] = useState(false);

    // Cargar los datos del historial clínico al montar el componente
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await apiClient.get(`/clinical-history/patient/${patientId}/`);
                setHistory(response.data);
            } catch (err) {
                console.error('Error cargando historial:', err);
                // Si no existe, crear un historial vacío
                if (err.response?.status === 404) {
                    setHistory({
                        patient: patientId,
                        consultation_reason: '',
                        history_of_illness: '',
                        personal_pathological_history: '',
                        family_history: '',
                        diagnoses: '',
                        therapeutic_plan: '',
                        risk_assessment: '',
                        sensitive_topics: ''
                    });
                } else {
                    setError('No se pudo cargar el historial clínico. Verifica tus permisos.');
                    toast.error('Error al cargar el historial.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [patientId]);

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setHistory(prev => ({ ...prev, [name]: value }));
    };

    // Guardar los cambios en el backend
    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.patch(`/clinical-history/patient/${patientId}/`, history);
            toast.success('¡Historial clínico guardado exitosamente!');
        } catch (err) {
            console.error('Error guardando historial:', err);
            toast.error('No se pudieron guardar los cambios.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando historial clínico...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error al Cargar</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Link 
                        to="/psychologist-dashboard" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Volver al Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="bg-blue-600 text-white p-6 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Historial Clínico Psicológico</h1>
                            <p className="text-blue-100">Paciente ID: {patientId}</p>
                        </div>
                        <Link 
                            to="/psychologist-dashboard"
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            ← Volver al Dashboard
                        </Link>
                    </div>

                    {/* Navegación por pestañas */}
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        <TabButton name="datos-personales" activeTab={activeTab} onClick={setActiveTab}>
                            📋 Datos Personales
                        </TabButton>
                        <TabButton name="motivo-historia" activeTab={activeTab} onClick={setActiveTab}>
                            🏥 Motivo e Historia
                        </TabButton>
                        <TabButton name="antecedentes" activeTab={activeTab} onClick={setActiveTab}>
                            👨‍👩‍👧‍👦 Antecedentes
                        </TabButton>
                        <TabButton name="diagnostico" activeTab={activeTab} onClick={setActiveTab}>
                            🎯 Diagnóstico y Plan
                        </TabButton>
                        <TabButton name="alertas" activeTab={activeTab} onClick={setActiveTab}>
                            ⚠️ Alertas y Riesgos
                        </TabButton>
                    </div>

                    {/* Contenido de las pestañas */}
                    <div className="p-6">
                        {/* Pestaña: Datos Personales */}
                        {activeTab === 'datos-personales' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Motivo de Consulta</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ¿Por qué el paciente solicita atención psicológica?
                                    </label>
                                    <textarea
                                        name="consultation_reason"
                                        value={history?.consultation_reason || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="4"
                                        placeholder="Describe el motivo principal de la consulta, síntomas presentados, y expectativas del paciente..."
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Observaciones Generales
                                    </label>
                                    <textarea
                                        name="sensitive_topics"
                                        value={history?.sensitive_topics || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Observaciones adicionales sobre el comportamiento, actitud o aspectos relevantes..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Pestaña: Motivo e Historia */}
                        {activeTab === 'motivo-historia' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Historia de la Enfermedad Actual (HEA)</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Relato cronológico de los síntomas y evolución
                                    </label>
                                    <textarea
                                        name="history_of_illness"
                                        value={history?.history_of_illness || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="8"
                                        placeholder="Detalla cronológicamente: cuándo comenzaron los síntomas, cómo han evolucionado, factores desencadenantes, tratamientos previos, etc..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Pestaña: Antecedentes */}
                        {activeTab === 'antecedentes' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Antecedentes</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Antecedentes Personales
                                    </label>
                                    <textarea
                                        name="personal_pathological_history"
                                        value={history?.personal_pathological_history || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="5"
                                        placeholder="Historial médico, psiquiátrico, consumo de sustancias, eventos traumáticos, cirugías, medicamentos actuales..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Antecedentes Familiares
                                    </label>
                                    <textarea
                                        name="family_history"
                                        value={history?.family_history || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="4"
                                        placeholder="Historial de enfermedades mentales, suicidios, adicciones, enfermedades hereditarias en la familia..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Pestaña: Diagnóstico y Plan */}
                        {activeTab === 'diagnostico' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Diagnóstico y Plan de Tratamiento</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Diagnóstico Psicológico
                                    </label>
                                    <textarea
                                        name="diagnoses"
                                        value={history?.diagnoses || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="4"
                                        placeholder="Diagnóstico preliminar o confirmado, criterios utilizados, diagnósticos diferenciales..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Plan de Tratamiento
                                    </label>
                                    <textarea
                                        name="therapeutic_plan"
                                        value={history?.therapeutic_plan || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="6"
                                        placeholder="Objetivos terapéuticos, técnicas a utilizar, frecuencia de sesiones, duración estimada del tratamiento, derivaciones necesarias..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Pestaña: Alertas y Riesgos */}
                        {activeTab === 'alertas' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Evaluación de Riesgos y Alertas</h2>
                                
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <p className="text-red-800 text-sm font-medium mb-2">
                                        ⚠️ Esta sección es crítica para la seguridad del paciente
                                    </p>
                                    <p className="text-red-700 text-sm">
                                        Documenta cualquier riesgo de autolesión, suicidio, violencia, o situaciones que requieran intervención inmediata.
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Evaluación de Riesgos
                                    </label>
                                    <textarea
                                        name="risk_assessment"
                                        value={history?.risk_assessment || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        rows="6"
                                        placeholder="Riesgo suicida, riesgo de autolesión, riesgo de violencia, factores protectores, plan de seguridad, contactos de emergencia..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Botón de guardar */}
                        <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        💾 Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente auxiliar para las pestañas
const TabButton = ({ name, activeTab, onClick, children }) => (
    <button
        onClick={() => onClick(name)}
        className={`px-6 py-3 font-semibold text-sm whitespace-nowrap transition-colors ${
            activeTab === name
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
        }`}
    >
        {children}
    </button>
);

export default ClinicalHistoryPage;

