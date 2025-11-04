import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getTenantFromHostname } from '../config/tenants';

const API_BASE_URL = 'https://psico-admin.onrender.com/api/tenants/public';

export default function LandingPage() {
  const navigate = useNavigate();
  
  // ✅ TODOS LOS HOOKS AL INICIO (antes de cualquier return)
  const [isCheckingTenant, setIsCheckingTenant] = useState(true);
  const [formData, setFormData] = useState({
    clinic_name: '',
    subdomain: '',
    admin_email: '',
    admin_phone: '',
    address: ''
  });
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState(null);

  // 🔥 FIX CRÍTICO: Solo ejecutar UNA VEZ al montar el componente
  useEffect(() => {
    const checkIfTenantExists = async () => {
      const hostname = window.location.hostname;
      const currentTenant = getTenantFromHostname();

      // Si estamos en el dominio raíz (psicoadmin.xyz), mostrar formulario de registro
      const isRootDomain = hostname === 'psicoadmin.xyz' || hostname === 'www.psicoadmin.xyz' || hostname === 'localhost';
      
      if (isRootDomain) {
        console.log('✅ Dominio raíz detectado - mostrando formulario de registro de clínicas');
        setIsCheckingTenant(false);
        return;
      }

      // Si estamos en un subdominio de clínica (-app.psicoadmin.xyz), redirigir a login
      if (hostname.includes('-app.psicoadmin.xyz') && currentTenant && currentTenant !== 'global-admin') {
        console.log(`🏥 Subdominio detectado: ${currentTenant} - redirigiendo a /login`);
        navigate('/login');
        return;
      }

      setIsCheckingTenant(false);
    };

    checkIfTenantExists();
  }, []); // ← VACÍO: Solo ejecuta una vez al montar

  // Verificar disponibilidad del subdominio con debounce
  const checkSubdomain = async (subdomain) => {
    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setCheckingSubdomain(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/check-subdomain/`, {
        subdomain
      });
      setSubdomainAvailable(response.data.available);
    } catch (err) {
      console.error('Error verificando subdominio:', err);
      setSubdomainAvailable(null);
    } finally {
      setCheckingSubdomain(false);
    }
  };

  // Manejar cambio de subdominio con debounce
  const handleSubdomainChange = (value) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({...formData, subdomain: cleanValue});

    // Debounce: esperar 500ms antes de verificar
    clearTimeout(window.subdomainCheckTimeout);
    window.subdomainCheckTimeout = setTimeout(() => {
      checkSubdomain(cleanValue);
    }, 500);
  };

  // Registrar clínica
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/register/`, formData);

      if (response.data.success) {
        setSuccess(response.data.data);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ['Error al registrar la clínica. Inténtalo de nuevo.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loader mientras verifica
  if (isCheckingTenant) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 text-lg'>Verificando clínica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      {/* Hero Section */}
      <div className='container mx-auto px-4 py-12'>
        <div className='text-center mb-12'>
          <h1 className='text-5xl font-bold text-gray-900 mb-4'>
            🏥 Psico Admin
          </h1>
          <p className='text-xl text-gray-600 mb-2'>
            Sistema de Gestión para Clínicas Psicológicas
          </p>
          <p className='text-gray-500'>
            Crea tu propia instancia en menos de 2 minutos
          </p>
        </div>

        {/* Formulario / Resultado */}
        <div className='max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden'>
          {!success ? (
            // FORMULARIO DE REGISTRO
            <div className='p-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-6 text-center'>
                Registra Tu Clínica
              </h2>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Mostrar errores generales */}
                {errors?.general && (
                  <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative'>
                    {errors.general.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                )}

                {/* Nombre de la clínica */}
                <div>
                  <label htmlFor='clinic_name' className='block text-sm font-medium text-gray-700 mb-2'>
                    Nombre de la Clínica *
                  </label>
                  <input
                    type='text'
                    id='clinic_name'
                    name='clinic_name'
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Clínica Bienestar'
                    required
                  />
                  {errors?.clinic_name && (
                    <p className='mt-1 text-sm text-red-600'>{errors.clinic_name[0]}</p>
                  )}
                </div>

                {/* Subdominio */}
                <div>
                  <label htmlFor='subdomain' className='block text-sm font-medium text-gray-700 mb-2'>
                    Subdominio *
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='text'
                      id='subdomain'
                      name='subdomain'
                      value={formData.subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      className='flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='bienestar'
                      required
                    />
                    <span className='px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 text-sm'>
                      -app.psicoadmin.xyz
                    </span>
                  </div>
                  {checkingSubdomain && (
                    <p className='mt-1 text-sm text-blue-600'>Verificando disponibilidad...</p>
                  )}
                  {subdomainAvailable === true && (
                    <p className='mt-1 text-sm text-green-600'>✓ Subdominio disponible</p>
                  )}
                  {subdomainAvailable === false && (
                    <p className='mt-1 text-sm text-red-600'>✗ Subdominio no disponible</p>
                  )}
                  {errors?.subdomain && (
                    <p className='mt-1 text-sm text-red-600'>{errors.subdomain[0]}</p>
                  )}
                </div>

                {/* Email del administrador */}
                <div>
                  <label htmlFor='admin_email' className='block text-sm font-medium text-gray-700 mb-2'>
                    Email del Administrador *
                  </label>
                  <input
                    type='email'
                    id='admin_email'
                    name='admin_email'
                    value={formData.admin_email}
                    onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='admin@tuclínica.com'
                    required
                  />
                  {errors?.admin_email && (
                    <p className='mt-1 text-sm text-red-600'>{errors.admin_email[0]}</p>
                  )}
                </div>

                {/* Teléfono (opcional) */}
                <div>
                  <label htmlFor='admin_phone' className='block text-sm font-medium text-gray-700 mb-2'>
                    Teléfono (opcional)
                  </label>
                  <input
                    type='tel'
                    id='admin_phone'
                    name='admin_phone'
                    value={formData.admin_phone}
                    onChange={(e) => setFormData({...formData, admin_phone: e.target.value})}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='+1 234 567 8900'
                  />
                </div>

                {/* Dirección (opcional) */}
                <div>
                  <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-2'>
                    Dirección (opcional)
                  </label>
                  <input
                    type='text'
                    id='address'
                    name='address'
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Calle Principal #123, Ciudad'
                  />
                </div>

                {/* Botón de envío */}
                <button
                  type='submit'
                  disabled={loading || subdomainAvailable === false}
                  className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors'
                >
                  {loading ? 'Registrando...' : 'Registrar Clínica'}
                </button>
              </form>

              <p className='mt-4 text-sm text-gray-600 text-center'>
                ¿Ya tienes una clínica? <a href='/login' className='text-blue-600 hover:underline'>Inicia sesión</a>
              </p>
            </div>
          ) : (
            // MENSAJE DE ÉXITO
            <div className='p-8 text-center'>
              <div className='text-green-500 text-6xl mb-4'>✓</div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                ¡Clínica Registrada Exitosamente!
              </h2>
              <p className='text-gray-600 mb-4'>
                Tu clínica <strong>{success.clinic_name}</strong> ha sido creada.
              </p>
              <div className='bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6'>
                <p className='text-sm text-blue-800 mb-2'>
                  <strong>URL de tu clínica:</strong>
                </p>
                <a
                  href={`https://${success.subdomain}-app.psicoadmin.xyz`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline font-medium'
                >
                  {success.subdomain}-app.psicoadmin.xyz
                </a>
              </div>
              <p className='text-sm text-gray-600 mb-4'>
                Se ha enviado un email a <strong>{success.admin_email}</strong> con las credenciales de acceso.
              </p>
              <a
                href={`https://${success.subdomain}-app.psicoadmin.xyz/login`}
                className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'
              >
                Ir al Login
              </a>
            </div>
          )}
        </div>

        {/* Características */}
        <div className='max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white p-6 rounded-lg shadow text-center'>
            <div className='text-4xl mb-4'>🔒</div>
            <h3 className='font-semibold text-gray-900 mb-2'>Multi-Tenant Seguro</h3>
            <p className='text-sm text-gray-600'>
              Cada clínica tiene su propia base de datos completamente aislada
            </p>
          </div>
          <div className='bg-white p-6 rounded-lg shadow text-center'>
            <div className='text-4xl mb-4'>⚡</div>
            <h3 className='font-semibold text-gray-900 mb-2'>Configuración Rápida</h3>
            <p className='text-sm text-gray-600'>
              Tu instancia lista en menos de 2 minutos
            </p>
          </div>
          <div className='bg-white p-6 rounded-lg shadow text-center'>
            <div className='text-4xl mb-4'>📊</div>
            <h3 className='font-semibold text-gray-900 mb-2'>Gestión Completa</h3>
            <p className='text-sm text-gray-600'>
              Citas, expedientes, pagos y más en una sola plataforma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
