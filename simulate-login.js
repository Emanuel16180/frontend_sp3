// SCRIPT PARA SIMULAR LOGIN EXITOSO
// Copia y pega esto en la consola del navegador para simular un login

console.log('🧪 Simulando login exitoso...');

// Limpiar localStorage primero
localStorage.clear();

// Simular datos de un login exitoso
localStorage.setItem('authToken', 'fake-token-for-testing');
localStorage.setItem('userType', 'superuser');
localStorage.setItem('currentUser', JSON.stringify({
    id: 1,
    first_name: 'Admin'
}));

console.log('✅ Datos simulados guardados:');
console.log('- authToken:', localStorage.getItem('authToken'));
console.log('- userType:', localStorage.getItem('userType'));
console.log('- currentUser:', localStorage.getItem('currentUser'));

console.log('🔄 Intentando ir a dashboard admin...');
window.location.href = '/global-admin';

console.log('✅ Redirección iniciada');