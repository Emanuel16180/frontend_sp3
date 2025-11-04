// src/components/TenantInfo.jsx

import { getCurrentTenant, isGlobalAdmin, isMultiTenant } from '../config/tenants';

function TenantInfo() {
    const tenant = getCurrentTenant();
    const isGlobal = isGlobalAdmin();
    const isMulti = isMultiTenant();

    // Solo mostrar si estamos en modo multi-tenant o admin global
    if (!isMulti && !isGlobal) {
        return null;
    }

    return (
        <div className={`border-l-4 p-4 mb-6 rounded-lg ${
            isGlobal 
                ? 'bg-purple-50 border-purple-500' 
                : 'bg-primary/10 border-primary'
        }`}>
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <span className="text-xl">
                        {isGlobal ? '�' : '�🏥'}
                    </span>
                </div>
                <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                        isGlobal ? 'text-purple-800' : 'text-primary'
                    }`}>
                        {tenant.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {isGlobal 
                            ? 'Modo: Administrador Global - Gestiona todas las clínicas'
                            : `Clínica: ${window.location.hostname}`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TenantInfo;