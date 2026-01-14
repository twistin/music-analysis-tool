import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface PianoKeyboardProps {
    startOctave?: number;
    numOctaves?: number;
    showLabels?: boolean;
    onNotePlay?: (note: string) => void;
    highlightedNotes?: string[];
}

// Note definitions
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS: Record<string, string> = {
    'C': 'C#',
    'D': 'D#',
    'F': 'F#',
    'G': 'G#',
    'A': 'A#'
};

// Keyboard shortcuts for one octave
const KEY_BINDINGS: Record<string, string> = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
    'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
    'u': 'A#4', 'j': 'B4', 'k': 'C5'
};

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
    startOctave = 3,
    numOctaves = 2,
    showLabels = true,
    onNotePlay,
    highlightedNotes = []
}) => {
    const synthRef = useRef<Tone.PolySynth | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

    // Initialize synth
    useEffect(() => {
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: 0.02,
                decay: 0.1,
                sustain: 0.3,
                release: 0.8
            }
        }).toDestination();

        synth.volume.value = -6; // Reduce volume
        synthRef.current = synth;

        return () => {
            synth.dispose();
        };
    }, []);

    // Start audio context on user interaction
    const startAudio = async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        setIsReady(true);
    };

    // Play a note
    const playNote = useCallback((note: string) => {
        if (!synthRef.current || !isReady || isMuted) return;
        
        synthRef.current.triggerAttackRelease(note, '8n');
        setActiveNotes(prev => new Set(prev).add(note));
        
        onNotePlay?.(note);
        
        // Remove from active notes after a short delay
        setTimeout(() => {
            setActiveNotes(prev => {
                const next = new Set(prev);
                next.delete(note);
                return next;
            });
        }, 200);
    }, [isReady, isMuted, onNotePlay]);

    // Keyboard event handlers
    useEffect(() => {
        if (!isReady) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const note = KEY_BINDINGS[e.key.toLowerCase()];
            if (note && !e.repeat) {
                playNote(note);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReady, playNote]);

    // Generate octave keys
    const renderOctave = (octave: number) => {
        return WHITE_KEYS.map((note, index) => {
            const fullNote = `${note}${octave}`;
            const blackNote = BLACK_KEYS[note] ? `${BLACK_KEYS[note]}${octave}` : null;
            const isHighlighted = highlightedNotes.includes(fullNote);
            const isBlackHighlighted = blackNote && highlightedNotes.includes(blackNote);
            const isActive = activeNotes.has(fullNote);
            const isBlackActive = blackNote && activeNotes.has(blackNote);

            return (
                <div key={fullNote} className="relative">
                    {/* White key */}
                    <button
                        onClick={() => playNote(fullNote)}
                        className={`
                            w-12 h-40 border border-slate-300 rounded-b-lg
                            transition-all duration-75
                            ${isActive 
                                ? 'bg-blue-300 transform scale-[0.98]' 
                                : isHighlighted 
                                    ? 'bg-emerald-200 hover:bg-emerald-300' 
                                    : 'bg-white hover:bg-slate-100'}
                            ${showLabels ? 'pb-2' : ''}
                            active:bg-blue-300 active:transform active:scale-[0.98]
                        `}
                    >
                        {showLabels && (
                            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-medium">
                                {note}
                            </span>
                        )}
                    </button>

                    {/* Black key */}
                    {blackNote && (
                        <button
                            onClick={() => playNote(blackNote)}
                            className={`
                                absolute -right-3 top-0 z-10
                                w-7 h-24 rounded-b-lg
                                transition-all duration-75
                                ${isBlackActive
                                    ? 'bg-blue-600 transform scale-[0.98]'
                                    : isBlackHighlighted
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-slate-900 hover:bg-slate-700'}
                                active:bg-blue-600 active:transform active:scale-[0.98]
                            `}
                        />
                    )}
                </div>
            );
        });
    };

    // Render all octaves
    const renderKeyboard = () => {
        const octaves = [];
        for (let i = 0; i < numOctaves; i++) {
            octaves.push(
                <div key={startOctave + i} className="flex">
                    {renderOctave(startOctave + i)}
                </div>
            );
        }
        return octaves;
    };

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <Music size={20} className="text-blue-400" />
                    <span className="font-medium text-white">Piano Virtual</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 rounded-lg transition-colors ${
                            isMuted 
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                        title={isMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                </div>
            </div>

            {/* Piano */}
            <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900">
                {!isReady ? (
                    <button
                        onClick={startAudio}
                        className="w-full py-8 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex flex-col items-center gap-2"
                    >
                        <Volume2 size={32} />
                        <span>Haz clic para activar el audio</span>
                        <span className="text-xs text-blue-200">Se requiere interacción del usuario para iniciar el sonido</span>
                    </button>
                ) : (
                    <>
                        <div className="flex justify-center overflow-x-auto pb-4">
                            {renderKeyboard()}
                        </div>
                        
                        {/* Keyboard hint */}
                        <div className="mt-4 text-center text-xs text-slate-500">
                            Usa las teclas <span className="font-mono bg-slate-700 px-1 rounded">A S D F G H J K</span> para tocar 
                            y <span className="font-mono bg-slate-700 px-1 rounded">W E T Y U</span> para bemoles/sostenidos
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PianoKeyboard;
