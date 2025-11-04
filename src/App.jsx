import { useState, useEffect } from 'react';
import apiClient from './api'; // Usar nuestro cliente configurado
//import './App.css';

function App() {
  const [specializations, setSpecializations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Usar apiClient en lugar de axios directo con URL hardcodeada
    apiClient.get('/professionals/specializations/')
      .then(response => {
        setSpecializations(response.data);
      })
      .catch(error => {
        console.error("Hubo un error al obtener los datos:", error);
        setError('No se pudieron cargar las especialidades. ¿El servidor de Django está corriendo?');
      });
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  return (
    <>
      <h1>Psico SAS - Frontend</h1>
      <h2>Especialidades Cargadas desde el Backend</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {specializations.map(spec => (
          <li key={spec.id}>{spec.name}</li>
        ))}
      </ul>
    </>
  );
}

export default App;