// src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ChevronLeft, Loader } from 'lucide-react';
import apiClient from '../api';

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { appointmentId } = useParams();
    
    const messagesEndRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);
    
    const lastIdRef = useRef(0); 

    // --- ✨ HELPER PARA LA FECHA SIN ERRORES ✨ ---
    const formatMessageTime = (dateString) => {
        if (!dateString) return ''; // Si no hay fecha, no mostrar nada
        const date = new Date(dateString);
        // Si la fecha no es válida (NaN), devolver cadena vacía
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // 1. Cargar usuario actual
    useEffect(() => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
    }, []);

    // 2. Función para obtener mensajes (Polling)
    const fetchMessages = async () => {
        try {
            const response = await apiClient.get(`/chat/${appointmentId}/messages/`, {
                params: { last_id: lastIdRef.current }
            });

            const newMsgs = response.data;

            if (newMsgs.length > 0) {
                const lastMsg = newMsgs[newMsgs.length - 1];
                lastIdRef.current = lastMsg.id;

                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueNewMsgs = newMsgs.filter(m => !existingIds.has(m.id));
                    
                    if (uniqueNewMsgs.length === 0) return prev;
                    return [...prev, ...uniqueNewMsgs];
                });
            }
        } catch (error) {
            console.error("Error en polling de chat:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Configurar el intervalo
    useEffect(() => {
        fetchMessages();
        const intervalId = setInterval(() => {
            fetchMessages();
        }, 3000);
        return () => clearInterval(intervalId);
    }, [appointmentId]);

    // 4. Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 5. Enviar mensaje
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempMessage = newMessage;
        setNewMessage('');

        try {
            await apiClient.post(`/chat/${appointmentId}/messages/`, {
                message: tempMessage
            });
            fetchMessages();
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            setNewMessage(tempMessage);
            alert("No se pudo enviar el mensaje");
        }
    };

    return (
        <div className="max-w-3xl mx-auto h-screen flex flex-col py-6">
            <div className="flex items-center justify-between mb-4 px-4">
                <Link to="/my-appointments" className="flex items-center gap-1 text-primary font-medium hover:underline">
                    <ChevronLeft className="h-4 w-4" />
                    Volver
                </Link>
                <h1 className="text-2xl font-bold text-primary">Chat de Cita #{appointmentId}</h1>
            </div>
            
            <div className="flex-1 bg-card text-card-foreground rounded-xl shadow-lg border border-border flex flex-col overflow-hidden">
                
                {/* Área de Mensajes */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {loading && messages.length === 0 && (
                        <div className="flex justify-center py-10">
                            <Loader className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    )}

                    {!loading && messages.length === 0 && (
                        <div className="text-center text-muted-foreground mt-10">
                            No hay mensajes aún. ¡Di hola!
                        </div>
                    )}
                    
                    {messages.map((msg, index) => {
                        if (!currentUser) return null;

                        const senderName = typeof msg.sender === 'object' ? (msg.sender.username || msg.sender.email) : msg.sender;
                        const isCurrentUser = String(msg.sender) === String(currentUser.username) || String(msg.sender) === String(currentUser.id);

                        const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
                        const bubbleColor = isCurrentUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800';
                        
                        return (
                            <div key={msg.id || index} className={`flex ${alignment}`}>
                                <div className={`p-3 rounded-2xl shadow-sm max-w-[80%] ${bubbleColor}`}>
                                    {!isCurrentUser && (
                                        <p className="text-xs font-bold mb-1 opacity-70">{msg.sender}</p>
                                    )}
                                    <p className="text-sm">{msg.message}</p>
                                    
                                    {/* ✨ USO DE LA FUNCIÓN CORREGIDA AQUÍ ✨ */}
                                    <p className="text-[10px] mt-1 opacity-70 text-right">
                                        {formatMessageTime(msg.created_at)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-border flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 p-3 bg-gray-100 border border-transparent rounded-full text-foreground focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatPage;