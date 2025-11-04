# Script para aplicar el fix de CORS en el backend
# Ejecutar esto en el workspace del backend: psico_admin_sp1_despliegue2

# Navegar al backend
cd "c:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\psico_admin_sp1_despliegue2"

# Buscar el archivo settings.py
Get-ChildItem -Recurse -Filter "settings.py" | Select-Object FullName

# Una vez encontrado, abrir y modificar:
# BUSCAR: CORS_ALLOWED_ORIGIN_REGEXES = [
# AGREGAR: r"^https://.*\.vercel\.app$",

# Ejemplo de cómo debería quedar:
<#
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.psicoadmin\.xyz$",
    r"^https://.*\.vercel\.app$",
]
#>

# Después hacer commit:
git add config/settings.py  # o la ruta correcta
git commit -m "fix: Agregar CORS para dominios .vercel.app"
git push origin main
