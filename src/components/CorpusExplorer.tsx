import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Library, Music2, Loader2, AlertCircle, ChevronRight, 
    BookOpen, Filter, X, Download, Eye, BarChart3, RefreshCw
} from 'lucide-react';
import {
    searchCorpus,
    getBachWorks,
    getPopularWorks,
    getWorkAsMusicXML,
    getWorkInfo,
    analyzeWork,
    checkBackendHealth,
    WorkInfo,
    AnalysisResult,
    CORPUS_CATEGORIES,
    getSuggestedWorksForTopic
} from '../services/music21Api';

interface CorpusExplorerProps {
    topicId?: string;
    onSelectWork: (musicXmlContent: string, workInfo: WorkInfo) => void;
    onAnalysisComplete?: (analysis: AnalysisResult) => void;
}

const CorpusExplorer: React.FC<CorpusExplorerProps> = ({
    topicId,
    onSelectWork,
    onAnalysisComplete
}) => {
    // State
    const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedComposer, setSelectedComposer] = useState<string>('');
    const [selectedForm, setSelectedForm] = useState<string>('');
    const [works, setWorks] = useState<WorkInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingWork, setIsLoadingWork] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedWork, setSelectedWork] = useState<WorkInfo | null>(null);
    const [workAnalysis, setWorkAnalysis] = useState<AnalysisResult | null>(null);

    // Check backend on mount
    useEffect(() => {
        checkBackendHealth().then(setIsBackendOnline);
    }, []);

    // Auto-suggest based on topic
    useEffect(() => {
        if (topicId) {
            const suggestion = getSuggestedWorksForTopic(topicId);
            if (suggestion) {
                setSelectedComposer(suggestion.composer);
                setSelectedForm(suggestion.form);
            }
        }
    }, [topicId]);

    // Search handler
    const handleSearch = useCallback(async () => {
        if (!isBackendOnline) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await searchCorpus({
                composer: selectedComposer || undefined,
                title: searchQuery || undefined,
                form: selectedForm || undefined,
                limit: 50
            });
            setWorks(result.works);
        } catch (err) {
            setError('Error al buscar en el corpus');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [isBackendOnline, selectedComposer, selectedForm, searchQuery]);

    // Load Bach works shortcut
    const loadBachWorks = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getBachWorks();
            setWorks(result.works);
            setSelectedComposer('Bach');
        } catch (err) {
            setError('Error al cargar obras de Bach');
        } finally {
            setIsLoading(false);
        }
    };

    // Select a work
    const handleSelectWork = async (work: WorkInfo) => {
        setIsLoadingWork(work.id);
        setError(null);
        
        try {
            // Get MusicXML
            const musicXml = await getWorkAsMusicXML(work.id);
            
            // Get analysis
            const analysis = await analyzeWork(work.id);
            setWorkAnalysis(analysis);
            
            setSelectedWork(work);
            onSelectWork(musicXml, work);
            
            if (onAnalysisComplete) {
                onAnalysisComplete(analysis);
            }
        } catch (err) {
            setError('Error al cargar la obra');
            console.error(err);
        } finally {
            setIsLoadingWork(null);
        }
    };

    // Clear filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedComposer('');
        setSelectedForm('');
        setWorks([]);
    };

    // Backend offline state
    if (isBackendOnline === false) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle size={48} className="text-amber-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Backend de Music21 no disponible
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 max-w-md">
                        Para acceder al corpus de music21, necesitas iniciar el servidor backend.
                    </p>
                    <div className="bg-slate-900 rounded-lg p-4 text-left font-mono text-sm text-slate-300">
                        <p className="text-slate-500 mb-2"># En terminal, ejecuta:</p>
                        <p>cd backend</p>
                        <p>pip install -r requirements.txt</p>
                        <p>python main.py</p>
                    </div>
                    <button
                        onClick={() => checkBackendHealth().then(setIsBackendOnline)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
                    >
                        <RefreshCw size={16} />
                        Reintentar conexión
                    </button>
                </div>
            </div>
        );
    }

    // Loading state
    if (isBackendOnline === null) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={32} className="animate-spin text-blue-400" />
                    <span className="ml-3 text-slate-400">Conectando con Music21...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <Library size={20} className="text-emerald-400" />
                    <span className="font-medium text-white">Corpus de Music21</span>
                    <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                        Online
                    </span>
                </div>
                {topicId && (
                    <span className="text-xs text-slate-400">
                        Sugerencias para: {topicId}
                    </span>
                )}
            </div>

            {/* Search & Filters */}
            <div className="p-4 border-b border-slate-700 space-y-3">
                {/* Search Input */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por título..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 rounded-lg text-white font-medium flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        Buscar
                    </button>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    {/* Composer Filter */}
                    <select
                        value={selectedComposer}
                        onChange={(e) => setSelectedComposer(e.target.value)}
                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">Todos los compositores</option>
                        <option value="Bach">J.S. Bach</option>
                        <option value="Mozart">W.A. Mozart</option>
                        <option value="Beethoven">L. van Beethoven</option>
                        <option value="Haydn">J. Haydn</option>
                        <option value="Chopin">F. Chopin</option>
                        <option value="Schubert">F. Schubert</option>
                        <option value="Handel">G.F. Handel</option>
                        <option value="Palestrina">G.P. da Palestrina</option>
                    </select>

                    {/* Form Filter */}
                    <select
                        value={selectedForm}
                        onChange={(e) => setSelectedForm(e.target.value)}
                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">Todas las formas</option>
                        <option value="fugue">Fuga</option>
                        <option value="chorale">Coral</option>
                        <option value="sonata">Sonata</option>
                        <option value="minuet">Minueto</option>
                        <option value="prelude">Preludio</option>
                        <option value="suite">Suite</option>
                        <option value="concerto">Concierto</option>
                    </select>

                    {/* Quick Actions */}
                    <button
                        onClick={loadBachWorks}
                        className="px-3 py-1.5 bg-amber-600/20 text-amber-400 border border-amber-600/50 rounded-lg text-sm hover:bg-amber-600/30"
                    >
                        🎹 Bach
                    </button>

                    {(searchQuery || selectedComposer || selectedForm) && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-slate-400 hover:text-white flex items-center gap-1 text-sm"
                        >
                            <X size={14} />
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
                {works.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-slate-500">
                        <Music2 size={40} className="mx-auto mb-3 opacity-50" />
                        <p>Usa los filtros para buscar obras en el corpus</p>
                        <p className="text-xs mt-1">El corpus incluye ~2000+ obras de música clásica</p>
                    </div>
                )}

                {works.map((work) => (
                    <div
                        key={work.id}
                        className={`flex items-center justify-between px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                            selectedWork?.id === work.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''
                        }`}
                    >
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                                {work.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                {work.composer && (
                                    <span className="text-xs text-slate-400">{work.composer}</span>
                                )}
                                {work.movement_name && (
                                    <span className="text-xs text-slate-500">• {work.movement_name}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            <button
                                onClick={() => handleSelectWork(work)}
                                disabled={isLoadingWork === work.id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 rounded text-xs text-white font-medium"
                            >
                                {isLoadingWork === work.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Eye size={14} />
                                )}
                                Cargar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Work Analysis Preview */}
            {selectedWork && workAnalysis && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <BarChart3 size={16} className="text-purple-400" />
                        Análisis: {selectedWork.title}
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-800 p-2 rounded">
                            <span className="text-slate-500">Tonalidad</span>
                            <p className="text-white font-medium">{workAnalysis.key || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-800 p-2 rounded">
                            <span className="text-slate-500">Compás</span>
                            <p className="text-white font-medium">{workAnalysis.time_signature || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-800 p-2 rounded">
                            <span className="text-slate-500">Compases</span>
                            <p className="text-white font-medium">{workAnalysis.measure_count}</p>
                        </div>
                    </div>
                    {workAnalysis.chords.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                            <span className="text-xs text-slate-500">Primeros acordes:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {workAnalysis.chords.slice(0, 8).map((chord, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                                        {chord.roman_numeral || chord.pitches.join('-')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CorpusExplorer;
