import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { Play, RotateCcw, CheckCircle, XCircle, HelpCircle, Headphones, Volume2 } from 'lucide-react';

// Types of cadences for exercises
interface CadenceExercise {
    id: string;
    name: string;
    nameEs: string;
    chords: string[][];  // Array of chords (each chord is array of notes)
    description: string;
}

const CADENCES: CadenceExercise[] = [
    {
        id: 'perfect',
        name: 'Perfect (V-I)',
        nameEs: 'Perfecta (V-I)',
        chords: [
            ['G3', 'B3', 'D4', 'G4'],  // V (G major)
            ['C3', 'E3', 'G3', 'C4']   // I (C major)
        ],
        description: 'La cadencia más conclusiva. Dominante → Tónica.'
    },
    {
        id: 'plagal',
        name: 'Plagal (IV-I)',
        nameEs: 'Plagal (IV-I)',
        chords: [
            ['F3', 'A3', 'C4', 'F4'],  // IV (F major)
            ['C3', 'E3', 'G3', 'C4']   // I (C major)
        ],
        description: 'La "cadencia de Amén". Subdominante → Tónica.'
    },
    {
        id: 'deceptive',
        name: 'Deceptive (V-vi)',
        nameEs: 'Rota (V-VI)',
        chords: [
            ['G3', 'B3', 'D4', 'G4'],  // V (G major)
            ['A3', 'C4', 'E4', 'A4']   // vi (A minor)
        ],
        description: 'Engaña al oído. Dominante → VI grado (relativo menor).'
    },
    {
        id: 'half',
        name: 'Half Cadence (...-V)',
        nameEs: 'Semicadencia (...-V)',
        chords: [
            ['C3', 'E3', 'G3', 'C4'],  // I (C major)
            ['G3', 'B3', 'D4', 'G4']   // V (G major)
        ],
        description: 'Cadencia suspensiva. Termina en la dominante.'
    }
];

type ExerciseState = 'ready' | 'playing' | 'answered' | 'reviewing';

const EarTraining: React.FC = () => {
    const synthRef = useRef<Tone.PolySynth | null>(null);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [currentCadence, setCurrentCadence] = useState<CadenceExercise | null>(null);
    const [state, setState] = useState<ExerciseState>('ready');
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [showHint, setShowHint] = useState(false);

    // Initialize synth
    useEffect(() => {
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.05,
                decay: 0.2,
                sustain: 0.4,
                release: 1.2
            }
        }).toDestination();

        synth.volume.value = -8;
        synthRef.current = synth;

        return () => synth.dispose();
    }, []);

    // Start audio context
    const startAudio = async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        setIsAudioReady(true);
        newExercise();
    };

    // Generate new random exercise
    const newExercise = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * CADENCES.length);
        setCurrentCadence(CADENCES[randomIndex]);
        setState('ready');
        setSelectedAnswer(null);
        setShowHint(false);
    }, []);

    // Play the current cadence
    const playCadence = useCallback(async () => {
        if (!synthRef.current || !currentCadence) return;

        setState('playing');

        const now = Tone.now();
        
        // Play first chord
        synthRef.current.triggerAttackRelease(currentCadence.chords[0], '2n', now);
        
        // Play second chord after a beat
        synthRef.current.triggerAttackRelease(currentCadence.chords[1], '2n', now + 1);

        // Return to ready state after playback
        setTimeout(() => {
            if (state === 'playing') {
                setState('ready');
            }
        }, 2500);
    }, [currentCadence, state]);

    // Handle answer selection
    const handleAnswer = (cadenceId: string) => {
        if (state !== 'ready' || !currentCadence) return;

        setSelectedAnswer(cadenceId);
        setState('answered');

        const isCorrect = cadenceId === currentCadence.id;
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));
    };

    // Review correct answer
    const reviewAnswer = () => {
        setState('reviewing');
        playCadence();
    };

    if (!isAudioReady) {
        return (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Headphones size={32} className="text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Entrenamiento Auditivo</h2>
                    <p className="text-slate-400 mb-6">Ejercicios de reconocimiento de cadencias</p>
                    
                    <button
                        onClick={startAudio}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                        <Volume2 size={20} />
                        Comenzar Ejercicios
                    </button>
                </div>
            </div>
        );
    }

    const isCorrect = selectedAnswer === currentCadence?.id;

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <Headphones size={20} className="text-purple-400" />
                    <span className="font-medium text-white">Identificar la Cadencia</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                        Puntuación: <span className="text-emerald-400 font-medium">{score.correct}</span>
                        <span className="text-slate-500">/{score.total}</span>
                    </span>
                    <button
                        onClick={newExercise}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
                        title="Nuevo ejercicio"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="p-6">
                {/* Play button */}
                <div className="text-center mb-8">
                    <button
                        onClick={playCadence}
                        disabled={state === 'playing'}
                        className={`px-8 py-4 rounded-xl font-medium transition-all flex items-center gap-3 mx-auto ${
                            state === 'playing'
                                ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'
                        }`}
                    >
                        <Play size={24} fill="currentColor" />
                        {state === 'playing' ? 'Reproduciendo...' : 'Escuchar Cadencia'}
                    </button>
                    
                    {!showHint && state === 'ready' && (
                        <button
                            onClick={() => setShowHint(true)}
                            className="mt-3 text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 mx-auto"
                        >
                            <HelpCircle size={14} />
                            Mostrar pista
                        </button>
                    )}
                    
                    {showHint && currentCadence && (
                        <p className="mt-3 text-sm text-amber-400/80 italic">
                            Pista: {currentCadence.description}
                        </p>
                    )}
                </div>

                {/* Answer options */}
                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                    {CADENCES.map(cadence => {
                        let buttonClass = 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500';
                        
                        if (state === 'answered' || state === 'reviewing') {
                            if (cadence.id === currentCadence?.id) {
                                buttonClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-100';
                            } else if (cadence.id === selectedAnswer) {
                                buttonClass = 'bg-red-500/20 border-red-500 text-red-100';
                            } else {
                                buttonClass = 'bg-slate-800 border-slate-700 opacity-50';
                            }
                        }

                        return (
                            <button
                                key={cadence.id}
                                onClick={() => handleAnswer(cadence.id)}
                                disabled={state !== 'ready'}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${buttonClass} ${
                                    state === 'ready' ? 'cursor-pointer' : 'cursor-default'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-white">{cadence.nameEs}</div>
                                        <div className="text-xs text-slate-400">{cadence.name}</div>
                                    </div>
                                    {(state === 'answered' || state === 'reviewing') && cadence.id === currentCadence?.id && (
                                        <CheckCircle size={20} className="text-emerald-400" />
                                    )}
                                    {(state === 'answered' || state === 'reviewing') && cadence.id === selectedAnswer && cadence.id !== currentCadence?.id && (
                                        <XCircle size={20} className="text-red-400" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Result feedback */}
                {state === 'answered' && currentCadence && (
                    <div className={`mt-6 p-4 rounded-lg text-center ${
                        isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                        <p className={`font-medium mb-2 ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                        </p>
                        <p className="text-sm text-slate-300 mb-3">
                            {currentCadence.description}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={reviewAnswer}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
                            >
                                <Play size={16} />
                                Escuchar de nuevo
                            </button>
                            <button
                                onClick={newExercise}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
                            >
                                Siguiente
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EarTraining;
