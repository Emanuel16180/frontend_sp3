// src/pages/ProfessionalsPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import { Search, Filter, Star, MapPin, Loader } from 'lucide-react'; // Importamos Loader

// --- Constantes de Clases de Tailwind ---
const btnPrimary = "px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center";
const btnOutline = "px-6 py-3 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors";

// --- Componente de Tarjeta de Profesional (recreando professional-card.tsx) ---
function ProfessionalCard({ professional }) {
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(" ").map((n) => n[0]).join("");
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border hover:shadow-2xl transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Foto */}
        <div className="flex-shrink-0">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-muted flex items-center justify-center">
            <span className="text-3xl font-semibold text-primary">
              {getInitials(professional.full_name)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">{professional.full_name}</h3>
            <p className="text-primary font-medium">
              {professional.specializations && professional.specializations.length > 0 
                ? professional.specializations.map(s => s.name).join(', ')
                : 'Especialidad no definida'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">{renderStars(professional.average_rating || 0)}</div>
            <span className="text-sm font-medium">{professional.average_rating || 0}</span>
            <span className="text-sm text-muted-foreground">({professional.total_reviews || 0} reseñas)</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{professional.city || 'Sin ciudad'}</span>
            </div>
          </div>
        </div>

        {/* Precio y Acción */}
        <div className="flex flex-col items-start sm:items-end justify-between gap-4 sm:min-w-[140px]">
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-1 text-2xl font-bold text-primary">
              <span>Bs. {professional.consultation_fee}</span>
            </div>
            <p className="text-sm text-muted-foreground">por consulta</p>
          </div>
          <Link to={`/professional/${professional.id}`} className={`${btnPrimary} w-full sm:w-auto`}>
            Ver Perfil
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal de la Página ---
function ProfessionalsPage() {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Estados para los filtros (¡NUEVO!) ---
    const [searchTerm, setSearchTerm] = useState("");
    const [specialty, setSpecialty] = useState("all");
    const [maxPrice, setMaxPrice] = useState(1000); // Precio máximo
    
// --- Lógica de Búsqueda y Filtro (¡NUEVO!) ---
    const filteredProfessionals = useMemo(() => {
        if (!Array.isArray(professionals)) {
            return [];
        }

        // --- ✨ ¡AÑADE ESTA LÍNEA! ✨ ---
        console.log('Datos ANTES de filtrar (estado "professionals"):', professionals);
        // -------------------------------

        const filtered = professionals.filter(prof => {
            const matchesSearch = searchTerm === "" || prof.full_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSpecialty = specialty === "all" || prof.specializations.some(s => s.name === specialty);
            
            // --- Asegúrate de tener esta corrección ---
            const fee = parseFloat(prof.consultation_fee);
            const matchesPrice = isNaN(fee) ? true : fee <= maxPrice; 
            // -----------------------------------------
            
            return matchesSearch && matchesSpecialty && matchesPrice;
        });

        // --- ✨ ¡AÑADE ESTA LÍNEA! ✨ ---
        console.log('Datos DESPUÉS de filtrar (variable "filtered"):', filtered);
        // -------------------------------

        return filtered;

    }, [professionals, searchTerm, specialty, maxPrice]);
    
// --- Carga inicial de datos (API) ---
    useEffect(() => {
        const fetchProfessionals = async () => {
            try {
          	 	const response = await apiClient.get('/professionals/');
      	 	 	console.log("Datos de la API:", response.data); // Manten esto para depurar

      	 	 	// --- ✨ ¡AQUÍ ESTÁ LA CORRECCIÓN! ✨ ---
      	 	 	// Cambia 'response.data.results' por 'response.data.professionals'
  	 	 	 	setProfessionals(response.data.professionals || []); 
  	 	 	
  	 	 	} catch (err) {
  	 	 	 	console.error("Error al cargar profesionales:", err)
  	 	 	 	setError('No se pudieron cargar los profesionales.');
          	} finally {
          	 	setLoading(false);
          	}
        };
      	fetchProfessionals();
  	}, []);
    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader className="animate-spin h-8 w-8 text-primary" />
                <p className="ml-4 text-muted-foreground">Cargando profesionales...</p>
            </div>
        );
    }

    if (error) return <p className="text-center text-destructive">{error}</p>;

    // --- JSX REFACTORIZADO ---
    return (
        <div className="max-w-7xl mx-auto">
            {/* Sección de Búsqueda */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-primary mb-2">Encuentra tu Psicólogo</h1>
              <p className="text-xl text-muted-foreground">Profesionales especializados para tu bienestar</p>
            </div>
            <div className="flex gap-2 max-w-2xl mx-auto mb-12">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar psicólogos por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 pl-12 bg-input border border-border rounded-lg text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button onClick={() => {}} className={btnPrimary}>Buscar</button>
            </div>

            {/* Contenedor de Filtros + Resultados */}
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Columna de Filtros (¡NUEVO!) */}
                <aside className="w-full lg:w-80">
                    <div className="bg-card p-6 rounded-xl shadow-lg border border-border sticky top-24">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </h3>
                        <div className="space-y-6">
                            {/* Filtro Especialidad (Ejemplo) */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Especialidad</label>
                                <select 
                                  value={specialty} 
                                  onChange={e => setSpecialty(e.target.value)}
                                  className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="all">Todas las especialidades</option>
                                    {/* Aquí deberías listar las especialidades reales de tu API */}
                                    <option value="Terapia de Pareja">Terapia de Pareja</option>
                                    <option value="Ansiedad y Estrés">Ansiedad y Estrés</option>
                                    <option value="Depresión">Depresión</option>
                                    <option value="Psicología Infantil">Psicología Infantil</option>
                                    <option value="Neuropsicología">Neuropsicología</option>
                                </select>
                            </div>

                            {/* Filtro Precio (Ejemplo) */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Precio máximo: Bs. {maxPrice}
                                </label>
                                <input
                                    type="range"
                                    min="50"
                                    max="1000"
                                    step="50"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <button onClick={() => {setSearchTerm(""); setSpecialty("all"); setMaxPrice(1000);}} className={btnOutline}>
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Columna de Resultados */}
                <main className="flex-1">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-2 text-primary">
                            Profesionales disponibles ({filteredProfessionals.length})
                        </h2>
                    </div>

                    {filteredProfessionals.length === 0 ? (
                        <div className="bg-card p-8 text-center rounded-xl shadow-lg border border-border">
                            <p className="text-lg text-muted-foreground">No se encontraron profesionales con esos filtros.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredProfessionals.map((professional) => (
                                <ProfessionalCard key={professional.id} professional={professional} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default ProfessionalsPage;