export interface SyllabusTopic {
    id: string;
    title: string;
    category: 'theory' | 'form' | 'history';
}

export interface Course {
    id: string;
    title: string;
    description: string;
    objectives: string[];
    topics: SyllabusTopic[];
}

export const SYLLABUS: Course[] = [
    {
        id: '5gp',
        title: '5º Grao Profesional',
        description: 'Centrado en Barroco, Preclasicismo y Clasicismo.',
        objectives: [
            'Conocer elementos y procedimientos compositivos desde el Canto Gregoriano hasta la actualidad (foco en Barroco-Clasicismo).',
            'Analizar macro y microestructuras, armonía, temática, textura, etc.',
            'Identificar auditivamente acordes y fórmulas armónicas.',
            'Tocar esquemáticamente fórmulas armónicas.'
        ],
        topics: [
            { id: 'textura', title: 'Textura y Tipos de Acompañamiento', category: 'theory' },
            { id: 'melodia', title: 'Ámbito Melódico, Frases y Semifrases', category: 'theory' },
            { id: 'armonia-1', title: 'Acordes, Notas de Adorno y Cadencias', category: 'theory' },
            { id: 'armonia-2', title: 'Acordes Alterados (6ª Aumentada, Napolitana)', category: 'theory' },
            { id: 'modulacion', title: 'Procedimientos Modulatorios', category: 'theory' },
            { id: 'madrigal', title: 'El Madrigal', category: 'form' },
            { id: 'aria', title: 'Aria Da Capo y Forma Ritornello', category: 'form' },
            { id: 'coral', title: 'El Coral de J.S. Bach', category: 'form' },
            { id: 'fuga', title: 'La Fuga', category: 'form' },
            { id: 'concerto', title: 'Concerto Barroco', category: 'form' },
            { id: 'suite', title: 'Suite Barroca', category: 'form' },
            { id: 'binaria', title: 'Formas Binarias Preclásicas', category: 'form' },
            { id: 'sonata-pre', title: 'Forma Sonata Preclásica', category: 'form' },
            { id: 'sonata-clas', title: 'Forma Sonata Clásica', category: 'form' },
            { id: 'minueto', title: 'Minueto y Trío', category: 'form' },
            { id: 'variaciones', title: 'Tema y Variaciones', category: 'form' }
        ]
    },
    {
        id: '6gp',
        title: '6º Grao Profesional',
        description: 'Centrado en Clasicismo, Romanticismo y Siglo XX.',
        objectives: [
            'Profundizar en Clasicismo y Romanticismo.',
            'Introducción al Siglo XX.',
            'Análisis de macro/microestructuras y procedimientos complejos.',
            'Identificación auditiva avanzada.'
        ],
        topics: [
            { id: 'repaso', title: 'Repaso Conceptos Anteriores', category: 'theory' },
            { id: 'sonata-clas-2', title: 'Profundización Forma Sonata Clásica', category: 'form' },
            { id: 'rondo', title: 'Forma Rondó y Rondó-Sonata', category: 'form' },
            { id: 'rom-armonia', title: 'Armonía Romántica (Alterados, Modulación)', category: 'theory' },
            { id: 'lied', title: 'El Lied (Schubert, Schumann)', category: 'form' },
            { id: 'peq-formas', title: 'Pequeñas Formas Románticas', category: 'form' },
            { id: 'autores-rom', title: 'Grandes Autores (Chopin, Liszt, Brahms...)', category: 'history' },
            { id: 'wagner', title: 'Wagner y el Drama Musical (Leitmotiv)', category: 'history' },
            { id: 'nacionalismo', title: 'Música Nacionalista', category: 'history' },
            { id: 'sxx', title: 'Características y Autores Siglo XX', category: 'history' }
        ]
    }
];
