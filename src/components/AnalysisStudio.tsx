import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Play, Pause, Download, Trash2, Info, ArrowLeft, Music, FileAudio } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ANALYSIS_SECTIONS } from '../../constants';
import { MusicalSection } from '../../types';

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
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

    return (
        <div className="flex flex-col h-full space-y-6">
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

            {/* Main Analysis View */}
            <main className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">

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

                {/* Analysis Toolbar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Herramientas de Análisis
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Object.entries(ANALYSIS_SECTIONS).map(([key, section]) => (
                                <button
                                    key={key}
                                    onClick={() => addAnalysisRegion(key)}
                                    className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm ${section.tailwind}`}
                                >
                                    {section.label}
                                </button>
                            ))}
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
            </main>
        </div>
    );
};

export default AnalysisStudio;
