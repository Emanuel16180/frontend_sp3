// src/config/stripe.js

// Configuración de Stripe para desarrollo
export const STRIPE_CONFIG = {
  // En desarrollo, podemos usar claves públicas de prueba
  // Estas son claves públicas de ejemplo - en producción vendrían del backend
  development: {
    publicKey: 'pk_test_51QKV3TH6SewRAuS35O0jNFMm2fKWtEzKdNXqgj4s9mTjWRwmCQXFvKTryhUz6Qg8Yw3cZdYYzTjQ30zXYRpKWxcF00qzdV9uxX', // Clave pública de prueba
  },
  
  // URLs de retorno para desarrollo
  urls: {
    success: `${window.location.origin}/payment-success`,
    cancel: `${window.location.origin}/payment-cancel`,
  }
};

// Función para obtener la clave pública según el entorno
export const getStripePublicKey = () => {
  if (process.env.NODE_ENV === 'development') {
    return STRIPE_CONFIG.development.publicKey;
  }
  
  // En producción, esto vendría del endpoint del backend
  return null;
};
