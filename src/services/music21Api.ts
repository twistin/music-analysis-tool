/**
 * Music21 Corpus Service
 * Frontend API client for the music21 corpus backend
 */

// @ts-ignore - Vite provides import.meta.env
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MUSIC21_API_URL) || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface WorkInfo {
    id: string;
    title: string;
    composer?: string;
    movement_name?: string;
    file_path: string;
}

export interface CorpusSearchResult {
    total: number;
    works: WorkInfo[];
}

export interface ChordInfo {
    offset: number;
    duration: number;
    pitches: string[];
    roman_numeral?: string;
    function?: string;
}

export interface AnalysisResult {
    key?: string;
    time_signature?: string;
    tempo?: string;
    measure_count: number;
    chords: ChordInfo[];
    cadences: { type: string; measure: number }[];
}

export interface WorkDetails {
    title?: string;
    composer?: string;
    movement?: string;
    parts: string[];
    measures: number;
    key?: string;
    time_signature?: string;
}

export interface PopularWorks {
    bach_fugues: { id: string; title: string; path: string }[];
    bach_chorales: { id: string; title: string; path: string }[];
    beethoven_sonatas: { id: string; title: string; path: string }[];
    mozart: { id: string; title: string; path: string }[];
    haydn: { id: string; title: string; path: string }[];
}

// ─────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Check if the backend is running
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get list of all composers in the corpus
 */
export async function getComposers(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/corpus/composers`);
    if (!response.ok) throw new Error('Failed to fetch composers');
    return response.json();
}

/**
 * Search the corpus for works matching criteria
 */
export async function searchCorpus(params: {
    composer?: string;
    title?: string;
    form?: string;
    limit?: number;
}): Promise<CorpusSearchResult> {
    const queryParams = new URLSearchParams();
    if (params.composer) queryParams.set('composer', params.composer);
    if (params.title) queryParams.set('title', params.title);
    if (params.form) queryParams.set('form', params.form);
    if (params.limit) queryParams.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/corpus/search?${queryParams}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
}

/**
 * Get Bach works specifically
 */
export async function getBachWorks(collection?: string): Promise<CorpusSearchResult> {
    const queryParams = new URLSearchParams();
    if (collection) queryParams.set('collection', collection);
    queryParams.set('limit', '100');

    const response = await fetch(`${API_BASE_URL}/corpus/bach?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch Bach works');
    return response.json();
}

/**
 * Get popular/commonly used works for education
 */
export async function getPopularWorks(): Promise<PopularWorks> {
    const response = await fetch(`${API_BASE_URL}/corpus/popular`);
    if (!response.ok) throw new Error('Failed to fetch popular works');
    return response.json();
}

/**
 * Get a work as MusicXML string
 */
export async function getWorkAsMusicXML(workId: string): Promise<string> {
    const response = await fetch(
        `${API_BASE_URL}/corpus/work/musicxml?work_id=${encodeURIComponent(workId)}`
    );
    if (!response.ok) throw new Error('Failed to fetch MusicXML');
    return response.text();
}

/**
 * Get detailed information about a work
 */
export async function getWorkInfo(workId: string): Promise<WorkDetails> {
    const response = await fetch(
        `${API_BASE_URL}/corpus/work/info?work_id=${encodeURIComponent(workId)}`
    );
    if (!response.ok) throw new Error('Failed to fetch work info');
    return response.json();
}

/**
 * Perform harmonic analysis on a work from the corpus
 */
export async function analyzeWork(workId: string): Promise<AnalysisResult> {
    const response = await fetch(
        `${API_BASE_URL}/corpus/work/analyze?work_id=${encodeURIComponent(workId)}`
    );
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
}

/**
 * Analyze uploaded MusicXML content
 */
export async function analyzeMusicXML(content: string): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/analyze/musicxml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
}

// ─────────────────────────────────────────────────────────────
// HELPER: Corpus categories for UI
// ─────────────────────────────────────────────────────────────

export const CORPUS_CATEGORIES = {
    baroque: {
        label: 'Barroco',
        composers: ['Bach', 'Handel', 'Vivaldi', 'Corelli', 'Purcell', 'Couperin'],
        forms: ['fugue', 'chorale', 'suite', 'concerto', 'sonata']
    },
    classical: {
        label: 'Clasicismo',
        composers: ['Mozart', 'Haydn', 'Beethoven'],
        forms: ['sonata', 'symphony', 'quartet', 'minuet', 'rondo']
    },
    romantic: {
        label: 'Romanticismo', 
        composers: ['Chopin', 'Schubert', 'Schumann', 'Brahms'],
        forms: ['nocturne', 'prelude', 'lied', 'ballade', 'étude']
    },
    renaissance: {
        label: 'Renacimiento',
        composers: ['Palestrina', 'Josquin', 'Monteverdi'],
        forms: ['motet', 'madrigal', 'mass']
    }
};

/**
 * Get suggested works for a specific topic
 */
export function getSuggestedWorksForTopic(topicId: string): { composer: string; form: string } | null {
    const suggestions: Record<string, { composer: string; form: string }> = {
        'fuga': { composer: 'Bach', form: 'fugue' },
        'coral': { composer: 'Bach', form: 'chorale' },
        'sonata-clas': { composer: 'Mozart', form: 'sonata' },
        'minueto': { composer: 'Mozart', form: 'minuet' },
        'rondo': { composer: 'Beethoven', form: 'rondo' },
        'lied': { composer: 'Schubert', form: 'lied' },
        'suite': { composer: 'Bach', form: 'suite' }
    };
    return suggestions[topicId] || null;
}
