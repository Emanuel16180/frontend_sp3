// src/components/PaymentInfo.jsx
import React from 'react';
import { CreditCard, Shield, CheckCircle, Clock } from 'lucide-react';

const PaymentInfo = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-blue-900">Información de Pago</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Pago Seguro</p>
              <p className="text-sm text-gray-600">Procesamos pagos de forma segura a través de Stripe</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Confirmación Inmediata</p>
              <p className="text-sm text-gray-600">Tu cita se confirma automáticamente después del pago</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Proceso Rápido</p>
              <p className="text-sm text-gray-600">El pago se procesa en segundos</p>
            </div>
          </div>
          
          <div className="bg-blue-100 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Métodos aceptados:</strong> Visa, Mastercard, American Express
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;