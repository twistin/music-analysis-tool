import React, { useEffect, useRef, useState, useCallback } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { ZoomIn, ZoomOut, RotateCcw, Loader2, AlertCircle, FileMusic } from 'lucide-react';

interface SheetMusicViewerProps {
    musicXmlUrl?: string;
    musicXmlContent?: string;
    title?: string;
}

const SheetMusicViewer: React.FC<SheetMusicViewerProps> = ({ 
    musicXmlUrl, 
    musicXmlContent,
    title 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const osmdRef = useRef<OSMD | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1.0);
    const [isLoaded, setIsLoaded] = useState(false); // Track if music is loaded

    // Initialize OSMD only once
    useEffect(() => {
        if (!containerRef.current) return;

        try {
            const osmd = new OSMD(containerRef.current, {
                autoResize: false, // Disable auto resize to avoid issues
                backend: 'svg',
                drawTitle: true,
                drawSubtitle: true,
                drawComposer: true,
                drawCredits: false,
                drawPartNames: true,
                drawingParameters: 'default'
            });

            osmdRef.current = osmd;
        } catch (err) {
            console.error('Error initializing OSMD:', err);
            setError('Error al inicializar el visor de partituras.');
        }

        return () => {
            // Cleanup
            osmdRef.current = null;
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    // Load and render music when URL or content changes
    useEffect(() => {
        if (!osmdRef.current) return;
        if (!musicXmlUrl && !musicXmlContent) return;

        let isCancelled = false;

        const loadAndRender = async () => {
            setIsLoading(true);
            setError(null);
            setIsLoaded(false);

            try {
                const osmd = osmdRef.current;
                if (!osmd || isCancelled) return;

                // Load the music
                if (musicXmlContent) {
                    await osmd.load(musicXmlContent);
                } else if (musicXmlUrl) {
                    await osmd.load(musicXmlUrl);
                }

                if (isCancelled) return;

                // Set zoom and render
                osmd.zoom = zoom;
                osmd.render();
                
                setIsLoaded(true);
            } catch (err) {
                if (!isCancelled) {
                    console.error('Error loading MusicXML:', err);
                    setError('Error al cargar la partitura. Verifica que el archivo sea MusicXML válido.');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadAndRender();

        return () => {
            isCancelled = true;
        };
    }, [musicXmlUrl, musicXmlContent]); // Zoom is not a dep here - handled separately

    // Handle zoom changes ONLY after music is loaded
    const handleZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
        
        if (osmdRef.current && isLoaded) {
            try {
                osmdRef.current.zoom = newZoom;
                osmdRef.current.render();
            } catch (err) {
                console.error('Error applying zoom:', err);
            }
        }
    }, [isLoaded]);

    const handleZoomIn = () => {
        handleZoomChange(Math.min(zoom + 0.2, 2.5));
    };

    const handleZoomOut = () => {
        handleZoomChange(Math.max(zoom - 0.2, 0.4));
    };

    const handleResetZoom = () => {
        handleZoomChange(1.0);
    };

    const hasContent = musicXmlUrl || musicXmlContent;

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <FileMusic size={20} className="text-purple-400" />
                    <span className="font-medium text-white">
                        {title || 'Partitura'}
                    </span>
                </div>
                
                {hasContent && isLoaded && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Alejar"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <span className="text-xs text-slate-400 px-2 min-w-[50px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Acercar"
                        >
                            <ZoomIn size={18} />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white ml-1"
                            title="Restablecer zoom"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="relative min-h-[300px] bg-white">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <div className="flex flex-col items-center gap-2 text-slate-600">
                            <Loader2 size={32} className="animate-spin" />
                            <span className="text-sm">Cargando partitura...</span>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
                        <div className="flex flex-col items-center gap-2 text-red-600 p-4 text-center">
                            <AlertCircle size={32} />
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!hasContent && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        <div className="flex flex-col items-center gap-3 text-center p-8">
                            <FileMusic size={48} className="text-slate-300" />
                            <p className="text-slate-500">No hay partitura cargada</p>
                            <p className="text-xs text-slate-400">
                                Se mostrará automáticamente cuando haya una partitura disponible para este tema
                            </p>
                        </div>
                    </div>
                )}

                {/* OSMD Container */}
                <div 
                    ref={containerRef} 
                    className="p-4 overflow-auto max-h-[600px]"
                    style={{ display: hasContent ? 'block' : 'none' }}
                />
            </div>
        </div>
    );
};

export default SheetMusicViewer;
