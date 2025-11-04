// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // <-- CAMBIO: REACT-TOASTIFY EN LUGAR DE SONNER
import 'react-toastify/dist/ReactToastify.css'; // <-- ESTILOS DE REACT-TOASTIFY

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
import SessionNotePage from './pages/SessionNotePage.jsx'; // <-- NUEVA PÁGINA
import DocumentsPage from './pages/DocumentsPage.jsx'; // <-- PÁGINA PARA PSICÓLOGOS
import MyDocumentsPage from './pages/MyDocumentsPage.jsx'; // <-- PÁGINA PARA PACIENTES
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'; // <-- DASHBOARD ADMIN DINÁMICO
import UserProfilePage from './pages/UserProfilePage.jsx'; // <-- PÁGINA DE PERFIL DE USUARIO
import ProfessionalProfileDetailPage from './pages/ProfessionalProfileDetailPage.jsx'; // <-- PERFIL PROFESIONAL DETALLADO
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx'; // <-- PÁGINA DE ÉXITO DE PAGO
import PaymentCancelPage from './pages/PaymentCancelPage.jsx'; // <-- PÁGINA DE CANCELACIÓN DE PAGO
import ClinicalHistoryPage from './pages/ClinicalHistoryPage.jsx'; // <-- PÁGINA DE HISTORIAL CLÍNICO
import BackupsPage from './pages/BackupsPage.jsx'; // <-- PÁGINA DE COPIAS DE SEGURIDAD
import AuditLogPage from './pages/AuditLogPage.jsx'; // <-- PÁGINA DE BITÁCORA
// Importaciones de Componentes
import ProtectedRoute from './components/ProtectedRoute.jsx';
import TenantInfo from './components/TenantInfo.jsx'; // <-- COMPONENTE MULTI-TENANT
import './index.css'; 

// --- Clases de Botones (sin cambios) ---
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center";
const btnSecondary = "px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-center";
const btnDestructive = "px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-colors text-center";
const navLink = "text-sidebar-foreground font-medium hover:text-primary transition-colors";

// --- LAYOUTS ---

// Layout para el Paciente
// Layout para el Paciente
function DashboardLayout() {
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
                <Link to="/dashboard" className="text-xl font-bold text-primary">Psico SAS</Link>
                <div className="flex items-center gap-6">
                    <Link to="/my-appointments" className={navLink}>Mis Citas</Link>
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
                    <Link to="/appointments" className={navLink}>Citas</Link>
                    <Link to="/documents" className={navLink}>Documentos</Link>
                    <Link to="/availability" className={navLink}>Disponibilidad</Link>
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
                    <Link to="/admin-dashboard/backups" className={navLink}>Copias de Seguridad</Link>
                    <Link to="/admin-dashboard/audit-log" className={navLink}>Bitácora</Link>
                    {/* Enlaces futuros: Clínicas, Estadísticas, Configuración */}
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
        {/* ... (Todas tus rutas se quedan igual) ... */}
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<HomePage />} />
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
          <Route path="my-documents" element={<MyDocumentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="professional/:id" element={<ProfessionalDetailPage />} />
          <Route path="chat/:appointmentId" element={<ChatPage />} />
        </Route>
        
        {/* --- Rutas Protegidas para el Psicólogo --- */}
        <Route element={<ProtectedRoute userType="professional"><PsychologistLayout /></ProtectedRoute>}>
          <Route path="psychologist-dashboard" element={<PsychologistDashboard />} />
          <Route path="psychologist-availability" element={<PsychologistAvailabilityPage />} />
          <Route path="psychologist/chat/:appointmentId" element={<ChatPage />} />
          <Route path="psychologist-profile" element={<PsychologistProfilePage />} />
          <Route path="psychologist-documents" element={<DocumentsPage />} />
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
          <Route path="admin-dashboard/backups" element={<BackupsPage />} />
          <Route path="admin-dashboard/audit-log" element={<AuditLogPage />} />
          {/* Próximamente más funcionalidades de admin de clínica */}
        </Route>        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);