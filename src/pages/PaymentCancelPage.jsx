// src/pages/PaymentCancelPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago Cancelado</h1>
        <p className="text-gray-600 mb-6">
          El proceso de pago fue cancelado. No se realizó ningún cargo a tu tarjeta.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Intentar de Nuevo
          </button>
          <button
            onClick={() => navigate('/professionals')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg"
          >
            Buscar Profesionales
          </button>
          <button
            onClick={() => navigate('/my-appointments')}
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4"
          >
            Ver Mis Citas
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;