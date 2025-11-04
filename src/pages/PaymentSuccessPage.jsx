// src/pages/PaymentSuccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api';
import { toast } from 'react-toastify'; // <-- Asegúrate de importar toast
import { Loader, CheckCircle, XCircle } from 'lucide-react'; // <-- Iconos mejorados

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('ID de sesión no encontrado');
        setVerifying(false);
        return;
      }

      try {
        // --- ¡ESTA ES LA CORRECCIÓN! ---
        // 1. Llamamos al endpoint correcto del backend para confirmar el pago
        //    y crear la transacción.
        console.log('Confirmando sesión de pago con el backend:', sessionId);
        toast.info('Verificando tu pago, por favor espera...');
        
        const response = await apiClient.post('/payments/confirm-payment/', {
          session_id: sessionId
        });

        // 2. Usamos la respuesta REAL del backend
        //    (Asumiendo que el backend devuelve la cita confirmada)
        setAppointmentDetails(response.data.appointment || response.data);
        setVerifying(false);
        toast.success("¡Pago confirmado! Tu cita está agendada.");

        // 3. Redirigir automáticamente a "Mis Citas"
        setTimeout(() => {
          navigate('/my-appointments');
        }, 3000);
        
      } catch (err) {
        console.error('Error procesando confirmación:', err);
        const errorMsg = err.response?.data?.error || 'Error al confirmar la cita. Por favor, contacta a soporte.';
        setError(errorMsg);
        toast.error(errorMsg);
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-700">Verificando tu pago...</h1>
          <p className="text-gray-500">Por favor, no cierres esta ventana.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error de Verificación</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/my-appointments')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Ver Mis Citas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-6">Tu cita ha sido confirmada y pagada exitosamente.</p>
        
        {appointmentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Detalles de la Cita:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Fecha:</span> {new Date(appointmentDetails.appointment_date).toLocaleDateString()}</p>
              <p><span className="font-medium">Hora:</span> {appointmentDetails.start_time}</p>
              <p><span className="font-medium">Psicólogo:</span> {appointmentDetails.psychologist_name}</p>
              <p><span className="font-medium">Estado:</span> 
                <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Confirmada
                </span>
              </p>
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mb-4">
          Serás redirigido a "Mis Citas" en 3 segundos...
        </p>

        <button
          onClick={() => navigate('/my-appointments')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Ir a Mis Citas Ahora
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
