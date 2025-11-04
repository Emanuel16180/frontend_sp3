// src/components/PaymentButton.jsx
import React, { useState } from 'react';
import apiClient from '../api';

const PaymentButton = ({ 
  appointmentData, 
  user, 
  onSuccess, 
  onError,
  className = "",
  children = "Pagar Cita"
}) => {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!appointmentData) {
      onError?.('Datos de la cita faltantes');
      return;
    }

    setProcessing(true);

    try {
      // --- INICIO DE LA CORRECCIÓN ---
      // Enviamos los datos de la cita directamente en el cuerpo de la petición,
      // usando el operador 'spread' (...).
      const response = await apiClient.post('/payments/create-checkout-session/', {
          ...appointmentData
      });

      // Extraemos la URL de pago de la respuesta del backend
      const { checkout_url } = response.data;

      if (checkout_url) {
          // Redirigimos al usuario a la página de pago de Stripe
          window.location.href = checkout_url;
      } else {
          throw new Error("No se recibió una URL de pago del servidor.");
      }
      // --- FIN DE LA CORRECCIÓN ---

    } catch (err) {
      console.error('Error procesando pago:', err);
      
      // Manejo de errores más específico
      let errorMessage = 'Error creando sesión de pago';
      
      if (err.response?.data) {
        // Errores específicos del backend
        if (err.response.data.psychologist) {
          errorMessage = `Error con el psicólogo: ${err.response.data.psychologist[0]}`;
        } else if (err.response.data.appointment_date) {
          errorMessage = `Error con la fecha: ${err.response.data.appointment_date[0]}`;
        } else if (err.response.data.start_time) {
          errorMessage = `Error con la hora: ${err.response.data.start_time[0]}`;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      onError?.(errorMessage);
      setProcessing(false); // Asegurarse de detener el spinner si hay error
    }
    // No necesitamos el 'finally' aquí, porque la redirección detiene la ejecución
  };

  const isDisabled = processing || !appointmentData;

  return (
    <button
      onClick={handlePayment}
      disabled={isDisabled}
      className={`
        bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
        text-white font-semibold py-3 px-6 rounded-lg
        flex items-center justify-center space-x-2
        transition-colors duration-200
        ${className}
      `}
    >
      {processing ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Procesando...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default PaymentButton;