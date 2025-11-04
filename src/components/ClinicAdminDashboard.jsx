// src/components/ClinicAdminDashboard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import Modal from './Modal'; // Importar el componente Modal
import { toast } from 'react-toastify';
import { User, Briefcase, HeartPulse, Eye, Trash2 } from 'lucide-react';

const getRolePillClasses = (userType) => {
    switch (userType) {
        case 'patient': return 'bg-blue-100 text-blue-800';
        case 'professional': return 'bg-green-100 text-green-800';
        case 'admin': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

function ClinicAdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ patients: 0, professionals: 0 });

    // Estados para el modal de confirmación de borrado
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        try {
            // Endpoint específico para que el admin de la clínica gestione usuarios
            const response = await apiClient.get('/admin/users/');
            setUsers(response.data.results || response.data);

            // Calcular estadísticas
            const userList = response.data.results || response.data;
            const patientCount = userList.filter(u => u.user_type === 'patient').length;
            const professionalCount = userList.filter(u => u.user_type === 'professional').length;
            setStats({ patients: patientCount, professionals: professionalCount });

        } catch (err) {
            console.error("Error fetching users:", err);
            setError('No se pudo cargar la lista de usuarios. Asegúrate de tener permisos de administrador.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Función para abrir el modal de confirmación
    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    // Función para cerrar el modal
    const closeDeleteModal = () => {
        setUserToDelete(null);
        setIsDeleteModalOpen(false);
    };

    // Función para manejar la eliminación del usuario
    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            // El backend está configurado para desactivar el usuario, no para borrarlo.
            await apiClient.delete(`/admin/users/${userToDelete.id}/`);
            
            // Actualizar la lista de usuarios en el estado para reflejar el cambio
            setUsers(users.filter(user => user.id !== userToDelete.id));
            
            toast.success(`Usuario "${userToDelete.full_name || userToDelete.first_name + ' ' + userToDelete.last_name}" desactivado exitosamente.`);
            closeDeleteModal();
        } catch (err) {
            console.error("Error deleting user:", err);
            toast.error("Hubo un error al desactivar el usuario.");
            closeDeleteModal();
        }
    };

    if (loading) return <p className="text-center text-muted-foreground">Cargando usuarios de la clínica...</p>;
    if (error) return <p className="text-center text-destructive">{error}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Dashboard de la Clínica</h1>
            <p className="text-muted-foreground mb-8">Gestión de usuarios de la clínica actual.</p>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card p-6 rounded-xl shadow flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full"><HeartPulse className="h-6 w-6 text-blue-600" /></div>
                    <div>
                        <p className="text-sm text-muted-foreground">Pacientes Totales</p>
                        <p className="text-2xl font-bold text-foreground">{stats.patients}</p>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl shadow flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full"><Briefcase className="h-6 w-6 text-green-600" /></div>
                    <div>
                        <p className="text-sm text-muted-foreground">Profesionales Activos</p>
                        <p className="text-2xl font-bold text-foreground">{stats.professionals}</p>
                    </div>
                </div>
                 <div className="bg-card p-6 rounded-xl shadow flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-full"><User className="h-6 w-6 text-gray-600" /></div>
                    <div>
                        <p className="text-sm text-muted-foreground">Usuarios Totales</p>
                        <p className="text-2xl font-bold text-foreground">{users.length}</p>
                    </div>
                </div>
            </div>
            
            {/* Tabla de Usuarios */}
            <div className="bg-card p-6 rounded-xl shadow">
                 <h2 className="text-xl font-bold text-foreground mb-4">Lista de Usuarios</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Nombre</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Email</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Rol</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Fecha de Registro</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="p-4 font-medium text-foreground">{user.full_name || `${user.first_name} ${user.last_name}`}</td>
                                    <td className="p-4 text-muted-foreground">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getRolePillClasses(user.user_type)}`}>
                                            {user.user_type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {new Date(user.date_joined).toLocaleDateString('es-ES')}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Link 
                                                to={`/admin/user/${user.id}`}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                title="Ver Perfil"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                                                title="Eliminar Usuario"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground p-8">No hay usuarios registrados en esta clínica.</p>
                )}
            </div>

            {/* Modal de Confirmación para Borrar Usuario */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                <div className="text-center">
                    <Trash2 className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">¿Estás seguro?</h2>
                    <p className="text-muted-foreground mb-6">
                        Estás a punto de desactivar al usuario <strong className="text-foreground">{userToDelete?.full_name || `${userToDelete?.first_name} ${userToDelete?.last_name}`}</strong>. 
                        Esta acción es reversible desde el panel de Django, pero el usuario no podrá iniciar sesión.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={closeDeleteModal} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleDeleteUser} className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-colors">
                            Sí, desactivar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ClinicAdminDashboard;