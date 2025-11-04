// src/components/ReviewsList.jsx

import { Star, User, MessageCircle } from 'lucide-react';

// Componente para mostrar estrellas
function StarRating({ rating, size = 'md' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    return (
        <div className="flex items-center">
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    className={`${sizeClasses[size]} ${
                        i < Math.floor(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                    }`}
                />
            ))}
            <span className="ml-2 text-sm font-medium text-foreground">
                {rating.toFixed(1)}
            </span>
        </div>
    );
}

function ReviewsList({ data }) {
    if (!data) {
        return (
            <div className="bg-card p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-primary mb-4">Calificaciones</h3>
                <p className="text-muted-foreground">Cargando calificaciones...</p>
            </div>
        );
    }

    if (data.total_reviews === 0) {
        return (
            <div className="bg-card p-8 rounded-xl text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-2">Sin calificaciones aún</h3>
                <p className="text-muted-foreground">
                    Este profesional aún no tiene calificaciones de pacientes.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-primary">
                    Calificaciones ({data.total_reviews})
                </h3>
                <div className="text-right">
                    <StarRating rating={data.average_rating} size="lg" />
                    <p className="text-sm text-muted-foreground mt-1">
                        Promedio de {data.total_reviews} {data.total_reviews === 1 ? 'calificación' : 'calificaciones'}
                    </p>
                </div>
            </div>

            {/* Distribución de calificaciones */}
            {data.rating_distribution && (
                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-3">Distribución de calificaciones</h4>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => (
                            <div key={stars} className="flex items-center gap-3">
                                <span className="text-sm font-medium w-8">{stars}★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${data.rating_distribution[stars] || 0}%` 
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm text-muted-foreground w-12">
                                    {data.rating_distribution[stars] || 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lista de reseñas */}
            <div className="space-y-4">
                {data.reviews.map(review => (
                    <div key={review.id} className="border border-border p-4 rounded-lg">
                        <div className="flex items-start gap-4">
                            {/* Avatar del paciente */}
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            
                            {/* Contenido de la reseña */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-foreground">
                                        {review.patient_name || 'Paciente anónimo'}
                                    </h5>
                                    <StarRating rating={review.rating} size="sm" />
                                </div>
                                
                                {review.comment && (
                                    <p className="text-foreground mb-2 leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                )}
                                
                                <p className="text-xs text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mostrar si hay más reseñas */}
            {data.total_reviews > data.reviews.length && (
                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {data.reviews.length} de {data.total_reviews} calificaciones
                    </p>
                </div>
            )}
        </div>
    );
}

export default ReviewsList;