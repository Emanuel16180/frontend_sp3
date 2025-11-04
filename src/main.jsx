// src/main.jsx

import React, { useState, useEffect } from 'react'; // <-- AÑADIDO useState, useEffect
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

// Importaciones de Páginas
import App from './App.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfessionalsPage from './pages/ProfessionalsPage.jsx';
import ProfessionalDetailPage from './pages/ProfessionalDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import MyAppointmentsPage from './pages/MyAppointmentsPage.jsx';
import PasswordResetRequestPage from './pages/PasswordResetRequestPage.jsx';
import PasswordResetConfirmPage from './pages/PasswordResetConfirmPage.jsx';
import PsychologistDashboard from './pages/PsychologistDashboard.jsx';
import PsychologistAvailabilityPage from './pages/PsychologistAvailabilityPage.jsx';
import PsychologistProfilePage from './pages/PsychologistProfilePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import SessionNotePage from './pages/SessionNotePage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import MyDocumentsPage from './pages/MyDocumentsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import ProfessionalProfileDetailPage from './pages/ProfessionalProfileDetailPage.jsx';
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PaymentCancelPage from './pages/PaymentCancelPage.jsx';
import ClinicalHistoryPage from './pages/ClinicalHistoryPage.jsx';
import BackupsPage from './pages/BackupsPage.jsx';
import AuditLogPage from './pages/AuditLogPage.jsx';
import TriagePage from './pages/TriagePage.jsx'; // (La del paso anterior)
import MoodJournalHistoryPage from './pages/MoodJournalHistoryPage.jsx'; 
import AdminValidationPage from './pages/AdminValidationPage.jsx';
// <-- 3. AÑADIR NUEVA PÁGINA DE HISTORIAL
import MyObjectivesPage from './pages/MyObjectivesPage.jsx'; // <-- 1. MODIFICACIÓN OBJETIVOS: Importar nueva página
import PaymentReportPage from './pages/PaymentReportPage.jsx';
import MyCarePlansPage from './pages/MyCarePlansPage.jsx'

// Importaciones de Componentes
import ProtectedRoute from './components/ProtectedRoute.jsx';
import TenantInfo from './components/TenantInfo.jsx';
import Chatbot from './components/Chatbot.jsx';
import MoodJournalModal from './components/MoodJournalModal.jsx'; // <-- 1. AÑADIR NUEVO MODAL
import apiClient from './api'; // <-- 2. AÑADIR API CLIENT
import './index.css'; 

// --- Clases de Botones (sin cambios) ---
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center";
const btnSecondary = "px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-center";
const btnDestructive = "px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-colors text-center";
const navLink = "text-sidebar-foreground font-medium hover:text-primary transition-colors";

// --- LAYOUTS ---

// Layout para el Paciente
function DashboardLayout() {
    const navigate = useNavigate();
    
    // --- LÓGICA DE IDEA 1: POPUP DIARIO ---
    const [showMoodModal, setShowMoodModal] = useState(false);

    useEffect(() => {
        // Esta función se ejecuta CADA VEZ que el paciente carga el dashboard
        const checkMoodJournalToday = async () => {
            try {
                // 1. Llama al endpoint de verificación
                await apiClient.get('/clinical-history/mood-journal/today/');
                // 2. Si da 200 OK, no hace nada (ya lo completó)
                console.log("Diario de ánimo ya completado hoy.");
            } catch (err) {
                // 3. Si da 404, ¡es la señal! Muestra el modal
                if (err.response && err.response.status === 404) {
                    console.log("Diario de ánimo no encontrado para hoy, mostrando modal.");
                    setShowMoodModal(true);
                } else {
                    // Otro error
                    console.error("Error al verificar el diario de ánimo:", err);
                }
            }
        };

        checkMoodJournalToday();
    }, []); // El array vacío asegura que se ejecute solo una vez al cargar el layout

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };
    
    return (
        <div>
            {/* 4. RENDERIZAR EL MODAL (estará oculto hasta que showMoodModal sea true) */}
            <MoodJournalModal 
                isOpen={showMoodModal}
                onClose={(didSubmit) => {
                    setShowMoodModal(false);
                    if (didSubmit) {
                        // Opcional: podrías querer recargar algo si se completó
                    }
                }}
            />

            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            /> 
            
            <nav className="flex justify-between items-center p-4 px-8 bg-sidebar text-sidebar-foreground shadow-md border-b border-sidebar-border">
                <Link to="/dashboard" className="text-xl font-bold text-primary">Psico SAS</Link>
                <div className="flex items-center gap-6">
                    <Link to="/my-appointments" className={navLink}>Mis Citas</Link>
                    {/* 2. MODIFICACIÓN OBJETIVOS: Añadir enlace "Mis Objetivos" */}
                    <Link to="/my-objectives" className={navLink}>Mis Objetivos</Link>
                    {/* 5. AÑADIR ENLACE AL HISTORIAL (IDEA 3) */}
                    <Link to="/my-journal" className={navLink}>Mi Diario</Link>
                    <Link to="/my-documents" className={navLink}>Mis Documentos</Link>
                    <Link to="/profile" className={navLink}>Mi Perfil</Link>
                    <button onClick={handleLogout} className={btnDestructive}>Cerrar Sesión</button>
                </div>
            </nav>
            <div className="p-4 sm:p-8 bg-background min-h-screen">
              <TenantInfo />
              <Outlet />
            </div>
        </div>
    );
}

// Layout para el Psicólogo
function PsychologistLayout() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };
    return (
        <div>
            {/* ToastContainer para notificaciones */}
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            /> 
            
            <nav className="flex justify-between items-center p-4 px-8 bg-sidebar text-sidebar-foreground shadow-md border-b border-sidebar-border">
                <Link to="/psychologist-dashboard" className="text-xl font-bold text-primary">Psico SAS - Panel Profesional</Link>
                <div className="flex items-center gap-6">
                    <Link to="/psychologist-dashboard" className={navLink}>Dashboard</Link>
                    <Link to="/psychologist-dashboard" className={navLink}>Citas</Link>
                    <Link to="/psychologist-plans" className={navLink}>Mis Planes</Link>
                    <Link to="/psychologist-documents" className={navLink}>Documentos</Link>
                    <Link to="/psychologist-availability" className={navLink}>Disponibilidad</Link>
                    <Link to="/psychologist-profile" className={navLink}>Mi Perfil</Link>
                    <button onClick={handleLogout} className={btnDestructive}>Cerrar Sesión</button>
                </div>
            </nav>
            <div className="p-4 sm:p-8 bg-background min-h-screen">
              <TenantInfo />
              <Outlet />
            </div>
        </div>
    );
}

// Layout para el Administrador Global (localhost)
function GlobalAdminLayout() {
    const navigate = useNavigate();
    const handleLogout = () => {
        // Logout unificado: limpia authToken como todos los otros layouts
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('currentUser');
        navigate('/login');
    };
    return (
        <div>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <nav className="flex justify-between items-center p-4 px-8 bg-purple-800 text-white shadow-md">
                <Link to="/global-admin" className="text-xl font-bold">🌐 Administrador General - Psico SAS</Link>
                <div className="flex items-center gap-6">
                    <Link to="/global-admin/clinics" className={navLink}>Clínicas</Link>
                    <Link to="/global-admin/users" className={navLink}>Usuarios Globales</Link>
                    <Link to="/global-admin/stats" className={navLink}>Estadísticas</Link>
                    <button onClick={handleLogout} className={btnDestructive}>Cerrar Sesión</button>
                </div>
            </nav>
            <div className="p-8 bg-background min-h-screen">
                <TenantInfo />
                <Outlet />
            </div>
        </div>
    );
}

// Layout para el Administrador de la Clínica
function AdminLayout() {
    const navigate = useNavigate();
    const handleLogout = () => {
        // Limpiamos todo el almacenamiento para garantizar salida completa del contexto admin
        localStorage.clear();
        navigate('/login');
    };
    return (
        <div>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <nav className="flex justify-between items-center p-4 px-8 bg-gray-800 text-white shadow-md">
                <Link to="/admin-dashboard" className="text-xl font-bold">Panel de Administrador</Link>
                <div className="flex items-center gap-6">
                    <Link to="/admin-dashboard" className={navLink}>Dashboard</Link>
                    <Link to="/admin-dashboard/reports" className={navLink}>Reportes</Link>
                    <Link to="/admin-dashboard/validate" className={navLink}>Validaciones</Link>
                    <Link to="/admin-dashboard/backups" className={navLink}>Copias de Seguridad</Link>
                    <Link to="/admin-dashboard/audit-log" className={navLink}>Bitácora</Link>
                    <button onClick={handleLogout} className={btnDestructive}>Cerrar Sesión</button>
                </div>
            </nav>
            <div className="p-8 bg-background min-h-screen">
                <TenantInfo />
                <Outlet />
            </div>
        </div>
    );
}
// --- PÁGINA DE INICIO (PÚBLICA) ---
function HomePage() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen p-8 bg-background">
            <h1 className="text-4xl font-bold text-primary mb-8">Bienvenido a Psico SAS</h1>
            <nav className="flex gap-4">
                <Link to="/login" className={btnPrimary}>Iniciar Sesión</Link>
                <Link to="/register" className={btnSecondary}>Registrarse</Link>
            </nav>
        </div>
    );
}

// --- RENDERIZADO PRINCIPAL (sin cambios) ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<PasswordResetRequestPage />} />
        <Route path="/reset-password/:uid/:token" element={<PasswordResetConfirmPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-cancel" element={<PaymentCancelPage />} />
        
        {/* --- Rutas Protegidas para el Paciente --- */}
        <Route element={<ProtectedRoute userType="patient"><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<ProfessionalsPage />} />
          <Route path="my-appointments" element={<MyAppointmentsPage />} />
          {/* 6. AÑADIR RUTA PARA EL HISTORIAL (IDEA 3) */}
          <Route path="my-journal" element={<MoodJournalHistoryPage />} />
          {/* 3. MODIFICACIÓN OBJETIVOS: Añadir nueva ruta */}
          <Route path="my-objectives" element={<MyObjectivesPage />} />
          <Route path="my-documents" element={<MyDocumentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="professional/:id" element={<ProfessionalDetailPage />} />
          <Route path="chat/:appointmentId" element={<ChatPage />} />
        </Route>
        
        {/* --- Ruta de Triaje (Existente) --- */}
        <Route 
          path="/triage" 
          element={
            <ProtectedRoute userType="patient">
              <TriagePage />
            </ProtectedRoute>
          } 
        />
        
        {/* --- Rutas Protegidas para el Psicólogo --- */}
        <Route element={<ProtectedRoute userType="professional"><PsychologistLayout /></ProtectedRoute>}>
          <Route path="psychologist-dashboard" element={<PsychologistDashboard />} />
          <Route path="psychologist-availability" element={<PsychologistAvailabilityPage />} />
          <Route path="psychologist/chat/:appointmentId" element={<ChatPage />} />
          <Route path="psychologist-profile" element={<PsychologistProfilePage />} />
          <Route path="psychologist-documents" element={<DocumentsPage />} />
          <Route path="psychologist-plans" element={<MyCarePlansPage />} />
          <Route path="appointment/:appointmentId/note" element={<SessionNotePage />} />
          <Route path="clinical-history/patient/:patientId" element={<ClinicalHistoryPage />} />
        </Route>

        {/* --- Rutas Protegidas para el Administrador Global (localhost) --- */}
        <Route element={<ProtectedRoute userType="admin"><GlobalAdminLayout /></ProtectedRoute>}>
          <Route path="global-admin" element={<AdminDashboardPage />} />
          <Route path="global-admin/clinics" element={<h1 className="text-2xl font-bold text-purple-800">🏥 Gestión de Clínicas</h1>} />
          <Route path="global-admin/users" element={<h1 className="text-2xl font-bold text-purple-800">👥 Usuarios Globales</h1>} />
          <Route path="global-admin/stats" element={<h1 className="text-2xl font-bold text-purple-800">📊 Estadísticas Globales</h1>} />
        </Route>

        {/* --- Rutas Protegidas para el Administrador de Clínica --- */}
        <Route element={<ProtectedRoute userType="admin"><AdminLayout /></ProtectedRoute>}>
          <Route path="admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="admin/user/:userId" element={<UserProfilePage />} />
          <Route path="admin/professional-profile/:userId" element={<ProfessionalProfileDetailPage />} />
          <Route path="admin-dashboard/validate" element={<AdminValidationPage />} />
          <Route path="admin-dashboard/backups" element={<BackupsPage />} />
          <Route path="admin-dashboard/audit-log" element={<AuditLogPage />} />
          <Route path="admin-dashboard/reports" element={<PaymentReportPage />} />
        </Route>        
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Chatbot flotante - Disponible en todas las páginas */}
      <Chatbot />
    </BrowserRouter>
  </React.StrictMode>,
);