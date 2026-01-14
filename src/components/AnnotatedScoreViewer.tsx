import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { OpenSheetMusicDisplay as OSMD, Cursor } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import { 
    ZoomIn, ZoomOut, RotateCcw, Loader2, AlertCircle, FileMusic, 
    Play, Pause, SkipBack, SkipForward, Pencil, Eraser, Trash2, 
    Download, Palette, MousePointer, Undo, Save, Upload, Volume2, VolumeX, Square
} from 'lucide-react';

// Types for annotations
interface Point {
    x: number;
    y: number;
}

interface Stroke {
    points: Point[];
    color: string;
    width: number;
}

interface AnnotatedScoreViewerProps {
    musicXmlUrl?: string;
    musicXmlContent?: string;
    title?: string;
    // Audio sync props
    currentTime?: number;
    duration?: number;
    isPlaying?: boolean;
    onTimeUpdate?: (time: number) => void;
}

export interface AnnotatedScoreViewerRef {
    goToMeasure: (measureNumber: number) => void;
    getCurrentMeasure: () => number;
    syncToTime: (timeInSeconds: number) => void;
    play: () => void;
    pause: () => void;
    stop: () => void;
}

const COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#000000', // black
];

const STROKE_WIDTHS = [2, 4, 6, 8];

const AnnotatedScoreViewer = forwardRef<AnnotatedScoreViewerRef, AnnotatedScoreViewerProps>(({ 
    musicXmlUrl, 
    musicXmlContent,
    title,
    currentTime = 0,
    duration = 0,
    isPlaying = false,
    onTimeUpdate
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const osmdRef = useRef<OSMD | null>(null);
    const cursorRef = useRef<Cursor | null>(null);
    const audioPlayerRef = useRef<AudioPlayer | null>(null);
    
    // OSMD state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1.0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [totalMeasures, setTotalMeasures] = useState(0);
    const [currentMeasure, setCurrentMeasure] = useState(1);
    
    // Audio playback state
    const [isPlayingScore, setIsPlayingScore] = useState(false);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    
    // Annotation state
    const [isAnnotating, setIsAnnotating] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState<'pencil' | 'eraser' | 'pointer'>('pointer');
    const [currentColor, setCurrentColor] = useState('#ef4444');
    const [strokeWidth, setStrokeWidth] = useState(4);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [history, setHistory] = useState<Stroke[][]>([]);
    
    // Cursor/playback state
    const [cursorEnabled, setCursorEnabled] = useState(false);
    const [measureTimestamps, setMeasureTimestamps] = useState<number[]>([]);
    const [cursorPosition, setCursorPosition] = useState(0); // Percentage position 0-100
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Audio player control functions
    const playScore = useCallback(async () => {
        if (audioPlayerRef.current && isAudioReady) {
            try {
                await audioPlayerRef.current.play();
                setIsPlayingScore(true);
                console.log('▶️ Playing score');
            } catch (err) {
                console.error('Error playing:', err);
            }
        }
    }, [isAudioReady]);

    const pauseScore = useCallback(() => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            setIsPlayingScore(false);
            console.log('⏸️ Paused');
        }
    }, []);

    const stopScore = useCallback(() => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.stop();
            setIsPlayingScore(false);
            if (cursorRef.current) {
                cursorRef.current.reset();
                setCurrentMeasure(1);
            }
            console.log('⏹️ Stopped');
        }
    }, []);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        goToMeasure: (measureNumber: number) => {
            if (cursorRef.current && measureNumber > 0 && measureNumber <= totalMeasures) {
                cursorRef.current.reset();
                for (let i = 1; i < measureNumber; i++) {
                    cursorRef.current.next();
                }
                setCurrentMeasure(measureNumber);
            }
        },
        getCurrentMeasure: () => currentMeasure,
        syncToTime: (timeInSeconds: number) => {
            if (measureTimestamps.length > 0 && cursorRef.current) {
                const measureIndex = measureTimestamps.findIndex(t => t > timeInSeconds);
                const targetMeasure = measureIndex > 0 ? measureIndex : measureTimestamps.length;
                if (targetMeasure !== currentMeasure) {
                    cursorRef.current.reset();
                    for (let i = 1; i < targetMeasure; i++) {
                        cursorRef.current.next();
                    }
                    setCurrentMeasure(targetMeasure);
                }
            }
        },
        play: playScore,
        pause: pauseScore,
        stop: stopScore
    }), [currentMeasure, totalMeasures, measureTimestamps, playScore, pauseScore, stopScore]);

    // Initialize OSMD
    useEffect(() => {
        if (!containerRef.current) return;

        try {
            const osmd = new OSMD(containerRef.current, {
                autoResize: false,
                backend: 'svg',
                drawTitle: true,
                drawSubtitle: true,
                drawComposer: true,
                drawCredits: false,
                drawPartNames: true,
                drawingParameters: 'default',
                followCursor: true,
                // Enhanced cursor visibility - Block/Note Highlighter mode
                cursorsOptions: [{
                    type: 1, // 0 = Standard (Line), 1 = Block (Rectangle/Highlighter), 2 = Thin Line
                    color: '#22c55e', // Green
                    alpha: 0.4, // Semi-transparent to behave like a highlighter
                    follow: true
                }]
            });

            osmdRef.current = osmd;
        } catch (err) {
            console.error('Error initializing OSMD:', err);
            setError('Error al inicializar el visor de partituras.');
        }

        return () => {
            osmdRef.current = null;
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    // Load and render music
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

                if (musicXmlContent) {
                    await osmd.load(musicXmlContent);
                } else if (musicXmlUrl) {
                    await osmd.load(musicXmlUrl);
                }

                if (isCancelled) return;

                osmd.zoom = zoom;
                osmd.render();
                
                // Setup cursor - ensure it's properly initialized
                try {
                    if (osmd.cursor) {
                        cursorRef.current = osmd.cursor;
                        osmd.cursor.show();
                        osmd.cursor.reset();
                        console.log('✅ OSMD Cursor initialized successfully');
                    } else {
                        console.warn('⚠️ OSMD cursor not available');
                    }
                } catch (cursorError) {
                    console.error('❌ Error initializing cursor:', cursorError);
                }

                // Get total measures
                if (osmd.Sheet && osmd.Sheet.SourceMeasures) {
                    const measureCount = osmd.Sheet.SourceMeasures.length;
                    setTotalMeasures(measureCount);
                    console.log(`📊 Total measures: ${measureCount}`);
                    
                    // Calculate approximate measure timestamps based on tempo
                    const measures = osmd.Sheet.SourceMeasures;
                    const timestamps: number[] = [];
                    let accumulatedTime = 0;
                    
                    for (let i = 0; i < measures.length; i++) {
                        timestamps.push(accumulatedTime);
                        accumulatedTime += 2;
                    }
                    setMeasureTimestamps(timestamps);
                }
                
                // Initialize audio player for score playback
                try {
                    const audioPlayer = new AudioPlayer();
                    // Use type assertion to handle version mismatch
                    await audioPlayer.loadScore(osmd as any);
                    audioPlayerRef.current = audioPlayer;
                    
                    // Enable cursor following during playback
                    // The audio player controls the cursor automatically
                    if (osmd.cursor) {
                        osmd.cursor.show();
                    }
                    
                    setIsAudioReady(true);
                    console.log('🎵 Audio player initialized with cursor following');
                    
                    // Update measure counter during playback
                    (audioPlayer as any).on('iteration', (notes: any[]) => {
                        // Manually move the cursor because osmd-audio-player fails to do so due to version mismatch
                        if (osmd.cursor) {
                            osmd.cursor.next();
                            
                            // FORCE show on every tick to prevent hiding
                            osmd.cursor.show();

                            // Update UI counters
                            try {
                                const cursorIterator = osmd.cursor.Iterator;
                                if (cursorIterator && cursorIterator.CurrentMeasureIndex !== undefined) {
                                    const measureIdx = cursorIterator.CurrentMeasureIndex + 1;
                                    setCurrentMeasure(measureIdx);
                                }
                            } catch {
                                // Fallback
                            }
                        }
                    });
                    
                    (audioPlayer as any).on('ended', () => {
                        setIsPlayingScore(false);
                        setCursorPosition(0);
                        if (osmd.cursor) {
                            osmd.cursor.reset();
                            osmd.cursor.show();
                        }
                        setCurrentMeasure(1);
                        console.log('🏁 Playback ended');
                    });
                } catch (audioErr) {
                    console.warn('⚠️ Could not initialize audio player:', audioErr);
                    // Continue without audio - score viewing still works
                }
                
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
    }, [musicXmlUrl, musicXmlContent]);

    // Sync cursor with audio playback
    useEffect(() => {
        if (!cursorEnabled || !isPlaying || measureTimestamps.length === 0) return;
        
        const measureIndex = measureTimestamps.findIndex(t => t > currentTime);
        const targetMeasure = measureIndex > 0 ? measureIndex : measureTimestamps.length;
        
        if (targetMeasure !== currentMeasure && cursorRef.current) {
            cursorRef.current.reset();
            for (let i = 1; i < targetMeasure; i++) {
                cursorRef.current.next();
            }
            setCurrentMeasure(targetMeasure);
        }
    }, [currentTime, cursorEnabled, isPlaying, measureTimestamps, currentMeasure]);

    // Setup canvas for annotations
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current || !isLoaded) return;
        
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;
            
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = container.scrollHeight;
            
            // Redraw strokes after resize
            redrawStrokes();
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [isLoaded, strokes]);

    // Redraw all strokes on canvas
    const redrawStrokes = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            
            ctx.beginPath();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            stroke.points.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        });
    }, [strokes]);

    useEffect(() => {
        redrawStrokes();
    }, [strokes, redrawStrokes]);

    // Drawing handlers
    const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const scrollTop = containerRef.current?.scrollTop || 0;
        
        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top + scrollTop
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top + scrollTop
        };
    };

    const handleDrawStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isAnnotating || currentTool === 'pointer') return;
        
        setIsDrawing(true);
        const point = getCanvasCoordinates(e);
        setCurrentStroke([point]);
    };

    const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !isAnnotating) return;
        
        const point = getCanvasCoordinates(e);
        setCurrentStroke(prev => [...prev, point]);
        
        // Draw current stroke in real-time
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || currentStroke.length < 1) return;
        
        ctx.beginPath();
        ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
        ctx.lineWidth = currentTool === 'eraser' ? strokeWidth * 3 : strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const lastPoint = currentStroke[currentStroke.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    };

    const handleDrawEnd = () => {
        if (!isDrawing) return;
        
        setIsDrawing(false);
        
        if (currentStroke.length > 1) {
            // Save to history for undo
            setHistory(prev => [...prev, strokes]);
            
            const newStroke: Stroke = {
                points: currentStroke,
                color: currentTool === 'eraser' ? '#ffffff' : currentColor,
                width: currentTool === 'eraser' ? strokeWidth * 3 : strokeWidth
            };
            
            setStrokes(prev => [...prev, newStroke]);
        }
        
        setCurrentStroke([]);
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const previousState = history[history.length - 1];
            setStrokes(previousState);
            setHistory(prev => prev.slice(0, -1));
        }
    };

    const handleClearAll = () => {
        if (strokes.length > 0 && window.confirm('¿Borrar todas las anotaciones?')) {
            setHistory(prev => [...prev, strokes]);
            setStrokes([]);
        }
    };

    const handleExportAnnotations = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Create a temporary canvas with white background
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
        
        // Download
        const link = document.createElement('a');
        link.download = `anotaciones-${title || 'partitura'}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    };

    // Zoom handlers
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

    const handleZoomIn = () => handleZoomChange(Math.min(zoom + 0.2, 2.5));
    const handleZoomOut = () => handleZoomChange(Math.max(zoom - 0.2, 0.4));
    const handleResetZoom = () => handleZoomChange(1.0);

    // Cursor navigation
    const handleNextMeasure = () => {
        console.log(`➡️ Next: cursor=${!!cursorRef.current}, current=${currentMeasure}, total=${totalMeasures}`);
        if (cursorRef.current && currentMeasure < totalMeasures) {
            cursorRef.current.next();
            setCurrentMeasure(prev => prev + 1);
            console.log('✅ Moved to next measure');
        } else {
            console.warn('❌ Cannot move next:', { hasCursor: !!cursorRef.current, currentMeasure, totalMeasures });
        }
    };

    const handlePrevMeasure = () => {
        console.log(`⬅️ Prev: cursor=${!!cursorRef.current}, current=${currentMeasure}`);
        if (cursorRef.current && currentMeasure > 1) {
            cursorRef.current.reset();
            for (let i = 1; i < currentMeasure - 1; i++) {
                cursorRef.current.next();
            }
            setCurrentMeasure(prev => prev - 1);
            console.log('✅ Moved to previous measure');
        } else {
            console.warn('❌ Cannot move prev:', { hasCursor: !!cursorRef.current, currentMeasure });
        }
    };

    const handleResetCursor = () => {
        console.log(`🔄 Reset: cursor=${!!cursorRef.current}`);
        if (cursorRef.current) {
            cursorRef.current.reset();
            setCurrentMeasure(1);
            console.log('✅ Cursor reset');
        } else {
            console.warn('❌ No cursor to reset');
        }
    };

    const hasContent = musicXmlUrl || musicXmlContent;

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header - Zoom & Navigation Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <FileMusic size={20} className="text-purple-400" />
                    <span className="font-medium text-white">
                        {title || 'Partitura'}
                    </span>
                    {isLoaded && (
                        <span className="text-xs text-slate-400 ml-2">
                            Compás {currentMeasure} / {totalMeasures}
                        </span>
                    )}
                </div>
                
                {hasContent && isLoaded && (
                    <div className="flex items-center gap-3">
                        {/* Playback Controls */}
                        <div className="flex items-center gap-1 border-r border-slate-600 pr-3">
                            {/* Stop */}
                            <button
                                onClick={stopScore}
                                disabled={!isAudioReady}
                                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Detener"
                            >
                                <Square size={14} />
                            </button>
                            
                            {/* Play/Pause */}
                            <button
                                onClick={isPlayingScore ? pauseScore : playScore}
                                disabled={!isAudioReady}
                                className={`p-1.5 rounded transition-colors ${
                                    isPlayingScore 
                                        ? 'bg-green-500 text-white hover:bg-green-600' 
                                        : 'hover:bg-slate-700 text-slate-400 hover:text-white'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                                title={isPlayingScore ? "Pausar" : "Reproducir"}
                            >
                                {isPlayingScore ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            
                            {/* Volume */}
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                disabled={!isAudioReady}
                                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white disabled:opacity-30"
                                title={isMuted ? "Activar sonido" : "Silenciar"}
                            >
                                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                            </button>
                            
                            {!isAudioReady && isLoaded && (
                                <span className="text-xs text-amber-400 ml-1">Cargando audio...</span>
                            )}
                        </div>

                        {/* Cursor Navigation */}
                        <div className="flex items-center gap-1 border-r border-slate-600 pr-3">
                            <button
                                onClick={handleResetCursor}
                                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                                title="Ir al inicio"
                            >
                                <SkipBack size={16} />
                            </button>
                            <button
                                onClick={handlePrevMeasure}
                                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                                title="Compás anterior"
                            >
                                <SkipBack size={14} />
                            </button>
                            <button
                                onClick={handleNextMeasure}
                                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                                title="Compás siguiente"
                            >
                                <SkipForward size={14} />
                            </button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleZoomOut}
                                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                                title="Alejar"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <span className="text-xs text-slate-400 px-1 min-w-[40px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                                title="Acercar"
                            >
                                <ZoomIn size={16} />
                            </button>
                            <button
                                onClick={handleResetZoom}
                                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                                title="Restablecer zoom"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Annotation Toolbar */}
            {hasContent && isLoaded && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        {/* Toggle Annotation Mode */}
                        <button
                            onClick={() => setIsAnnotating(!isAnnotating)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                isAnnotating 
                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            <Pencil size={16} />
                            {isAnnotating ? 'Anotando' : 'Anotar'}
                        </button>

                        {isAnnotating && (
                            <>
                                {/* Tool Selection */}
                                <div className="flex items-center gap-1 ml-2 border-l border-slate-600 pl-2">
                                    <button
                                        onClick={() => setCurrentTool('pointer')}
                                        className={`p-2 rounded ${currentTool === 'pointer' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                        title="Seleccionar"
                                    >
                                        <MousePointer size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentTool('pencil')}
                                        className={`p-2 rounded ${currentTool === 'pencil' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                        title="Lápiz"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentTool('eraser')}
                                        className={`p-2 rounded ${currentTool === 'eraser' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                        title="Borrador"
                                    >
                                        <Eraser size={16} />
                                    </button>
                                </div>

                                {/* Color Palette */}
                                <div className="flex items-center gap-1 ml-2 border-l border-slate-600 pl-2">
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setCurrentColor(color)}
                                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                                currentColor === color ? 'border-white scale-110' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            title={`Color: ${color}`}
                                        />
                                    ))}
                                </div>

                                {/* Stroke Width */}
                                <div className="flex items-center gap-1 ml-2 border-l border-slate-600 pl-2">
                                    {STROKE_WIDTHS.map(width => (
                                        <button
                                            key={width}
                                            onClick={() => setStrokeWidth(width)}
                                            className={`w-7 h-7 flex items-center justify-center rounded ${
                                                strokeWidth === width ? 'bg-slate-600' : 'hover:bg-slate-700'
                                            }`}
                                            title={`Grosor: ${width}px`}
                                        >
                                            <div 
                                                className="rounded-full bg-white"
                                                style={{ width: width + 2, height: width + 2 }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    {isAnnotating && strokes.length > 0 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleUndo}
                                disabled={history.length === 0}
                                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Deshacer"
                            >
                                <Undo size={16} />
                            </button>
                            <button
                                onClick={handleClearAll}
                                className="p-2 text-slate-400 hover:text-red-400"
                                title="Borrar todo"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={handleExportAnnotations}
                                className="p-2 text-slate-400 hover:text-green-400"
                                title="Exportar anotaciones"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="relative min-h-[400px] bg-white overflow-hidden">
                {/* Playback indicator overlay */}
                {isPlayingScore && (
                    <div className="absolute top-2 left-2 z-30 flex items-center gap-2 bg-green-500/90 text-white px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm font-medium">
                            ♪ Compás {currentMeasure} / {totalMeasures}
                        </span>
                    </div>
                )}

                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                        <div className="flex flex-col items-center gap-2 text-slate-600">
                            <Loader2 size={32} className="animate-spin" />
                            <span className="text-sm">Cargando partitura...</span>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-20">
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
                                Carga un archivo MusicXML o PDF para comenzar
                            </p>
                        </div>
                    </div>
                )}

                {/* Scrollable container for both OSMD and annotation canvas */}
                {/* Scrollable container for both OSMD and annotation canvas */}
                <div ref={scrollContainerRef} className="relative overflow-auto max-h-[600px]">
                    {/* OSMD Container */}
                    <div 
                        ref={containerRef} 
                        className="p-4"
                        style={{ display: hasContent ? 'block' : 'none' }}
                    />
                    
                    {/* Annotation Canvas Overlay */}
                    {isLoaded && (
                        <canvas
                            ref={canvasRef}
                            className={`absolute top-0 left-0 w-full ${
                                isAnnotating && currentTool !== 'pointer' 
                                    ? 'cursor-crosshair z-10' 
                                    : 'pointer-events-none z-0'
                            }`}
                            style={{ 
                                touchAction: 'none',
                                opacity: isAnnotating ? 1 : 0.7
                            }}
                            onMouseDown={handleDrawStart}
                            onMouseMove={handleDrawMove}
                            onMouseUp={handleDrawEnd}
                            onMouseLeave={handleDrawEnd}
                            onTouchStart={handleDrawStart}
                            onTouchMove={handleDrawMove}
                            onTouchEnd={handleDrawEnd}
                        />
                    )}
                </div>
            </div>

            {/* Help text */}
            {isAnnotating && (
                <div className="px-4 py-2 bg-purple-500/10 border-t border-purple-500/30">
                    <p className="text-xs text-purple-300">
                        💡 Usa el lápiz para dibujar sobre la partitura. Tus anotaciones se pueden exportar como imagen.
                    </p>
                </div>
            )}
        </div>
    );
});

AnnotatedScoreViewer.displayName = 'AnnotatedScoreViewer';

export default AnnotatedScoreViewer;
