import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import * as musicMetadata from 'music-metadata';
import { Play, Pause, Download, Trash2, Info, ArrowLeft, Music, FileAudio, ChevronDown, ChevronRight, BookOpen, Headphones, ClipboardCheck, Bot, Disc3, User, Calendar, Album, FileMusic, Upload, Library } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ANALYSIS_SECTIONS, SECTION_CATEGORIES, getCategoriesForTopic } from '../../constants';
import { MusicalSection } from '../../types';
import TheoryContent from './TheoryContent';
import Quiz from './Quiz';
import AiTutor from './AiTutor';
import { getSheetMusicForTopic } from '../data/sheetMusic';
import AnnotatedScoreViewer, { AnnotatedScoreViewerRef } from './AnnotatedScoreViewer';
import CorpusExplorer from './CorpusExplorer';
import { WorkInfo, AnalysisResult } from '../services/music21Api';

// Interface for audio metadata
interface AudioMetadata {
    title?: string;
    artist?: string;
    album?: string;
    year?: number;
    genre?: string[];
    duration?: number;
    bitrate?: number;
    sampleRate?: number;
    format?: string;
    cover?: string; // base64 encoded
}

const AnalysisStudio: React.FC = () => {
    const navigate = useNavigate();
    const { topicId } = useParams();
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const regions = useRef<any>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeRegions, setActiveRegions] = useState<MusicalSection[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'analysis' | 'theory' | 'quiz' | 'tutor'>('theory');
    const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
    
    // Score viewer state
    const scoreViewerRef = useRef<AnnotatedScoreViewerRef>(null);
    const [uploadedScoreUrl, setUploadedScoreUrl] = useState<string | null>(null);
    const [uploadedScoreContent, setUploadedScoreContent] = useState<string | null>(null);
    const [scoreFileName, setScoreFileName] = useState<string>('');
    
    // Corpus explorer state
    const [showCorpusExplorer, setShowCorpusExplorer] = useState(false);
    const [selectedCorpusWork, setSelectedCorpusWork] = useState<WorkInfo | null>(null);
    const [corpusAnalysis, setCorpusAnalysis] = useState<AnalysisResult | null>(null);

    // Handle work selection from corpus
    const handleCorpusWorkSelect = useCallback((musicXmlContent: string, workInfo: WorkInfo) => {
        setUploadedScoreContent(musicXmlContent);
        setUploadedScoreUrl(null);
        setScoreFileName(workInfo.title);
        setSelectedCorpusWork(workInfo);
        setShowCorpusExplorer(false); // Close explorer after selection
    }, []);

    const handleCorpusAnalysis = useCallback((analysis: AnalysisResult) => {
        setCorpusAnalysis(analysis);
    }, []);

    // Get sheet music info for current topic
    const topicSheetMusic = useMemo(() => {
        if (!topicId) return null;
        return getSheetMusicForTopic(topicId);
    }, [topicId]);

    // Get relevant categories for current topic
    const relevantCategories = useMemo(() => {
        if (!topicId) return Object.keys(SECTION_CATEGORIES);
        return getCategoriesForTopic(topicId);
    }, [topicId]);

    // Initialize expanded categories based on topic
    useEffect(() => {
        setExpandedCategories(new Set(relevantCategories));
    }, [relevantCategories]);

    const toggleCategory = (categoryKey: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryKey)) {
                next.delete(categoryKey);
            } else {
                next.add(categoryKey);
            }
            return next;
        });
    };

    // Initialize WaveSurfer
    useEffect(() => {
        if (!waveformRef.current || !audioUrl) return;

        // Create plugin instance
        const regionsPlugin = RegionsPlugin.create();
        regions.current = regionsPlugin;

        const ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#475569',
            progressColor: '#3b82f6',
            cursorColor: '#f8fafc',
            barWidth: 2,
            barGap: 3,
            barRadius: 3,
            height: 128,
            plugins: [regionsPlugin],
        });

        wavesurfer.current = ws;

        // Event Handlers
        ws.on('ready', () => {
            setDuration(ws.getDuration());
            setError(null);
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        ws.on('timeupdate', (time) => setCurrentTime(time));

        ws.on('error', (err) => {
            console.error("Wavesurfer error:", err);
            setError("Error al cargar el audio. Por favor intenta con otro archivo.");
        });

        // Handle Region Sync
        const syncRegions = () => {
            const allRegions = regionsPlugin.getRegions().map((r: any) => ({
                id: r.id,
                label: r.content?.textContent || 'Sin etiqueta',
                color: r.color,
                start: r.start,
                end: r.end
            }));
            setActiveRegions(allRegions);
        };

        regionsPlugin.on('region-created', syncRegions);
        regionsPlugin.on('region-updated', syncRegions);
        regionsPlugin.on('region-clicked', (region: any) => {
            region.play();
        });

        // Load default or current URL
        ws.load(audioUrl);

        return () => {
            ws.destroy();
        };
    }, [audioUrl]);

    const togglePlay = useCallback(() => {
        wavesurfer.current?.playPause();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            setFileName(file.name);
            setIsLoadingMetadata(true);
            setAudioMetadata(null);

            try {
                // Parse audio metadata using music-metadata
                const metadata = await musicMetadata.parseBlob(file);
                
                // Extract cover art if available
                let coverBase64: string | undefined;
                if (metadata.common.picture && metadata.common.picture.length > 0) {
                    const picture = metadata.common.picture[0];
                    const base64 = btoa(
                        new Uint8Array(picture.data).reduce(
                            (data, byte) => data + String.fromCharCode(byte),
                            ''
                        )
                    );
                    coverBase64 = `data:${picture.format};base64,${base64}`;
                }

                setAudioMetadata({
                    title: metadata.common.title,
                    artist: metadata.common.artist,
                    album: metadata.common.album,
                    year: metadata.common.year,
                    genre: metadata.common.genre,
                    duration: metadata.format.duration,
                    bitrate: metadata.format.bitrate,
                    sampleRate: metadata.format.sampleRate,
                    format: metadata.format.container,
                    cover: coverBase64,
                });
            } catch (err) {
                console.warn('Could not parse audio metadata:', err);
                // Still continue - just won't have metadata
            } finally {
                setIsLoadingMetadata(false);
            }
        }
    };

    // Handle MusicXML score upload
    const handleScoreUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScoreFileName(file.name);
        
        // Check file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        if (extension === 'musicxml' || extension === 'xml' || extension === 'mxl') {
            // Read as text for MusicXML files
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setUploadedScoreContent(content);
                setUploadedScoreUrl(null);
            };
            reader.readAsText(file);
        } else {
            // For other files, try to load as URL
            const url = URL.createObjectURL(file);
            setUploadedScoreUrl(url);
            setUploadedScoreContent(null);
        }
    };

    const addAnalysisRegion = (key: string) => {
        if (!wavesurfer.current || !regions.current) return;

        const template = ANALYSIS_SECTIONS[key];
        const startTime = wavesurfer.current.getCurrentTime();

        // Default 10 second span for new regions or until end of track
        const endTime = Math.min(startTime + 10, wavesurfer.current.getDuration());

        regions.current.addRegion({
            start: startTime,
            end: endTime,
            color: template.color,
            content: template.label,
            drag: true,
            resize: true
        });
    };

    const clearAllRegions = () => {
        if (window.confirm("¿Estás seguro de que quieres borrar todo el análisis?")) {
            regions.current?.clearRegions();
            setActiveRegions([]);
        }
    };

    const exportAnalysis = () => {
        const data = JSON.stringify(activeRegions, null, 2);
        console.log("Exporting Analysis JSON:", data);
        alert("Análisis exportado a la consola (F12). \n\nTotal de secciones: " + activeRegions.length);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Render categorized analysis buttons
    const renderCategorizedButtons = () => {
        // Order categories: first relevant ones, then others
        const orderedCategories = [
            ...Object.entries(SECTION_CATEGORIES).filter(([key]) => relevantCategories.includes(key)),
            ...Object.entries(SECTION_CATEGORIES).filter(([key]) => !relevantCategories.includes(key))
        ];

        return (
            <div className="space-y-3">
                {orderedCategories.map(([categoryKey, category]) => {
                    const isRelevant = relevantCategories.includes(categoryKey);
                    const isExpanded = expandedCategories.has(categoryKey);
                    
                    return (
                        <div key={categoryKey} className={`rounded-lg overflow-hidden ${isRelevant ? 'bg-slate-800/50' : 'bg-slate-900/30'}`}>
                            <button
                                onClick={() => toggleCategory(categoryKey)}
                                className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                                    isRelevant ? 'hover:bg-slate-700/50' : 'hover:bg-slate-800/50 opacity-60'
                                }`}
                            >
                                <span className={`font-medium ${isRelevant ? 'text-white' : 'text-slate-400'}`}>
                                    {category.label}
                                    {isRelevant && (
                                        <span className="ml-2 text-xs text-emerald-400">• Recomendado</span>
                                    )}
                                </span>
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                            
                            {isExpanded && (
                                <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                                    {category.keys.map((key) => {
                                        const section = ANALYSIS_SECTIONS[key];
                                        if (!section) return null;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => addAnalysisRegion(key)}
                                                className={`py-2 px-3 rounded-md text-xs font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm ${section.tailwind}`}
                                            >
                                                {section.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full space-y-6 p-6">
            {/* Header */}
            <header className="flex items-center justify-between gap-4 border-b border-slate-700 pb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Estudio de Análisis
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {topicId ? `Trabajando en: ${topicId}` : 'Modo Libre'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors text-sm border border-slate-700">
                        <FileAudio size={18} className="text-blue-400" />
                        <span>Cargar Audio</span>
                        <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                    </label>
                    <button
                        onClick={exportAnalysis}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-700 pb-0">
                <button
                    onClick={() => setActiveTab('theory')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'theory'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                >
                    <BookOpen size={18} />
                    Contenido Teórico
                </button>
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'analysis'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                >
                    <Headphones size={18} />
                    Estudio de Análisis
                </button>
                <button
                    onClick={() => setActiveTab('quiz')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'quiz'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                >
                    <ClipboardCheck size={18} />
                    Evaluación
                </button>
                <button
                    onClick={() => setActiveTab('tutor')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'tutor'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                >
                    <Bot size={18} />
                    Tutor IA
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">

                {/* THEORY TAB */}
                {activeTab === 'theory' && topicId && (
                    <TheoryContent topicId={topicId} />
                )}

                {activeTab === 'theory' && !topicId && (
                    <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 text-center">
                        <BookOpen size={48} className="mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-400">Selecciona un tema del Dashboard para ver su contenido teórico.</p>
                    </div>
                )}

                {/* QUIZ TAB */}
                {activeTab === 'quiz' && topicId && (
                    <Quiz topicId={topicId} />
                )}

                {activeTab === 'quiz' && !topicId && (
                    <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 text-center">
                        <ClipboardCheck size={48} className="mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-400">Selecciona un tema del Dashboard para acceder a su cuestionario.</p>
                    </div>
                )}

                {/* TUTOR IA TAB */}
                {activeTab === 'tutor' && (
                    <AiTutor topicId={topicId} />
                )}

                {/* ANALYSIS TAB */}
                {activeTab === 'analysis' && (
                    <>
                        {/* Waveform Card */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl relative min-h-[200px]">
                            {error && (
                                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-200 text-sm">
                                    <Info size={18} className="shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {!audioUrl && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 bg-slate-800/90 rounded-xl">
                                    <Music size={48} className="mb-4 text-slate-600" />
                                    <p className="text-lg font-medium">No hay audio cargado</p>
                                    <p className="text-sm text-slate-500 mb-6">Sube un archivo MP3 o WAV para comenzar a analizar</p>
                                    <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer transition-colors text-white font-medium shadow-lg shadow-blue-500/20">
                                        <FileAudio size={20} />
                                        <span>Seleccionar Archivo</span>
                                        <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            )}

                            <div ref={waveformRef} className="mb-6 min-h-[128px]" />

                            <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 transition-opacity duration-300 ${!audioUrl ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={togglePlay}
                                        className="w-14 h-14 flex items-center justify-center bg-blue-500 hover:bg-blue-400 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                                    >
                                        {isPlaying ? <Pause fill="white" size={24} /> : <Play fill="white" size={24} className="ml-1" />}
                                    </button>

                                    <div className="text-slate-300 font-mono text-xl tabular-nums">
                                        {formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(duration)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
                                    <Info size={16} />
                                    <span className="text-xs">Arrastra y redimensiona las regiones creadas</span>
                                </div>
                            </div>
                        </div>

                        {/* Audio Info Panel - Shows metadata from uploaded file */}
                        {audioUrl && (
                            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-xl border border-slate-700 p-5 shadow-lg">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Disc3 size={16} className="text-blue-400" />
                                    Información del Audio
                                </h3>
                                
                                <div className="flex gap-5">
                                    {/* Cover Art or Placeholder */}
                                    <div className="shrink-0">
                                        {audioMetadata?.cover ? (
                                            <img 
                                                src={audioMetadata.cover} 
                                                alt="Cover art" 
                                                className="w-24 h-24 rounded-lg object-cover shadow-lg border border-slate-600"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
                                                <Music size={32} className="text-slate-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Metadata Details */}
                                    <div className="flex-1 min-w-0">
                                        {isLoadingMetadata ? (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm">Leyendo metadatos...</span>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Title */}
                                                <h4 className="text-lg font-bold text-white truncate mb-1">
                                                    {audioMetadata?.title || fileName || 'Archivo de audio'}
                                                </h4>

                                                {/* Artist and Album */}
                                                <div className="space-y-1 mb-3">
                                                    {audioMetadata?.artist && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                                            <User size={14} className="text-slate-500" />
                                                            <span>{audioMetadata.artist}</span>
                                                        </div>
                                                    )}
                                                    {audioMetadata?.album && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <Album size={14} className="text-slate-500" />
                                                            <span>{audioMetadata.album}</span>
                                                            {audioMetadata?.year && (
                                                                <span className="text-slate-500">({audioMetadata.year})</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {audioMetadata?.genre && audioMetadata.genre.length > 0 && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
                                                                {audioMetadata.genre.join(', ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Technical Info */}
                                                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                                    {audioMetadata?.format && (
                                                        <span className="px-2 py-1 bg-slate-700/50 rounded">
                                                            {audioMetadata.format.toUpperCase()}
                                                        </span>
                                                    )}
                                                    {audioMetadata?.bitrate && (
                                                        <span className="px-2 py-1 bg-slate-700/50 rounded">
                                                            {Math.round(audioMetadata.bitrate / 1000)} kbps
                                                        </span>
                                                    )}
                                                    {audioMetadata?.sampleRate && (
                                                        <span className="px-2 py-1 bg-slate-700/50 rounded">
                                                            {(audioMetadata.sampleRate / 1000).toFixed(1)} kHz
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Show topic info if no metadata available */}
                                                {!audioMetadata?.title && !audioMetadata?.artist && topicSheetMusic && (
                                                    <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                        <p className="text-xs text-blue-300 mb-1">Obra sugerida para este tema:</p>
                                                        <p className="text-sm text-white font-medium">{topicSheetMusic.title}</p>
                                                        <p className="text-xs text-slate-400">{topicSheetMusic.composer} — {topicSheetMusic.description}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sheet Music Section */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                                <div className="flex items-center gap-2">
                                    <FileMusic size={18} className="text-purple-400" />
                                    <span className="font-medium text-white">Partitura</span>
                                    {scoreFileName && (
                                        <span className="text-xs text-slate-400 ml-2">
                                            ({scoreFileName})
                                        </span>
                                    )}
                                    {selectedCorpusWork && (
                                        <span className="text-xs text-emerald-400 ml-1">
                                            • Corpus
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowCorpusExplorer(!showCorpusExplorer)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            showCorpusExplorer 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-600/30'
                                        }`}
                                    >
                                        <Library size={16} />
                                        <span>Corpus Music21</span>
                                    </button>
                                    <label className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg cursor-pointer transition-colors text-sm text-white">
                                        <Upload size={16} />
                                        <span>Subir</span>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept=".musicxml,.xml,.mxl"
                                            onChange={handleScoreUpload} 
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Corpus Explorer (collapsible) */}
                            {showCorpusExplorer && (
                                <div className="p-4 border-b border-slate-700 bg-slate-900/30">
                                    <CorpusExplorer 
                                        topicId={topicId}
                                        onSelectWork={handleCorpusWorkSelect}
                                        onAnalysisComplete={handleCorpusAnalysis}
                                    />
                                </div>
                            )}

                            {/* Corpus Analysis Display */}
                            {corpusAnalysis && !showCorpusExplorer && (
                                <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/30 flex items-center gap-4 text-sm">
                                    <span className="text-purple-300 font-medium">Análisis:</span>
                                    <span className="text-white">Tonalidad: {corpusAnalysis.key}</span>
                                    <span className="text-slate-400">|</span>
                                    <span className="text-white">Compás: {corpusAnalysis.time_signature}</span>
                                    <span className="text-slate-400">|</span>
                                    <span className="text-white">{corpusAnalysis.measure_count} compases</span>
                                </div>
                            )}

                            {/* Score Viewer */}
                            {(uploadedScoreContent || uploadedScoreUrl || topicSheetMusic) ? (
                                <AnnotatedScoreViewer
                                    ref={scoreViewerRef}
                                    musicXmlUrl={uploadedScoreUrl || topicSheetMusic?.url}
                                    musicXmlContent={uploadedScoreContent || undefined}
                                    title={scoreFileName || topicSheetMusic?.title || 'Partitura'}
                                    currentTime={currentTime}
                                    duration={duration}
                                    isPlaying={isPlaying}
                                />
                            ) : (
                                <div className="p-8 text-center">
                                    <FileMusic size={40} className="mx-auto mb-3 text-slate-600" />
                                    <p className="text-slate-400 text-sm">No hay partitura cargada</p>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Usa el <strong>Corpus Music21</strong> para buscar entre 2000+ obras o sube tu propio archivo
                                    </p>
                                </div>
                            )}
                        </div>

                {/* Analysis Toolbar - Now Categorized */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Herramientas de Análisis
                            {topicId && (
                                <span className="text-xs text-slate-400 font-normal ml-2">
                                    (filtrado para: {topicId})
                                </span>
                            )}
                        </h2>
                        <div className="max-h-[400px] overflow-y-auto pr-2">
                            {renderCategorizedButtons()}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Lista de Secciones</h2>
                            <button
                                onClick={clearAllRegions}
                                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                title="Limpiar todo"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-xl max-h-[300px] overflow-y-auto divide-y divide-slate-700">
                            {activeRegions.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 italic">
                                    No hay secciones marcadas aún.
                                </div>
                            ) : (
                                activeRegions.sort((a, b) => a.start - b.start).map((reg) => (
                                    <div key={reg.id} className="p-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: reg.color }}></div>
                                            <div>
                                                <div className="text-sm font-medium">{reg.label}</div>
                                                <div className="text-xs text-slate-500 font-mono">
                                                    {formatTime(reg.start)} - {formatTime(reg.end)}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const target = regions.current.getRegions().find((r: any) => r.id === reg.id);
                                                target?.remove();
                                            }}
                                            className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AnalysisStudio;
