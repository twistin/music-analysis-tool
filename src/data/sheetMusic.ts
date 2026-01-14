// Mapeo de temas del syllabus a partituras MusicXML
// Las partituras deben estar en /public/scores/

export interface SheetMusicInfo {
    url: string;
    title: string;
    composer: string;
    description: string;
}

// Mapeo de topicId a información de partitura
export const SHEET_MUSIC_MAP: Record<string, SheetMusicInfo> = {
    // ─────────────────────────────────────────────────────────────
    // 5º GP - BARROCO
    // ─────────────────────────────────────────────────────────────
    'fuga': {
        url: '/scores/bach-wtc1-fugue-cminor.musicxml',
        title: 'Fuga nº2 en Do menor, BWV 847',
        composer: 'J.S. Bach',
        description: 'Del Clave Bien Temperado, Vol. I'
    },
    'coral': {
        url: '/scores/bach-coral-bwv140.musicxml',
        title: 'Coral "Wachet auf", BWV 140',
        composer: 'J.S. Bach',
        description: 'Coral a 4 voces'
    },
    'suite': {
        url: '/scores/bach-french-suite-1.musicxml',
        title: 'Suite Francesa nº1 en Re menor, BWV 812',
        composer: 'J.S. Bach',
        description: 'Allemande, Courante, Sarabande, Gigue'
    },

    // ─────────────────────────────────────────────────────────────
    // 5º GP - CLASICISMO
    // ─────────────────────────────────────────────────────────────
    'sonata-clas': {
        url: '/scores/mozart-k545-1mov.musicxml',
        title: 'Sonata en Do mayor, K.545 - I. Allegro',
        composer: 'W.A. Mozart',
        description: 'Forma sonata clásica paradigmática'
    },
    'sonata-clas-2': {
        url: '/scores/beethoven-op2n1-1mov.musicxml',
        title: 'Sonata Op.2 nº1 en Fa menor - I. Allegro',
        composer: 'L. van Beethoven',
        description: 'Ejemplo de forma sonata del Clasicismo tardío'
    },
    'minueto': {
        url: '/scores/mozart-symphony40-minueto.musicxml',
        title: 'Sinfonía nº40, K.550 - III. Menuetto',
        composer: 'W.A. Mozart',
        description: 'Minueto y Trío'
    },
    'variaciones': {
        url: '/scores/mozart-k265-variations.musicxml',
        title: 'Variaciones sobre "Ah! vous dirai-je, maman", K.265',
        composer: 'W.A. Mozart',
        description: 'Tema y Variaciones'
    },
    'rondo': {
        url: '/scores/beethoven-op13-rondo.musicxml',
        title: 'Sonata "Patética" Op.13 - III. Rondó',
        composer: 'L. van Beethoven',
        description: 'Forma Rondó'
    },

    // ─────────────────────────────────────────────────────────────
    // 6º GP - ROMANTICISMO
    // ─────────────────────────────────────────────────────────────
    'lied': {
        url: '/scores/schubert-erlkoenig.musicxml',
        title: 'Erlkönig (El Rey de los Elfos), D.328',
        composer: 'F. Schubert',
        description: 'Lied durchkomponiert'
    },
    'peq-formas': {
        url: '/scores/chopin-nocturne-op9n2.musicxml',
        title: 'Nocturno en Mi♭ mayor, Op.9 nº2',
        composer: 'F. Chopin',
        description: 'Pequeña forma romántica'
    },
    'autores-rom': {
        url: '/scores/chopin-prelude-op28n4.musicxml',
        title: 'Preludio en Mi menor, Op.28 nº4',
        composer: 'F. Chopin',
        description: 'Ejemplo de armonía romántica cromática'
    }
};

// URL base para scores embebidos de dominio público (fallback)
export const MUSICXML_SOURCES = {
    musescore: 'https://musescore.com',
    imslp: 'https://imslp.org',
    openscore: 'https://openscore.cc'
};

// Función para obtener la información de partitura de un tema
export const getSheetMusicForTopic = (topicId: string): SheetMusicInfo | null => {
    return SHEET_MUSIC_MAP[topicId] || null;
};

// Verificar si un tema tiene partitura disponible
export const hasSheetMusic = (topicId: string): boolean => {
    return topicId in SHEET_MUSIC_MAP;
};
