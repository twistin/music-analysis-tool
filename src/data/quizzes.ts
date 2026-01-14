// Estructura de datos para cuestionarios y ejercicios
// Alineados con el currículo del Grado Profesional

export interface QuizQuestion {
    id: string;
    type: 'multiple_choice' | 'true_false' | 'identify' | 'order';
    question: string;
    options?: string[];
    correctAnswer: string | string[] | number;
    explanation: string;
    difficulty: 'basico' | 'intermedio' | 'avanzado';
    points: number;
}

export interface Quiz {
    id: string;
    topicId: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
    passingScore: number; // Percentage to pass
    timeLimit?: number; // In minutes, optional
}

// ─────────────────────────────────────────────────────────────
// CUESTIONARIOS POR TEMA
// ─────────────────────────────────────────────────────────────

export const QUIZZES: Record<string, Quiz> = {
    // ─────────────────────────────────────────────────────────
    // FUGA
    // ─────────────────────────────────────────────────────────
    'fuga': {
        id: 'quiz-fuga',
        topicId: 'fuga',
        title: 'Cuestionario: La Fuga',
        description: 'Evalúa tus conocimientos sobre la estructura y elementos de la fuga.',
        passingScore: 70,
        questions: [
            {
                id: 'fuga-1',
                type: 'multiple_choice',
                question: '¿Cuál es el elemento principal que inicia una fuga?',
                options: ['Contrasujeto', 'Sujeto', 'Episodio', 'Stretto'],
                correctAnswer: 'Sujeto',
                explanation: 'El sujeto es el tema principal de la fuga, presentado al inicio y que aparece en todas las voces.',
                difficulty: 'basico',
                points: 10
            },
            {
                id: 'fuga-2',
                type: 'multiple_choice',
                question: '¿En qué grado aparece normalmente la respuesta?',
                options: ['Tónica (I)', 'Dominante (V)', 'Subdominante (IV)', 'Mediante (III)'],
                correctAnswer: 'Dominante (V)',
                explanation: 'La respuesta es la imitación del sujeto transportada a la dominante (V grado).',
                difficulty: 'basico',
                points: 10
            },
            {
                id: 'fuga-3',
                type: 'true_false',
                question: 'La respuesta real es una transposición exacta del sujeto.',
                options: ['Verdadero', 'Falso'],
                correctAnswer: 'Verdadero',
                explanation: 'La respuesta real mantiene todos los intervalos exactos del sujeto, a diferencia de la tonal que modifica algunos.',
                difficulty: 'intermedio',
                points: 15
            },
            {
                id: 'fuga-4',
                type: 'multiple_choice',
                question: '¿Qué función tiene el episodio en una fuga?',
                options: [
                    'Presentar el sujeto en todas las voces',
                    'Modular y conectar secciones',
                    'Cerrar la fuga',
                    'Introducir nuevo material temático'
                ],
                correctAnswer: 'Modular y conectar secciones',
                explanation: 'Los episodios sirven para modular a nuevas tonalidades y conectar las diferentes entradas del sujeto.',
                difficulty: 'intermedio',
                points: 15
            },
            {
                id: 'fuga-5',
                type: 'multiple_choice',
                question: '¿Qué es el stretto?',
                options: [
                    'La primera entrada del sujeto',
                    'Entradas del sujeto en sucesión muy cercana',
                    'Una cadencia final',
                    'El contrapunto libre'
                ],
                correctAnswer: 'Entradas del sujeto en sucesión muy cercana',
                explanation: 'El stretto es una técnica donde las entradas del sujeto se superponen, creando intensificación.',
                difficulty: 'avanzado',
                points: 20
            },
            {
                id: 'fuga-6',
                type: 'multiple_choice',
                question: '¿Cuántas voces tiene la Fuga nº2 en Do menor BWV 847 de Bach?',
                options: ['2 voces', '3 voces', '4 voces', '5 voces'],
                correctAnswer: '3 voces',
                explanation: 'La Fuga nº2 del Clave Bien Temperado I es una fuga a 3 voces.',
                difficulty: 'avanzado',
                points: 20
            }
        ]
    },

    // ─────────────────────────────────────────────────────────
    // FORMA SONATA
    // ─────────────────────────────────────────────────────────
    'sonata-clas': {
        id: 'quiz-sonata',
        topicId: 'sonata-clas',
        title: 'Cuestionario: Forma Sonata Clásica',
        description: 'Evalúa tus conocimientos sobre la estructura de la forma sonata.',
        passingScore: 70,
        questions: [
            {
                id: 'sonata-1',
                type: 'multiple_choice',
                question: '¿Cuáles son las tres secciones principales de la forma sonata?',
                options: [
                    'Introducción, Tema, Coda',
                    'Exposición, Desarrollo, Reexposición',
                    'Tema A, Tema B, Tema C',
                    'Preludio, Fuga, Postludio'
                ],
                correctAnswer: 'Exposición, Desarrollo, Reexposición',
                explanation: 'La forma sonata se estructura en Exposición (presenta los temas), Desarrollo (elabora los temas) y Reexposición (repite todo en tónica).',
                difficulty: 'basico',
                points: 10
            },
            {
                id: 'sonata-2',
                type: 'multiple_choice',
                question: 'En una sonata en modo mayor, ¿en qué tonalidad aparece típicamente el Tema B en la Exposición?',
                options: ['Tónica', 'Dominante', 'Subdominante', 'Relativo menor'],
                correctAnswer: 'Dominante',
                explanation: 'En modo mayor, el Tema B aparece en la dominante (V) en la Exposición, y vuelve a la tónica en la Reexposición.',
                difficulty: 'intermedio',
                points: 15
            },
            {
                id: 'sonata-3',
                type: 'true_false',
                question: 'En la Reexposición, el Tema B aparece en la misma tonalidad que en la Exposición.',
                options: ['Verdadero', 'Falso'],
                correctAnswer: 'Falso',
                explanation: 'En la Reexposición, tanto el Tema A como el Tema B aparecen en la tónica, a diferencia de la Exposición.',
                difficulty: 'intermedio',
                points: 15
            },
            {
                id: 'sonata-4',
                type: 'multiple_choice',
                question: '¿Cuál es la función del puente (transición) en la Exposición?',
                options: [
                    'Cerrar la sección',
                    'Presentar un nuevo tema',
                    'Modular de la tonalidad del Tema A a la del Tema B',
                    'Desarrollar el material temático'
                ],
                correctAnswer: 'Modular de la tonalidad del Tema A a la del Tema B',
                explanation: 'El puente conecta los dos grupos temáticos y realiza la modulación hacia la nueva tonalidad.',
                difficulty: 'intermedio',
                points: 15
            },
            {
                id: 'sonata-5',
                type: 'multiple_choice',
                question: '¿Qué caracteriza principalmente al Desarrollo?',
                options: [
                    'Presenta nuevos temas',
                    'Elaboración, fragmentación y modulaciones',
                    'Repite la Exposición literalmente',
                    'Solo presenta el Tema A'
                ],
                correctAnswer: 'Elaboración, fragmentación y modulaciones',
                explanation: 'El Desarrollo se caracteriza por elaborar los temas presentados, fragmentarlos y explorar diferentes tonalidades.',
                difficulty: 'avanzado',
                points: 20
            }
        ]
    },

    // ─────────────────────────────────────────────────────────
    // CADENCIAS
    // ─────────────────────────────────────────────────────────
    'armonia-1': {
        id: 'quiz-cadencias',
        topicId: 'armonia-1',
        title: 'Cuestionario: Cadencias',
        description: 'Evalúa tus conocimientos sobre los tipos de cadencias.',
        passingScore: 70,
        questions: [
            {
                id: 'cad-1',
                type: 'multiple_choice',
                question: '¿Qué acordes forman una cadencia perfecta?',
                options: ['IV - I', 'V - I', 'V - VI', 'II - V'],
                correctAnswer: 'V - I',
                explanation: 'La cadencia perfecta (o auténtica) consiste en la progresión V - I, siendo la más conclusiva.',
                difficulty: 'basico',
                points: 10
            },
            {
                id: 'cad-2',
                type: 'multiple_choice',
                question: '¿Cómo se llama la cadencia IV - I?',
                options: ['Perfecta', 'Plagal', 'Rota', 'Frigia'],
                correctAnswer: 'Plagal',
                explanation: 'La cadencia plagal (IV - I) también se conoce como "cadencia de Amén" por su uso en himnos religiosos.',
                difficulty: 'basico',
                points: 10
            },
            {
                id: 'cad-3',
                type: 'multiple_choice',
                question: '¿Qué cadencia crea una sensación de "engaño" o sorpresa?',
                options: ['Perfecta', 'Plagal', 'Rota', 'Semicadencia'],
                correctAnswer: 'Rota',
                explanation: 'La cadencia rota (V - VI) engaña al oído que espera escuchar la tónica después de la dominante.',
                difficulty: 'intermedio',
                points: 15
            },
            {
                id: 'cad-4',
                type: 'true_false',
                question: 'La semicadencia termina en el acorde de dominante.',
                options: ['Verdadero', 'Falso'],
                correctAnswer: 'Verdadero',
                explanation: 'La semicadencia (...- V) termina en dominante, creando una sensación de suspensión o pregunta.',
                difficulty: 'intermedio',
                points: 15
            },
            {
                id: 'cad-5',
                type: 'multiple_choice',
                question: '¿Cuál es la característica principal de la cadencia frigia?',
                options: [
                    'Usa solo acordes mayores',
                    'El bajo desciende por semitono hacia la dominante',
                    'Termina en la tónica',
                    'Solo aparece en modo mayor'
                ],
                correctAnswer: 'El bajo desciende por semitono hacia la dominante',
                explanation: 'La cadencia frigia (♭II6 - V) se caracteriza por el movimiento descendente de semitono en el bajo.',
                difficulty: 'avanzado',
                points: 20
            }
        ]
    },

    // ─────────────────────────────────────────────────────────
    // LIED
    // ─────────────────────────────────────────────────────────
    'lied': {
        id: 'quiz-lied',
        topicId: 'lied',
        title: 'Cuestionario: El Lied',
        description: 'Evalúa tus conocimientos sobre la canción artística alemana.',
        passingScore: 70,
        questions: [
            {
                id: 'lied-1',
                type: 'multiple_choice',
                question: '¿Qué es un Lied?',
                options: [
                    'Una danza barroca',
                    'Una canción artística alemana para voz y piano',
                    'Una forma instrumental',
                    'Un tipo de ópera'
                ],
                correctAnswer: 'Una canción artística alemana para voz y piano',
                explanation: 'El Lied es una canción artística del Romanticismo alemán para voz solista con acompañamiento de piano.',
                difficulty: 'basico',
                points: 10
            },
            {
                id: 'lied-2',
                type: 'multiple_choice',
                question: '¿Qué significa "durchkomponiert"?',
                options: [
                    'Forma estrófica',
                    'Música diferente para cada estrofa',
                    'Solo piano',
                    'A cappella'
                ],
                correctAnswer: 'Música diferente para cada estrofa',
                explanation: 'Un Lied "durchkomponiert" (desarrollado) tiene música distinta para cada sección, siguiendo el drama del texto.',
                difficulty: 'intermedio',
                points: 15
            },
            {
                id: 'lied-3',
                type: 'multiple_choice',
                question: '¿Cuántos Lieder compuso aproximadamente Franz Schubert?',
                options: ['Unos 100', 'Unos 300', 'Más de 600', 'Unos 50'],
                correctAnswer: 'Más de 600',
                explanation: 'Schubert compuso más de 600 Lieder, siendo el compositor más prolífico en este género.',
                difficulty: 'intermedio',
                points: 15
            },
            {
                id: 'lied-4',
                type: 'multiple_choice',
                question: '¿Cuál de estos es un ciclo de Lieder de Schubert?',
                options: ['Dichterliebe', 'Winterreise', 'Frauenliebe und -leben', 'Kinderszenen'],
                correctAnswer: 'Winterreise',
                explanation: 'Winterreise (Viaje de Invierno) es uno de los ciclos más importantes de Schubert. Los otros mencionados son de Schumann.',
                difficulty: 'avanzado',
                points: 20
            }
        ]
    }
};

// Funciones auxiliares
export const getQuizForTopic = (topicId: string): Quiz | null => {
    return QUIZZES[topicId] || null;
};

export const hasQuiz = (topicId: string): boolean => {
    return topicId in QUIZZES;
};

export const calculateScore = (answers: Record<string, string>, quiz: Quiz): {
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    results: Array<{questionId: string; correct: boolean; points: number}>;
} => {
    let score = 0;
    const total = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const results: Array<{questionId: string; correct: boolean; points: number}> = [];

    quiz.questions.forEach(question => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) {
            score += question.points;
        }
        
        results.push({
            questionId: question.id,
            correct: isCorrect,
            points: isCorrect ? question.points : 0
        });
    });

    const percentage = Math.round((score / total) * 100);
    
    return {
        score,
        total,
        percentage,
        passed: percentage >= quiz.passingScore,
        results
    };
};
