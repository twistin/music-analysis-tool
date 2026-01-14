import React, { useState } from 'react';
import { ArrowLeft, Piano, Headphones, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PianoKeyboard from './PianoKeyboard';
import EarTraining from './EarTraining';

type PracticeTab = 'piano' | 'eartraining';

const PracticeStudio: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<PracticeTab>('piano');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white flex flex-col gap-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Sala de Práctica</h1>
                        <p className="text-slate-400 text-sm">Piano virtual y entrenamiento auditivo</p>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-700 pb-0">
                <button
                    onClick={() => setActiveTab('piano')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'piano'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                >
                    <Music size={18} />
                    Piano Virtual
                </button>
                <button
                    onClick={() => setActiveTab('eartraining')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'eartraining'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                >
                    <Headphones size={18} />
                    Entrenamiento Auditivo
                </button>
            </div>

            {/* Content */}
            <main className="flex-1">
                {activeTab === 'piano' && (
                    <div className="space-y-6">
                        <PianoKeyboard 
                            startOctave={3} 
                            numOctaves={3} 
                            showLabels={true}
                        />
                        
                        {/* Instructions */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Music size={18} className="text-blue-400" />
                                Instrucciones
                            </h3>
                            <ul className="text-sm text-slate-300 space-y-2">
                                <li>• Haz clic en las teclas del piano para tocar notas</li>
                                <li>• Usa el teclado del ordenador: <span className="font-mono bg-slate-700 px-1 rounded">A S D F G H J K</span> para notas blancas</li>
                                <li>• Teclas <span className="font-mono bg-slate-700 px-1 rounded">W E T Y U</span> para notas negras (sostenidos)</li>
                                <li>• El piano responde a la 4ª octava del teclado</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'eartraining' && (
                    <div className="space-y-6">
                        <EarTraining />
                        
                        {/* Theory reminder */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Headphones size={18} className="text-purple-400" />
                                Recordatorio de Cadencias
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-slate-900/50 p-3 rounded-lg">
                                    <span className="font-medium text-emerald-300">Perfecta (V-I)</span>
                                    <p className="text-slate-400 text-xs mt-1">Conclusiva, definitiva. "Final feliz".</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg">
                                    <span className="font-medium text-blue-300">Plagal (IV-I)</span>
                                    <p className="text-slate-400 text-xs mt-1">Suave, religiosa. "Amén".</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg">
                                    <span className="font-medium text-amber-300">Rota (V-VI)</span>
                                    <p className="text-slate-400 text-xs mt-1">Sorpresa, engaño. Evita la tónica.</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg">
                                    <span className="font-medium text-purple-300">Semicadencia (...-V)</span>
                                    <p className="text-slate-400 text-xs mt-1">Suspensiva, pregunta. Termina en V.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PracticeStudio;
