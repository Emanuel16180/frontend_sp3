// src/pages/ChatPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ChevronLeft } from 'lucide-react';

// --- Constantes de Estilo ---
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center";

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const { appointmentId } = useParams();
    const webSocket = useRef(null);
    const messagesEndRef = useRef(null);
    
    // --- 1. NUEVO ESTADO ---
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        
        // --- 2. LEEMOS EL USUARIO DE LOCALSTORAGE ---
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
        // ------------------------------------------

        if (!token) return;

        const socketUrl = `ws://127.0.0.1:8000/ws/chat/${appointmentId}/?token=${token}`;
        
        webSocket.current = new WebSocket(socketUrl);

        webSocket.current.onopen = () => setIsConnected(true);
        webSocket.current.onclose = () => setIsConnected(false);
        webSocket.current.onerror = (error) => console.error("WebSocket error:", error);
        
        webSocket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, data]);
        };

        return () => {
            if (webSocket.current) {
                webSocket.current.close();
            }
        };
    }, [appointmentId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && isConnected) {
            webSocket.current.send(JSON.stringify({ 'message': newMessage }));
            setNewMessage('');
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Link to="/my-appointments" className="flex items-center gap-1 text-primary font-medium hover:underline mb-6">
                <ChevronLeft className="h-4 w-4" />
                Volver
            </Link>
            
            <h1 className="text-3xl font-bold text-primary mb-4">Chat de la Cita</h1>
            
            <div className="bg-card text-card-foreground rounded-xl shadow-lg border border-border flex flex-col h-[70vh]">
                
                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-background/50">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground mt-10">
                            {isConnected ? "Aún no hay mensajes en este chat." : "Conectando al chat..."}
                        </div>
                    )}
                    
                    {/* --- 3. LÓGICA DE ESTILO CONDICIONAL --- */}
                    {messages.map((msg, index) => {
                        if (!currentUser) return null; // Espera a que el usuario cargue

                        // Tu backend [apps/chat/consumers.py] usa 'first_name' (si existe) o 'username'
                        const senderName = currentUser.first_name || currentUser.username;
                        const isCurrentUser = msg.sender === senderName;
                        
                        const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
                        const bgColor = isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-background border border-border';
                        
                        return (
                            <div key={index} className={`flex ${alignment}`}>
                                <div className={`p-3 rounded-lg shadow-sm max-w-md ${bgColor}`}>
                                    {/* Solo muestra el nombre si NO es el usuario actual */}
                                    {!isCurrentUser && (
                                        <strong className="block text-sm font-medium text-accent-foreground">{msg.sender}</strong>
                                    )}
                                    <p>{msg.message}</p>
                                </div>
                            </div>
                        );
                    })}
                    {/* ------------------------------------- */}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex p-4 border-t border-border gap-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isConnected ? "Escribe un mensaje..." : "Conectando..."}
                        disabled={!isConnected}
                        className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button type="submit" className={btnPrimary} disabled={!isConnected}>
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatPage;