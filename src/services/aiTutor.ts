// Servicio de integración con Gemini para el tutor de armonía
import { GoogleGenerativeAI } from '@google/generative-ai';

// System prompt para el tutor de armonía
const HARMONY_TUTOR_SYSTEM_PROMPT = `Eres un profesor de armonía y análisis musical en un conservatorio español de grado profesional (5º y 6º).

Tu especialidad incluye:
- Armonía tonal y funcional (grados, funciones, conducciones)
- Análisis de formas musicales (sonata, fuga, rondó, lied, etc.)
- Historia de la música (Barroco, Clasicismo, Romanticismo)
- Contrapunto y técnicas compositivas
- Análisis de obras de Bach, Mozart, Beethoven, Schubert, Schumann, Wagner

Directrices de enseñanza:
1. Responde siempre en español
2. Usa terminología técnica correcta pero explica los conceptos con claridad
3. Cuando sea apropiado, incluye ejemplos musicales concretos
4. Fomenta el pensamiento crítico haciendo preguntas de seguimiento
5. Relaciona los conceptos con obras del repertorio estándar
6. Si el estudiante comete un error, corrige amablemente y explica por qué
7. Mantén un tono amable y motivador
8. Las respuestas deben ser concisas pero completas (máximo 3-4 párrafos)

Formato de respuestas:
- Usa markdown para estructurar tus respuestas
- Puedes usar negrita para términos importantes
- Usa listas cuando enumeres conceptos
- Si mencionas acordes, usa notación estándar (V7, IV6, etc.)`;

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Clase del servicio de AI
class AITutorService {
    private apiKey: string | null = null;
    private model: any = null;
    private chat: any = null;
    private history: ChatMessage[] = [];

    // Verificar si la API key está configurada
    isConfigured(): boolean {
        return this.apiKey !== null && this.apiKey.length > 0;
    }

    // Configurar la API key
    setApiKey(key: string): boolean {
        try {
            this.apiKey = key;
            const genAI = new GoogleGenerativeAI(key);
            this.model = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash',
                systemInstruction: HARMONY_TUTOR_SYSTEM_PROMPT
            });
            this.startNewChat();
            return true;
        } catch (error) {
            console.error('Error configuring API:', error);
            this.apiKey = null;
            this.model = null;
            return false;
        }
    }

    // Iniciar nueva conversación
    startNewChat(): void {
        if (!this.model) return;
        
        this.chat = this.model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
            },
        });
        this.history = [];
    }

    // Enviar mensaje y obtener respuesta
    async sendMessage(message: string): Promise<string> {
        if (!this.chat) {
            throw new Error('El tutor no está configurado. Por favor, introduce tu API key de Gemini.');
        }

        try {
            this.history.push({ role: 'user', content: message });
            
            const result = await this.chat.sendMessage(message);
            const response = result.response.text();
            
            this.history.push({ role: 'assistant', content: response });
            
            return response;
        } catch (error: any) {
            console.error('Error sending message:', error);
            
            // Manejar errores comunes
            if (error.message?.includes('API_KEY_INVALID')) {
                throw new Error('La API key no es válida. Por favor, verifica la clave.');
            } else if (error.message?.includes('QUOTA_EXCEEDED')) {
                throw new Error('Se ha superado el límite de uso de la API. Intenta más tarde.');
            } else {
                throw new Error('Error al comunicarse con el tutor. Intenta de nuevo.');
            }
        }
    }

    // Obtener historial de conversación
    getHistory(): ChatMessage[] {
        return [...this.history];
    }

    // Obtener sugerencias de preguntas según el tema
    getSuggestedQuestions(topicId?: string): string[] {
        const generalQuestions = [
            '¿Cuáles son las principales diferencias entre la cadencia perfecta y la plagal?',
            'Explícame la estructura de la forma sonata',
            '¿Qué es el círculo de quintas y para qué sirve?',
            '¿Cómo puedo reconocer una modulación?'
        ];

        const topicQuestions: Record<string, string[]> = {
            'fuga': [
                '¿Cuál es la diferencia entre respuesta real y tonal en una fuga?',
                'Explícame qué es un stretto y cuándo se utiliza',
                '¿Cómo analizo el sujeto de una fuga de Bach?'
            ],
            'sonata-clas': [
                '¿Por qué el tema B aparece en la dominante en la exposición?',
                '¿Qué técnicas se usan en el desarrollo de una sonata?',
                '¿Cuáles son las diferencias entre Haydn y Beethoven en la forma sonata?'
            ],
            'armonia-1': [
                '¿Qué notas puedo doblar en un acorde de séptima de dominante?',
                'Explícame las reglas de conducción de voces',
                '¿Cuándo uso un acorde de sexta napolitana?'
            ],
            'lied': [
                '¿Qué diferencia hay entre Lied estrófico y durchkomponiert?',
                '¿Cómo refleja Schubert el texto en su música?',
                'Compara los ciclos de Lieder de Schubert y Schumann'
            ]
        };

        if (topicId && topicQuestions[topicId]) {
            return topicQuestions[topicId];
        }
        
        return generalQuestions;
    }
}

// Singleton instance
export const aiTutorService = new AITutorService();
export type { ChatMessage };
