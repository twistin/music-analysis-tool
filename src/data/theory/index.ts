// Estructura de datos para contenido teórico por tema
// Alineado con la programación del Grado Profesional

export interface TheoryExample {
    type: 'audio' | 'score' | 'image';
    url: string;
    caption: string;
}

export interface TheoryTopic {
    id: string;
    title: string;
    course: '5gp' | '6gp';
    summary: string;
    content: string; // Markdown content
    keyPoints: string[];
    examples?: TheoryExample[];
    relatedTopics?: string[];
    bibliography?: string[];
}

// Contenidos teóricos iniciales - 5º GP
export const THEORY_CONTENT: Record<string, TheoryTopic> = {
    // ─────────────────────────────────────────────────────────────
    // TEXTURA Y ACOMPAÑAMIENTO
    // ─────────────────────────────────────────────────────────────
    'textura': {
        id: 'textura',
        title: 'Textura y Tipos de Acompañamiento',
        course: '5gp',
        summary: 'Estudio de las diferentes texturas musicales y sus características.',
        content: `
## Definición
La **textura** musical se refiere a cómo se relacionan las diferentes voces o partes en una composición.

## Tipos principales

### Monofonía
Una sola línea melódica sin acompañamiento armónico.
- Ejemplo: Canto Gregoriano

### Homofonía
Varias voces moviéndose con el mismo ritmo (acordes).
- Predominante en corales de Bach
- Melodía acompañada por acordes

### Polifonía
Varias melodías independientes sonando simultáneamente.
- Contrapunto imitativo (cánones, fugas)
- Contrapunto libre

### Melodía acompañada
Una voz principal con acompañamiento subordinado.
- Bajo Alberti (Clasicismo)
- Arpegios (Romanticismo)

## Tipos de acompañamiento
1. **Bajo continuo** - Barroco
2. **Bajo de Alberti** - Clasicismo
3. **Acordes arpegiados** - Romanticismo
4. **Ostinato** - Diversas épocas
        `,
        keyPoints: [
            'Monofonía: una sola voz',
            'Homofonía: voces con ritmo homogéneo',
            'Polifonía: voces independientes',
            'Melodía acompañada: jerarquía entre voces'
        ],
        relatedTopics: ['coral', 'fuga', 'madrigal']
    },

    // ─────────────────────────────────────────────────────────────
    // FORMA SONATA
    // ─────────────────────────────────────────────────────────────
    'sonata-clas': {
        id: 'sonata-clas',
        title: 'Forma Sonata Clásica',
        course: '5gp',
        summary: 'Estructura fundamental del Clasicismo: Exposición, Desarrollo, Reexposición.',
        content: `
## Estructura General

La forma sonata es la estructura más importante del Clasicismo (ca. 1750-1820).

### EXPOSICIÓN
1. **Tema A** (Tónica)
   - Presenta el material temático principal
   - Carácter enérgico o lírico

2. **Puente/Transición**
   - Modula hacia la tonalidad del Tema B
   - Mayor: V (dominante)
   - Menor: III (relativo mayor)

3. **Tema B** (Nueva tonalidad)
   - Contraste temático con Tema A
   - A menudo más lírico

4. **Codetta** (opcional)
   - Cierra la exposición
   - Confirma la nueva tonalidad

### DESARROLLO
- Elaboración de los temas expuestos
- Modulaciones a tonalidades lejanas
- Fragmentación, secuencias, imitaciones
- Tensión armónica máxima

### REEXPOSICIÓN
- Tema A en tónica
- Puente modificado (no modula)
- Tema B **en TÓNICA**
- Coda (opcional)

## Proporciones típicas
- Exposición: ~30-40%
- Desarrollo: ~20-30%
- Reexposición: ~30-40%
        `,
        keyPoints: [
            'Exposición: presenta dos temas contrastantes',
            'Desarrollo: elabora y fragmenta los temas',
            'Reexposición: repite todo en tónica',
            'Tema B aparece en V (o III menor) en exposición, pero en I en reexposición'
        ],
        relatedTopics: ['sonata-pre', 'binaria', 'minueto'],
        bibliography: [
            'Rosen, Charles. Formas de Sonata. Ed Labor, 1994',
            'LaRue, Jan. Análisis del Estilo Musical. Ed Span Press, 1998'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // FUGA
    // ─────────────────────────────────────────────────────────────
    'fuga': {
        id: 'fuga',
        title: 'La Fuga',
        course: '5gp',
        summary: 'Forma contrapuntística basada en la imitación de un sujeto.',
        content: `
## Definición
La **fuga** es una forma contrapuntística basada en el principio de imitación.

## Elementos fundamentales

### Sujeto
- Tema principal que se presenta al inicio
- Define el carácter de toda la fuga
- Aparece en cada voz sucesivamente

### Respuesta
- Imitación del sujeto en la dominante (V)
- **Real**: transposición exacta
- **Tonal**: modificada para mantener coherencia tonal

### Contrasujeto
- Contrapunto que acompaña al sujeto/respuesta
- Aparece consistentemente a lo largo de la fuga
- Diseñado para funcionar en doble contrapunto

### Episodio
- Pasaje sin entradas completas del sujeto
- Basado en material del sujeto o contrasujeto
- Función modulatoria

### Stretto
- Entradas del sujeto en estrecha sucesión
- Efecto de intensificación
- Típico de secciones finales

## Estructura típica
1. **Exposición**: todas las voces presentan el sujeto
2. **Episodios y entradas**: alternan modulaciones y reapariciones
3. **Stretto / Coda**: intensificación final
        `,
        keyPoints: [
            'Sujeto: tema principal, presentado en todas las voces',
            'Respuesta: imitación en la dominante (real o tonal)',
            'Contrasujeto: contrapunto complementario',
            'Episodio: pasaje de transición/modulación',
            'Stretto: entradas superpuestas del sujeto'
        ],
        relatedTopics: ['coral', 'textura'],
        bibliography: [
            'de la Motte, Diether. Armonía. Ed Labor, 1989'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // CADENCIAS
    // ─────────────────────────────────────────────────────────────
    'armonia-1': {
        id: 'armonia-1',
        title: 'Acordes, Notas de Adorno y Cadencias',
        course: '5gp',
        summary: 'Fundamentos de la armonía tonal: tipos de acordes y fórmulas cadenciales.',
        content: `
## Tipos de Cadencias

### Cadencia Perfecta (V-I)
- Conclusiva y definitiva
- Ambos acordes en estado fundamental
- Tónica en voz superior en acorde final

### Cadencia Plagal (IV-I)
- También conclusiva pero menos enérgica
- "Cadencia de Amén"

### Semicadencia (...-V)
- Inconclusa, crea expectativa
- Típica al final de antecedentes de frase

### Cadencia Rota (V-VI)
- Engaño de expectativa
- Prolonga el discurso musical

### Cadencia Frigia (♭II6-I)
- Cadencia sobre dominante en modo menor
- Característica de música española

## Notas de Adorno

### Notas de paso
- Conectan dos acordes por grado conjunto
- Tiempo débil

### Bordaduras
- Rodean la nota real
- Superior o inferior

### Apoyaturas
- Resuelven por grado conjunto
- Tiempo fuerte

### Retardos
- Nota que se mantiene del acorde anterior
- Preparación, percusión, resolución
        `,
        keyPoints: [
            'Cadencia Perfecta V-I: conclusiva',
            'Cadencia Plagal IV-I: "Amén"',
            'Semicadencia hacia V: suspensiva',
            'Cadencia Rota V-VI: engaño',
            'Notas de adorno: paso, bordadura, apoyatura, retardo'
        ],
        relatedTopics: ['armonia-2', 'modulacion', 'coral']
    },

    // ─────────────────────────────────────────────────────────────
    // ACORDES ALTERADOS (6ª Aumentada, Napolitana)
    // ─────────────────────────────────────────────────────────────
    'armonia-2': {
        id: 'armonia-2',
        title: 'Acordes Alterados (6ª Aumentada, Napolitana)',
        course: '5gp',
        summary: 'Acordes cromáticos que enriquecen la armonía tonal.',
        content: `
## Sexta Napolitana (♭II6)

### Estructura
- Acorde mayor sobre el II grado rebajado
- Siempre en primera inversión
- Ejemplo en Do: Fa-Lab-Reb

### Función
- Predominante (precede a V o I64)
- Color especial, carácter expresivo
- Común en modo menor, también en mayor

### Resolución típica
♭II6 → V (o I64 → V → I)

## Sextas Aumentadas

Acordes caracterizados por el intervalo de 6ª aumentada entre el bajo y una voz superior.

### Sexta Aumentada Italiana (It+6)
- Estructura: ♭VI - I - #IV
- Ejemplo en Do: Lab - Do - Fa#
- 3 notas

### Sexta Aumentada Alemana (Ger+6)
- Estructura: ♭VI - I - ♭III - #IV
- Ejemplo en Do: Lab - Do - Mib - Fa#
- 4 notas (incluye 5ª justa)

### Sexta Aumentada Francesa (Fr+6)
- Estructura: ♭VI - I - II - #IV
- Ejemplo en Do: Lab - Do - Re - Fa#
- 4 notas (incluye 2ª mayor)

### Resolución
- Todas resuelven a V (o I64)
- El intervalo de 6ª aumentada resuelve por movimiento contrario a la 8ª
        `,
        keyPoints: [
            '♭II6 (Napolitana): acorde mayor en II rebajado, primera inversión',
            'Sexta italiana: 3 notas (♭VI-I-#IV)',
            'Sexta alemana: 4 notas (añade ♭III)',
            'Sexta francesa: 4 notas (añade II)',
            'Todas funcionan como predominantes → V'
        ],
        relatedTopics: ['armonia-1', 'modulacion'],
        bibliography: [
            'de la Motte, Diether. Armonía. Ed Labor, 1989'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // LIED (6º GP)
    // ─────────────────────────────────────────────────────────────
    'lied': {
        id: 'lied',
        title: 'El Lied (Schubert, Schumann)',
        course: '6gp',
        summary: 'Canción artística alemana del Romanticismo.',
        content: `
## Definición
El **Lied** (plural: Lieder) es una canción artística alemana para voz y piano.

## Características principales

### Texto
- Poesía de alta calidad literaria
- Goethe, Heine, Müller, Eichendorff...
- Relación íntima entre texto y música

### Piano
- No es mero acompañamiento
- Papel expresivo fundamental
- Ilustra el texto (word painting)

### Formas

#### Lied estrófico
- Misma música para cada estrofa
- Ejemplo: "Das Wandern" (Schubert)

#### Lied modificado
- Variaciones sobre base estrófica
- Ejemplo: "Die Forelle" (Schubert)

#### Lied durchkomponiert (desarrollado)
- Música distinta para cada sección
- Sigue el drama del texto
- Ejemplo: "Erlkönig" (Schubert)

## Compositores principales

### Franz Schubert (1797-1828)
- Más de 600 Lieder
- Ciclos: Die schöne Müllerin, Winterreise

### Robert Schumann (1810-1856)
- Ciclos: Dichterliebe, Frauenliebe und -leben
- Piano más elaborado
        `,
        keyPoints: [
            'Unión íntima de poesía y música',
            'Piano como participante activo',
            'Estrófico vs. durchkomponiert',
            'Schubert: 600+ Lieder',
            'Schumann: ciclos elaborados'
        ],
        relatedTopics: ['peq-formas', 'rom-armonia', 'autores-rom']
    },

    // ─────────────────────────────────────────────────────────────
    // WAGNER Y LEITMOTIV (6º GP)
    // ─────────────────────────────────────────────────────────────
    'wagner': {
        id: 'wagner',
        title: 'Wagner y el Drama Musical (Leitmotiv)',
        course: '6gp',
        summary: 'El drama musical wagneriano y la técnica del leitmotiv.',
        content: `
## Richard Wagner (1813-1883)

### Concepto de Drama Musical
- Gesamtkunstwerk (obra de arte total)
- Unión de música, poesía, escena
- Superación de la ópera tradicional

### Características musicales

#### Melodía infinita
- Flujo continuo sin cadencias claras
- Evita estructuras simétricas tradicionales

#### Armonía cromática
- Acordes de Tristán
- Disonancia sin resolución inmediata
- Modulaciones enarmónicas

#### Orquestación expandida
- Orquesta aumentada (tubas Wagner)
- Colores tímbricos nuevos

## El Leitmotiv

### Definición
Motivo musical asociado a un personaje, objeto, idea o emoción.

### Función dramática
- Identifica elementos narrativos
- Anticipa o recuerda acontecimientos
- Red de significados musicales

### Técnicas de transformación
1. **Variación rítmica**
2. **Cambio de modo** (mayor/menor)
3. **Variación armónica**
4. **Cambio de instrumentación**
5. **Combinación de leitmotivs**

### Ejemplos famosos
- Leitmotiv del anillo (Der Ring)
- Leitmotiv de la espada
- Leitmotiv de la redención
        `,
        keyPoints: [
            'Gesamtkunstwerk: obra de arte total',
            'Melodía infinita: flujo sin cadencias',
            'Leitmotiv: motivo asociado a persona/idea',
            'Transformación del leitmotiv: desarrollo dramático',
            'Armonía cromática extrema (Tristán)'
        ],
        relatedTopics: ['rom-armonia', 'autores-rom'],
        bibliography: [
            'Downs, Philip G. La música clásica. Ed Akal'
        ]
    }
};

// Función para obtener contenido por ID
export const getTheoryContent = (topicId: string): TheoryTopic | undefined => {
    return THEORY_CONTENT[topicId];
};

// Función para obtener todos los temas de un curso
export const getTheoryByCourse = (course: '5gp' | '6gp'): TheoryTopic[] => {
    return Object.values(THEORY_CONTENT).filter(t => t.course === course);
};
