// src/hooks/useStripe.js
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getApiBaseURL } from '../config/tenants';
import { getStripePublicKey } from '../config/stripe';

export const useStripe = () => {
  const [stripe, setStripe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        let publicKey = null;

        // Intentar obtener la clave desde el backend
        try {
          const baseURL = getApiBaseURL();
          const response = await fetch(`${baseURL}/payments/stripe-public-key/`, {
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const data = await response.json();
            publicKey = data.publicKey;
          }
        } catch (backendError) {
          console.warn('Backend no disponible, usando configuración de desarrollo:', backendError.message);
        }

        // Si no se pudo obtener del backend, usar configuración de desarrollo
        if (!publicKey) {
          publicKey = getStripePublicKey();
          console.log('Usando clave pública de desarrollo para Stripe');
        }

        if (!publicKey) {
          throw new Error('No se pudo obtener la clave pública de Stripe');
        }
        
        // Inicializar Stripe con la clave pública
        const stripeInstance = await loadStripe(publicKey);
        setStripe(stripeInstance);
        
      } catch (err) {
        console.error('Error inicializando Stripe:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  return { stripe, loading, error };
};