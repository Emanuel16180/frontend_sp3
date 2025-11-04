// src/pages/AdminDashboardPage.jsx

import { isGlobalAdmin } from '../config/tenants';
import GlobalAdminDashboard from '../components/GlobalAdminDashboard';
import ClinicAdminDashboard from '../components/ClinicAdminDashboard';

function AdminDashboardPage() {
    const isGlobal = isGlobalAdmin();

    return (
        <div className="container mx-auto p-4 md:p-8">
            {isGlobal ? <GlobalAdminDashboard /> : <ClinicAdminDashboard />}
        </div>
    );
}

export default AdminDashboardPage;