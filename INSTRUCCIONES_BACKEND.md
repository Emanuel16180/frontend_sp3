# 🚨 FIXES URGENTES BACKEND - Instrucciones

**Destinatario:** Equipo Backend  
**Fecha:** 21 Octubre 2025  
**Repositorio:** `psico_admin_sp1_despliegue2`

---

## 📋 RESUMEN EJECUTIVO

El frontend ha sido corregido y desplegado exitosamente. Ahora existen **2 problemas críticos en el backend** que impiden el funcionamiento completo:

1. ❌ Lista de psicólogos vacía (endpoint devuelve `[]`)
2. ❌ Historia clínica no guarda campos importantes

---

## 🐛 PROBLEMA 1: Lista de Psicólogos Vacía

### **Síntoma:**
```bash
GET /api/professionals/ → 200 OK
Response: [] (30 bytes)
```

El endpoint devuelve un array vacío cuando debería mostrar los psicólogos creados con `populate_demo_data.py`.

### **Causa Probable:**

El ViewSet está filtrando por `is_verified=True` y los profesionales creados con el script tienen `is_verified=False`.

### **Archivo a Modificar:**

**`apps/professionals/views.py`**

### **Código Actual (Posiblemente):**

```python
class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfessionalProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'patient':
            # Para pacientes: solo profesionales verificados
            return ProfessionalProfile.objects.filter(is_verified=True)
        elif self.request.user.user_type == 'admin':
            # Para admin: todos los profesionales ← PROBLEMA AQUÍ
            return ProfessionalProfile.objects.filter(is_verified=True)  # ← QUITAR FILTRO
        elif self.request.user.user_type == 'professional':
            # Para profesionales: solo su propio perfil
            return ProfessionalProfile.objects.filter(user=self.request.user)
        else:
            return ProfessionalProfile.objects.none()
```

### **Código Correcto:**

```python
class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfessionalProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'patient':
            # Para pacientes: solo profesionales verificados CON perfil
            return ProfessionalProfile.objects.filter(is_verified=True)
        elif self.request.user.user_type == 'admin':
            # Para admin: TODOS los profesionales (verificados o no)
            return ProfessionalProfile.objects.all()  # ← FIX
        elif self.request.user.user_type == 'professional':
            # Para profesionales: solo su propio perfil
            return ProfessionalProfile.objects.filter(user=self.request.user)
        else:
            return ProfessionalProfile.objects.none()
```

### **Testing Después del Fix:**

```bash
# En Render Shell o local:
python manage.py shell

# Verificar que existen profesionales en el tenant 'bienestar':
from django_tenants.utils import schema_context
from apps.professionals.models import ProfessionalProfile

with schema_context('bienestar'):
    profs = ProfessionalProfile.objects.all()
    print(f"✅ Total profesionales: {profs.count()}")
    
    for p in profs:
        print(f"- {p.user.get_full_name()} | Email: {p.user.email} | Verificado: {p.is_verified}")
```

**Resultado esperado:**
```
✅ Total profesionales: 3
- Dra. María Martínez | Email: dra.martinez@bienestar.com | Verificado: True
- Dr. Carlos Gómez | Email: dr.gomez@bienestar.com | Verificado: True
- Lic. Ana López | Email: ana.lopez@bienestar.com | Verificado: True
```

Si muestra `0 profesionales`, entonces el problema es que **no se ejecutó `populate_demo_data.py`**.

### **Comandos para Ejecutar en Render:**

```bash
# Opción 1: Arreglar el ViewSet y hacer deploy
git add apps/professionals/views.py
git commit -m "fix: Permitir a admins ver todos los profesionales (no solo verificados)"
git push origin main

# Opción 2 (si no hay profesionales): Poblar datos
python manage.py populate_demo_data --tenant bienestar
python manage.py populate_demo_data --tenant mindcare
```

---

## 🐛 PROBLEMA 2: Historia Clínica No Guarda Campos

### **Síntoma:**

Al editar una historia clínica desde el frontend:
- ✅ `consultation_reason` se guarda
- ✅ `history_of_illness` se guarda
- ❌ `diagnoses` NO se guarda
- ❌ `therapeutic_plan` NO se guarda
- ❌ `complementary_tests` NO se guarda
- ❌ Otros campos tampoco se guardan

### **Causa:**

Los campos están marcados como `read_only_fields` en el serializer → Django ignora los datos del frontend.

### **Archivo a Modificar:**

**`apps/clinical_history/serializers.py`**

### **Código Actual (Posiblemente):**

```python
class ClinicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalHistory
        fields = [
            'patient', 'consultation_reason', 'history_of_illness',
            'personal_pathological_history', 'family_history',
            'personal_non_pathological_history', 'mental_examination',
            'complementary_tests', 'diagnoses', 'therapeutic_plan',
            'risk_assessment', 'sensitive_topics',
            'created_by', 'last_updated_by', 'created_at', 'updated_at',
        ]
        # ❌ PROBLEMA: Demasiados campos read-only
        read_only_fields = [
            'patient', 'created_by', 'last_updated_by', 
            'created_at', 'updated_at',
            'diagnoses', 'therapeutic_plan', 'complementary_tests'  # ← PROBLEMA
        ]
```

### **Código Correcto:**

```python
class ClinicalHistorySerializer(serializers.ModelSerializer):
    """
    Serializer para leer y escribir en el modelo de Historial Clínico.
    """
    class Meta:
        model = ClinicalHistory
        fields = [
            'patient', 'consultation_reason', 'history_of_illness',
            'personal_pathological_history', 'family_history',
            'personal_non_pathological_history', 'mental_examination',
            'complementary_tests', 'diagnoses', 'therapeutic_plan',
            'risk_assessment', 'sensitive_topics',
            'created_by', 'last_updated_by', 'created_at', 'updated_at',
        ]
        # ✅ FIX: Solo campos que NUNCA deben editarse desde el frontend
        read_only_fields = [
            'patient',      # Se establece al crear, no se cambia
            'created_by',   # Auto-asignado al crear
            'created_at',   # Timestamp automático
            'updated_at'    # Timestamp automático
        ]
        # ⚠️ IMPORTANTE: 'last_updated_by' NO es read-only
        # Se actualiza en perform_update() del ViewSet
```

### **Verificar también el ViewSet:**

**`apps/clinical_history/views.py`**

```python
class ClinicalHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = ClinicalHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_update(self, serializer):
        # ✅ DEBE existir esta línea:
        serializer.save(last_updated_by=self.request.user)
```

### **Testing Después del Fix:**

1. **Login como profesional:**
   - Email: `dra.martinez@bienestar.com`
   - Password: `demo123`

2. **Ir a Historia Clínica de un paciente**

3. **Editar campos:**
   - Diagnósticos: "Trastorno de ansiedad generalizada (TAG)"
   - Plan terapéutico: "Terapia cognitivo-conductual (12 sesiones)"
   - Exámenes complementarios: "Escala de Hamilton para Ansiedad"

4. **Guardar y recargar página**

5. **Verificar que los campos persisten** ✅

---

## 🚀 IMPLEMENTACIÓN RÁPIDA

### **Opción 1: Solo Fix de Profesionales**

```bash
cd psico_admin_sp1_despliegue2

# Editar archivo
nano apps/professionals/views.py

# Cambiar línea en get_queryset() para admin:
# return ProfessionalProfile.objects.all()

# Commit y push
git add apps/professionals/views.py
git commit -m "fix: Permitir a admins ver todos los profesionales"
git push origin main

# Render auto-deploya en 2-3 minutos
```

### **Opción 2: Ambos Fixes**

```bash
cd psico_admin_sp1_despliegue2

# Editar ambos archivos
nano apps/professionals/views.py
nano apps/clinical_history/serializers.py

# Hacer cambios explicados arriba

# Commit y push
git add apps/professionals/views.py apps/clinical_history/serializers.py
git commit -m "fix: Profesionales visibles para admin + Historia clínica editable"
git push origin main

# Render auto-deploya en 2-3 minutos
```

---

## 🧪 TESTING COMPLETO

### **Test 1: Lista de Profesionales (Como Admin)**

```bash
# Request:
curl -X GET https://psico-admin.onrender.com/api/professionals/ \
  -H "Authorization: Token YOUR_ADMIN_TOKEN" \
  -H "Host: bienestar.psicoadmin.xyz"

# Expected Response (después del fix):
[
  {
    "id": 1,
    "user": {
      "email": "dra.martinez@bienestar.com",
      "first_name": "María",
      "last_name": "Martínez"
    },
    "specializations": ["Ansiedad", "Depresión"],
    "is_verified": true
  },
  ...
]
```

### **Test 2: Historia Clínica Editable**

```bash
# Request:
curl -X PATCH https://psico-admin.onrender.com/api/clinical-history/1/ \
  -H "Authorization: Token YOUR_PROFESSIONAL_TOKEN" \
  -H "Host: bienestar.psicoadmin.xyz" \
  -H "Content-Type: application/json" \
  -d '{
    "diagnoses": "TAG - Trastorno de Ansiedad Generalizada",
    "therapeutic_plan": "TCC - 12 sesiones semanales",
    "complementary_tests": "Escala Hamilton"
  }'

# Expected Response:
{
  "id": 1,
  "diagnoses": "TAG - Trastorno de Ansiedad Generalizada",
  "therapeutic_plan": "TCC - 12 sesiones semanales",
  "complementary_tests": "Escala Hamilton",
  "last_updated_by": {
    "email": "dra.martinez@bienestar.com",
    "first_name": "María"
  }
}
```

---

## 📊 CHECKLIST DE IMPLEMENTACIÓN

### **Backend:**
- [ ] Editar `apps/professionals/views.py` (get_queryset para admin)
- [ ] Editar `apps/clinical_history/serializers.py` (read_only_fields)
- [ ] Commit y push
- [ ] Esperar deploy de Render (2-3 min)
- [ ] Ejecutar testing con curl o Postman

### **Verificación:**
- [ ] GET /api/professionals/ devuelve lista con al menos 3 items
- [ ] PATCH /api/clinical-history/:id/ guarda diagnoses correctamente
- [ ] PATCH /api/clinical-history/:id/ guarda therapeutic_plan correctamente

### **Frontend (Ya completado):**
- [x] LoginPage guarda access_token + authToken
- [x] LandingPage sin loop infinito
- [x] GlobalAdminDashboard usa backend público

---

## 📱 CONTACTO

Si encuentras problemas durante la implementación:

1. **Verificar logs de Render:**
   - Dashboard Render → Logs
   - Buscar errores 500 o excepciones

2. **Ejecutar en Shell de Render:**
   - Connect to Shell
   - `python manage.py shell`
   - Ejecutar comandos de testing

3. **Rollback si es necesario:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

**Prioridad:** 🚨 CRÍTICA  
**Tiempo estimado:** 10 minutos  
**Complejidad:** BAJA (solo cambios en 2 archivos)

---

**Última actualización:** 21 Oct 2025, 07:50 UTC
