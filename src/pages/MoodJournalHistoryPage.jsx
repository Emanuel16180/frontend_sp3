// src/pages/MoodJournalHistoryPage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { Loader, BookOpen, Calendar } from 'lucide-react';

// Helper para convertir el mood en emoji
const getMoodEmoji = (mood) => {
  const map = {
    'feliz': '😊',
    'tranquilo': '😌',
    'neutral': '😐',
    'triste': '😢',
    'ansioso': '😟',
    'irritable': '😠',
  };
  return map[mood] || '🤔';
};

function MoodJournalHistoryPage() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Idea 3: Cargar el historial
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await apiClient.get('/clinical-history/mood-journal/');
                setEntries(response.data.results || response.data || []);
            } catch (err) {
                console.error("Error al cargar el historial de ánimo:", err);
                setError("No se pudo cargar tu historial. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader className="animate-spin h-8 w-8 text-primary" />
                <p className="ml-4 text-muted-foreground">Cargando tu diario...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-destructive">{error}</p>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-8">Mi Diario de Ánimo</h1>

            {entries.length === 0 ? (
                <div className="bg-card text-card-foreground p-12 rounded-xl text-center shadow-lg">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-primary mb-2">Tu diario está vacío</h3>
                    <p className="text-muted-foreground">
                        Cada día te preguntaremos cómo te sientes. Tus respuestas aparecerán aquí.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {entries.map(entry => (
                        <div key={entry.id} className="bg-card p-6 rounded-xl shadow border border-border">
                            <div className="flex items-start justify-between">
                                {/* Emoji y Fecha */}
                                <div className="flex items-center gap-4">
                                    <span className="text-5xl">{getMoodEmoji(entry.mood)}</span>
                                    <div>
                                        <p className="text-xl font-bold capitalize text-foreground">{entry.mood}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(entry.date).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notas */}
                            {entry.notes && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{entry.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MoodJournalHistoryPage;