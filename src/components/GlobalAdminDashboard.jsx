import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GlobalAdminDashboard() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      // Obtener token (buscar en ambos nombres por compatibilidad)
      const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
      
      if (!token) {
        console.error(' No hay token, redirigiendo a login');
        navigate('/login');
        return;
      }

      //  CRÍTICO: Admin general SIEMPRE usa el backend público
      // El endpoint /api/tenants/ devuelve la lista de clínicas
      const apiUrl = 'https://psico-admin.onrender.com/api/tenants/';
      
      console.log(' [GlobalAdminDashboard] Cargando clínicas desde:', apiUrl);
      console.log(' [GlobalAdminDashboard] Token:', token.substring(0, 20) + '...');

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(' [GlobalAdminDashboard] Response status:', response.status);

      if (response.status === 401) {
        console.error(' Token inválido o expirado');
        localStorage.removeItem('access_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(' [GlobalAdminDashboard] Clínicas cargadas:', data);
      
      // Si la respuesta es un array directamente, úsalo
      // Si viene en data.results, úsalo
      // Si viene en data.clinics, úsalo
      const clinicsData = Array.isArray(data) ? data : (data.results || data.clinics || []);
      
      setClinics(clinicsData);
      setLoading(false);
      
    } catch (err) {
      console.error(' Error cargando clínicas:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 text-lg'>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
          <div className='text-red-600 text-6xl mb-4 text-center'></div>
          <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
            Error al cargar datos
          </h2>
          <p className='text-gray-600 mb-6 text-center'>{error}</p>
          <div className='flex gap-4'>
            <button
              onClick={loadClinics}
              className='flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'
            >
              Reintentar
            </button>
            <button
              onClick={handleLogout}
              className='flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                 Panel de Administración Global
              </h1>
              <p className='mt-1 text-sm text-gray-600'>
                Gestión centralizada de todas las clínicas
              </p>
            </div>
            <button
              onClick={handleLogout}
              className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors'
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 bg-blue-500 rounded-md p-3'>
                <span className='text-white text-2xl'></span>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Clínicas Activas
                  </dt>
                  <dd className='text-3xl font-semibold text-gray-900'>
                    {clinics.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 bg-green-500 rounded-md p-3'>
                <span className='text-white text-2xl'></span>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Total Usuarios
                  </dt>
                  <dd className='text-3xl font-semibold text-gray-900'>
                    {clinics.reduce((sum, clinic) => sum + (clinic.total_users || 0), 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 bg-purple-500 rounded-md p-3'>
                <span className='text-white text-2xl'></span>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Profesionales
                  </dt>
                  <dd className='text-3xl font-semibold text-gray-900'>
                    {clinics.reduce((sum, clinic) => sum + (clinic.professionals || 0), 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Clinics List */}
        <div className='bg-white shadow rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Clínicas Registradas
            </h2>
          </div>
          <div className='divide-y divide-gray-200'>
            {clinics.length === 0 ? (
              <div className='px-6 py-12 text-center'>
                <p className='text-gray-500 text-lg mb-4'>
                  No hay clínicas registradas aún
                </p>
                <p className='text-gray-400 text-sm'>
                  Las nuevas clínicas aparecerán aquí automáticamente
                </p>
              </div>
            ) : (
              clinics.map((clinic) => (
                <div key={clinic.id} className='px-6 py-4 hover:bg-gray-50 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <h3 className='text-lg font-medium text-gray-900 mb-1'>
                        {clinic.name || clinic.schema_name || "Sin nombre"}
                      </h3>
                      <div className='flex items-center space-x-4 text-sm text-gray-500'>
                        <span> Creada: {(clinic.created_on ? new Date(clinic.created_on).toLocaleDateString() : "N/A")}</span>
                        <span> Schema: {clinic.schema_name}</span>
                        {clinic.primary_domain && (
                          <span> {clinic.primary_domain}</span>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center space-x-6 text-center'>
                      <div>
                        <div className='text-2xl font-bold text-blue-600'>
                          {clinic.total_users || 0}
                        </div>
                        <div className='text-xs text-gray-500'>Usuarios</div>
                      </div>
                      <div>
                        <div className='text-2xl font-bold text-green-600'>
                          {clinic.patients || 0}
                        </div>
                        <div className='text-xs text-gray-500'>Pacientes</div>
                      </div>
                      <div>
                        <div className='text-2xl font-bold text-purple-600'>
                          {clinic.professionals || 0}
                        </div>
                        <div className='text-xs text-gray-500'>Profesionales</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


