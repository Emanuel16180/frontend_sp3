// src/components/Chatbot.jsx
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { toast } from 'react-toastify';

// Motor de respuestas inteligente basado en reglas
class ChatbotEngine {
    constructor() {
        // Nombre del bot para personalidad
        this.botName = 'Luna';
        
        // Base de conocimiento con patrones y respuestas
        this.knowledgeBase = [
            // Saludos cálidos
            {
                patterns: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'ola'],
                responses: [
                    '¡Hola! � Soy Luna, tu compañera virtual. Estoy aquí para escucharte. ¿Cómo te sientes hoy?',
                    '¡Hola! Me alegra que estés aquí. Soy Luna 💙 ¿Quieres hablar de algo? Estoy para ti.',
                    '¡Hey! 👋 Soy Luna, y estoy aquí para hacerte compañía. ¿Cómo ha estado tu día?'
                ],
                category: 'greeting'
            },
            
            // Sentimientos negativos - Escucha empática
            {
                patterns: ['triste', 'mal', 'deprimido', 'solo', 'sola', 'ansiedad', 'ansioso', 'preocupado', 'miedo', 'angustia', 'llorar', 'dolor'],
                responses: [
                    'Lamento mucho que te sientas así 💙 Está bien sentirse vulnerable a veces. ¿Quieres contarme más sobre lo que estás pasando? Aquí estoy para escucharte sin juzgar.',
                    'Entiendo que estés pasando por un momento difícil. No estás solo en esto 🤗 A veces, solo hablar de lo que sentimos ya ayuda. ¿Qué ha estado pesando en tu mente?',
                    'Tu dolor es válido, y está bien no estar bien 💜 Gracias por confiar en mí. ¿Hay algo específico que te gustaría desahogar? Tómate tu tiempo.',
                    'Siento que estás cargando con algo pesado 🌙 Recuerda que pedir ayuda es un acto de valentía. ¿Quieres que hablemos de cómo te sientes, o prefieres que te ayude a agendar una cita con un profesional?'
                ],
                category: 'emotional_support'
            },
            
            // Sentimientos positivos - Celebración
            {
                patterns: ['bien', 'feliz', 'contento', 'contenta', 'genial', 'excelente', 'alegre', 'mejor', 'emocionado'],
                responses: [
                    '¡Qué alegría leer eso! 😊✨ Me encanta saber que estás bien. ¿Qué ha hecho que tu día sea bueno?',
                    '¡Eso es maravilloso! 🌟 Tu energía positiva es contagiosa. Cuéntame, ¿hay algo especial que quieras compartir?',
                    '¡Me alegro muchísimo por ti! 💛 Es hermoso celebrar los buenos momentos. ¿Qué te ha traído esa felicidad?'
                ],
                category: 'positive_emotions'
            },
            
            // Soledad y necesidad de compañía
            {
                patterns: ['solo', 'sola', 'nadie', 'acompañar', 'compañía', 'hablar', 'escuchar', 'charlar'],
                responses: [
                    'Estoy aquí contigo 💙 La soledad puede ser muy dura, pero quiero que sepas que no estás solo. Hablemos de lo que quieras, sin presión. ¿Qué has estado haciendo hoy?',
                    'No estás solo, yo estoy aquí para hacerte compañía 🌙 A veces solo necesitamos saber que alguien nos escucha. ¿Qué te gustaría platicar?',
                    'Entiendo esa sensación de soledad 💜 Pero ahora mismo, estoy aquí para ti. Podemos hablar de lo que necesites: tus pensamientos, tu día, tus preocupaciones... lo que sea.',
                    'La soledad duele, lo sé 🤗 Pero recuerda que siempre puedes venir aquí a conversar conmigo. ¿Hay algo que te esté rondando la mente?'
                ],
                category: 'loneliness'
            },
            
            // Estrés y agobio
            {
                patterns: ['estres', 'estresado', 'cansado', 'agobiado', 'exhausto', 'no puedo', 'demasiado'],
                responses: [
                    'Suena como si estuvieras llevando mucho peso 😔 Está bien sentirse abrumado, pero también está bien hacer una pausa. ¿Quieres contarme qué te tiene tan estresado?',
                    'El estrés puede ser agotador 💙 Tomar un momento para respirar y hablar puede ayudar. Estoy aquí para escucharte. ¿Qué es lo que más te agobia ahora mismo?',
                    'Siento que estás cansado 🌙 Recuerda que no tienes que cargar con todo solo. ¿Hay algo específico que te esté pesando?'
                ],
                category: 'stress'
            },
            
            // Motivación y apoyo
            {
                patterns: ['ayuda', 'no se', 'no sé', 'perdido', 'confundido', 'que hago'],
                responses: [
                    'Está bien sentirse perdido a veces 💜 Lo importante es que estás buscando apoyo, y eso es muy valiente. Cuéntame, ¿qué es lo que te tiene confundido?',
                    'No estás solo en esto 🤗 A veces, solo necesitamos hablar para ver las cosas más claras. ¿Qué situación te está complicando ahora?',
                    'Sentirse así es parte de ser humano 💙 Estoy aquí para acompañarte mientras encuentras tu camino. ¿Quieres contarme más?'
                ],
                category: 'support'
            },
            
            // Gratitud y aprecio
            {
                patterns: ['gracias', 'agradezco', 'graciass', 'thank'],
                responses: [
                    'No hay de qué 💙 Para eso estoy aquí, para acompañarte. Si necesitas hablar más, aquí estaré.',
                    'Me alegra haberte ayudado aunque sea un poco 😊 Recuerda que siempre puedes volver cuando lo necesites.',
                    'Gracias a ti por confiar en mí 🌙 Cuidar de tu bienestar emocional es importante. Vuelve cuando quieras.'
                ],
                category: 'gratitude'
            },
            
            // Agendamiento de citas (técnico pero empático)
            {
                patterns: ['agendar', 'cita', 'reservar', 'turno', 'hora', 'disponibilidad', 'cupo', 'terapia', 'sesion'],
                responses: [
                    'Me alegra que quieras dar ese paso 💙 Agendar una cita es importante. Te guío: 1) Ve a "Profesionales" 2) Elige el psicólogo que mejor se ajuste a ti 3) Selecciona fecha y hora 4) ¡Listo! ¿Necesitas ayuda con algún paso?',
                    'Es valiente buscar apoyo profesional 🌟 Para tu cita: encuentra tu psicólogo en "Profesionales", revisa su perfil, y agenda en el horario que te convenga. ¿Te ayudo con algo más?',
                    'Qué bueno que quieras cuidar de ti 💜 El proceso es simple: "Profesionales" → Selecciona uno → Elige tu horario. Si tienes dudas, aquí estoy.'
                ],
                category: 'appointment'
            },
            
            // Conversación casual
            {
                patterns: ['como estas', 'cómo estás', 'que tal', 'qué tal', 'como va', 'todo bien'],
                responses: [
                    '¡Gracias por preguntar! 😊 Yo estoy aquí, lista para acompañarte. Pero lo importante es: ¿cómo estás tú?',
                    'Estoy bien, gracias por preguntar 💙 Pero cuéntame de ti, ¿cómo te sientes hoy?',
                    'Muy bien, gracias 🌙 ¿Y tú? ¿Cómo ha sido tu día?'
                ],
                category: 'casual'
            },
            
            // Crisis o emergencia
            {
                patterns: ['suicidar', 'morir', 'matarme', 'acabar', 'terminar todo', 'no quiero vivir'],
                responses: [
                    '⚠️ Por favor, si estás en crisis, contacta inmediatamente: Línea de Prevención del Suicidio 1-888-628-9454. Tu vida importa, y hay personas capacitadas esperando ayudarte ahora mismo. 💙',
                    '⚠️ Lo que sientes es muy serio. Por favor llama YA a emergencias o a la Línea de Prevención del Suicidio: 1-888-628-9454. No estás solo, hay ayuda disponible las 24 horas. 🆘'
                ],
                category: 'crisis'
            },
            
            // Sobre el bot
            {
                patterns: ['quien eres', 'quién eres', 'que eres', 'qué eres', 'tu nombre', 'como te llamas'],
                responses: [
                    'Soy Luna 🌙 Tu compañera virtual en PsicoAdmin. No soy un profesional, pero estoy aquí para escucharte, acompañarte y ayudarte a encontrar el apoyo que necesitas. ¿De qué quieres hablar?',
                    'Me llamo Luna 💙 Soy una asistente virtual diseñada para hacerte compañía y apoyarte emocionalmente. Aunque no reemplazo a un psicólogo, puedo escucharte y orientarte. ¿Cómo puedo ayudarte hoy?'
                ],
                category: 'about_bot'
            },
            
            // Pagos
            {
                patterns: ['pagar', 'pago', 'precio', 'costo', 'tarjeta', 'stripe', 'cobro'],
                responses: [
                    'Los pagos se procesan de forma segura a través de Stripe. Después de agendar tu cita, serás redirigido al checkout donde podrás pagar con tarjeta. ¿Tienes alguna duda sobre el proceso?',
                    'Aceptamos pagos con tarjeta de crédito/débito a través de Stripe. El precio depende del profesional que elijas. ¿Necesitas más información?'
                ],
                category: 'payment'
            },
            
            // Documentos
            {
                patterns: ['documento', 'descargar', 'archivo', 'pdf', 'informe', 'material'],
                responses: [
                    'Puedes ver y descargar todos tus documentos clínicos en la sección "Mis Documentos". Tus psicólogos subirán allí material de apoyo e informes. ¿Necesitas ayuda para encontrar algo?',
                    'En "Mis Documentos" encontrarás todo el material que tus profesionales te han compartido. Puedes descargarlo haciendo clic en el botón "Descargar". ¿Hay algo específico que busques?'
                ],
                category: 'documents'
            },
            
            // Profesionales
            {
                patterns: ['psicólogo', 'profesional', 'terapeuta', 'especialista', 'doctor'],
                responses: [
                    'Contamos con profesionales especializados en diferentes áreas. Puedes ver sus perfiles, especialidades y disponibilidad en la sección "Profesionales". ¿Buscas alguna especialidad en particular?',
                    'Todos nuestros psicólogos están certificados y cuentan con amplia experiencia. En la sección "Profesionales" puedes ver su información, reseñas y horarios disponibles.'
                ],
                category: 'professionals'
            },
            
            // Historial clínico
            {
                patterns: ['historial', 'historia clínica', 'expediente', 'antecedentes', 'registro'],
                responses: [
                    'Tu historial clínico es confidencial y solo accesible para ti y tus profesionales asignados. Contiene notas de sesión, diagnósticos y evolución de tu tratamiento.',
                    'El historial clínico se actualiza después de cada sesión. Tu psicólogo registra notas importantes que ayudan a dar seguimiento a tu proceso terapéutico.'
                ],
                category: 'history'
            },
            
            // Cuenta y perfil
            {
                patterns: ['perfil', 'cuenta', 'contraseña', 'email', 'datos', 'información personal'],
                responses: [
                    'Puedes actualizar tu información personal en la sección "Mi Perfil". Allí también puedes cambiar tu contraseña y foto de perfil.',
                    'Para modificar tus datos: Ve a "Mi Perfil" → Edita la información que necesites → Guarda los cambios. ¿Necesitas ayuda específica con algo?'
                ],
                category: 'profile'
            },
            
            // Ayuda general
            {
                patterns: ['ayuda', 'help', 'no entiendo', 'no funciona', 'error', 'problema'],
                responses: [
                    'Estoy aquí para ayudarte. ¿Podrías contarme más detalles sobre lo que necesitas? Por ejemplo: ¿quieres agendar una cita, ver documentos, o tienes un problema técnico?',
                    'Claro, con gusto te ayudo. ¿Es sobre: agendamiento de citas, pagos, documentos, o algo más? Cuéntame para orientarte mejor.'
                ],
                category: 'help'
            },
            
            // Despedida cálida
            {
                patterns: ['adiós', 'adios', 'chao', 'bye', 'hasta luego', 'nos vemos', 'me voy'],
                responses: [
                    'Cuídate mucho 💙 Recuerda que siempre estaré aquí cuando necesites hablar. No estás solo. ¡Hasta pronto! 🌙',
                    'Fue un gusto acompañarte 😊 Vuelve cuando quieras, día o noche. Aquí estaré para ti. ¡Que estés bien! ✨',
                    'Hasta luego 💜 Recuerda: está bien no estar bien, y está bien pedir ayuda. Vuelve pronto. Te mando un abrazo virtual 🤗'
                ],
                category: 'farewell'
            }
        ];
        
        // Historial de conversación para contexto emocional
        this.conversationContext = [];
        this.userMood = 'neutral'; // Puede ser: positive, negative, neutral
    }
    
    // Función para normalizar texto (quitar acentos, minúsculas)
    normalize(text) {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }
    
    // Encontrar la mejor respuesta basada en el mensaje del usuario
    findResponse(userMessage) {
        const normalized = this.normalize(userMessage);
        let bestMatch = null;
        let maxScore = 0;
        
        // Buscar coincidencias en los patrones
        for (const entry of this.knowledgeBase) {
            let score = 0;
            
            for (const pattern of entry.patterns) {
                if (normalized.includes(this.normalize(pattern))) {
                    score += 10;
                }
            }
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = entry;
            }
        }
        
        // Si encontramos coincidencia, retornar respuesta aleatoria
        if (bestMatch && maxScore > 0) {
            const responses = bestMatch.responses;
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // Respuesta por defecto si no hay coincidencia
        return this.getDefaultResponse(userMessage);
    }
    
    // Respuestas por defecto cuando no hay coincidencia (más empáticas)
    getDefaultResponse(userMessage) {
        const defaultResponses = [
            'Mmm, cuéntame más sobre eso 💙 A veces hablar ayuda a ordenar los pensamientos. ¿Qué te gustaría compartir?',
            'Te escucho 🌙 No estoy segura de haber entendido completamente, pero estoy aquí para ti. ¿Puedes contarme un poco más?',
            'Estoy aquí para acompañarte 💜 ¿Quieres hablar sobre cómo te sientes, o prefieres que te ayude con algo específico de la plataforma?',
            'Estoy contigo 🤗 Si quieres desahogarte, adelante. Si necesitas ayuda técnica con citas o documentos, también puedo orientarte.',
            'Sigo aquí, escuchándote 💙 ¿Hay algo que te esté pesando? A veces solo necesitamos expresar lo que sentimos.'
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Agregar mensaje al contexto
    addToContext(role, message) {
        this.conversationContext.push({ role, message, timestamp: Date.now() });
        
        // Mantener solo los últimos 10 mensajes para contexto
        if (this.conversationContext.length > 10) {
            this.conversationContext.shift();
        }
    }
    
    // Obtener respuesta considerando contexto
    getResponse(userMessage) {
        this.addToContext('user', userMessage);
        const response = this.findResponse(userMessage);
        this.addToContext('bot', response);
        return response;
    }
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: '¡Hola! � Soy Luna, tu compañera virtual. Estoy aquí para escucharte, acompañarte y apoyarte en lo que necesites. No estás solo. ¿Cómo te sientes hoy?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const engineRef = useRef(null);
    
    // Inicializar el motor del chatbot
    useEffect(() => {
        engineRef.current = new ChatbotEngine();
    }, []);
    
    // Auto-scroll al último mensaje
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // Manejar envío de mensaje
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!inputMessage.trim()) return;
        
        // Agregar mensaje del usuario
        const userMessage = {
            role: 'user',
            text: inputMessage,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        
        // Simular tiempo de "pensamiento" del bot (300-800ms)
        const thinkingTime = 300 + Math.random() * 500;
        
        setTimeout(() => {
            // Obtener respuesta del motor
            const botResponse = engineRef.current.getResponse(inputMessage);
            
            const botMessage = {
                role: 'bot',
                text: botResponse,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, thinkingTime);
    };
    
    // Atajos rápidos (más emocionales)
    const quickActions = [
        { text: 'Me siento solo', emoji: '�' },
        { text: '¿Cómo agendar una cita?', emoji: '�' },
        { text: 'Necesito hablar', emoji: '�' },
        { text: 'Estoy estresado', emoji: '�' }
    ];
    
    const handleQuickAction = (actionText) => {
        setInputMessage(actionText);
    };
    
    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
                aria-label="Abrir chatbot"
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
            </button>
            
            {/* Ventana del chat */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">Luna 🌙</h3>
                            <p className="text-xs text-purple-100">Tu compañera de apoyo emocional</p>
                        </div>
                    </div>
                    
                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-2 ${
                                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                }`}
                            >
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    message.role === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-300 text-gray-700'
                                }`}>
                                    {message.role === 'user' ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>
                                
                                {/* Mensaje */}
                                <div className={`max-w-[75%] ${
                                    message.role === 'user' ? 'items-end' : 'items-start'
                                } flex flex-col`}>
                                    <div className={`rounded-lg p-3 ${
                                        message.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 rounded-tl-none shadow'
                                    }`}>
                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1">
                                        {message.timestamp.toLocaleTimeString('es-ES', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Indicador de escritura */}
                        {isTyping && (
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-gray-700">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-white rounded-lg rounded-tl-none p-3 shadow">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Acciones rápidas */}
                    {messages.length === 1 && (
                        <div className="p-3 bg-purple-50 border-t border-purple-100">
                            <p className="text-xs text-purple-600 mb-2">¿Cómo te sientes hoy?</p>
                            <div className="flex flex-wrap gap-2">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickAction(action.text)}
                                        className="text-xs bg-white hover:bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 transition-colors"
                                    >
                                        {action.emoji} {action.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Escribe tu pregunta..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isTyping}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
