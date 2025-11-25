// src/components/SmartReportBot.jsx
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Loader, AlertCircle } from 'lucide-react';
import { generateSmartReport } from '../api';

function SmartReportBot() {
    const [messages, setMessages] = useState([
        { 
            sender: 'bot', 
            text: 'Hola Admin. Soy tu asistente de reportes. Pídeme lo que necesites, por ejemplo: "Ingresos de Juan Perez en noviembre" o "Todos los pagos de ayer".' 
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll al fondo cada vez que hay mensajes nuevos
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        setInput(''); // Limpiar input

        // 1. Agregar mensaje del usuario
        setMessages(prev => [...prev, { sender: 'user', text: userText }]);
        setIsLoading(true);

        try {
            // 2. Llamar al backend
            const response = await generateSmartReport(userText);

            // 3. Crear URL temporal para descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Intentar adivinar nombre (o poner uno por defecto con fecha)
            const dateStr = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `reporte_inteligente_${dateStr}.pdf`);
            
            document.body.appendChild(link);
            link.click(); // 🔥 Forzar descarga
            link.remove();
            window.URL.revokeObjectURL(url);

            // 4. Confirmar al usuario
            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: '¡Entendido! He generado el archivo y la descarga ha comenzado automáticamente. 📄' 
            }]);

        } catch (error) {
            console.error("Error generando reporte:", error);
            // Si el backend devuelve un error JSON dentro del blob, es difícil leerlo,
            // así que damos un mensaje genérico de fallo.
            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: 'Lo siento, hubo un error interpretando tu solicitud o generando el PDF. Intenta ser más específico con las fechas o nombres.',
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header del Chat */}
            <div className="bg-indigo-600 p-4 flex items-center gap-3 shadow-md">
                <div className="bg-white/20 p-2 rounded-full">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Asistente de Reportes</h3>
                    <p className="text-indigo-100 text-xs">Generación automática de PDFs</p>
                </div>
            </div>

            {/* Área de Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm flex gap-2 ${
                            msg.sender === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : msg.isError 
                                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}>
                            <div className="mt-1 flex-shrink-0">
                                {msg.sender === 'bot' ? (
                                    msg.isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />
                                ) : null}
                            </div>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-gray-200 text-gray-500 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-sm">
                            <Loader className="w-4 h-4 animate-spin" />
                            Generando reporte...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ej: Pagos de Maria esta semana..."
                    disabled={isLoading}
                    className="flex-1 p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white p-3 rounded-lg transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}

export default SmartReportBot;