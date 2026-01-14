import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, HelpCircle, Award } from 'lucide-react';
import { Quiz as QuizType, QuizQuestion, getQuizForTopic, calculateScore } from '../data/quizzes';

interface QuizProps {
    topicId: string;
}

type QuizState = 'intro' | 'questions' | 'results';

const Quiz: React.FC<QuizProps> = ({ topicId }) => {
    const quiz = useMemo(() => getQuizForTopic(topicId), [topicId]);
    
    const [state, setState] = useState<QuizState>('intro');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showExplanation, setShowExplanation] = useState(false);
    const [results, setResults] = useState<ReturnType<typeof calculateScore> | null>(null);

    if (!quiz) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
                <HelpCircle size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No hay cuestionario disponible para este tema.</p>
                <p className="text-sm text-slate-500 mt-1">Se añadirán ejercicios próximamente.</p>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const totalQuestions = quiz.questions.length;
    const hasAnswered = question && answers[question.id] !== undefined;
    const isCorrect = hasAnswered && answers[question.id] === question.correctAnswer;

    const handleSelectAnswer = (answer: string) => {
        if (hasAnswered) return; // Can't change answer once selected
        
        setAnswers(prev => ({
            ...prev,
            [question.id]: answer
        }));
        setShowExplanation(true);
    };

    const handleNextQuestion = () => {
        setShowExplanation(false);
        
        if (currentQuestion < totalQuestions - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Quiz finished - calculate results
            const finalResults = calculateScore(answers, quiz);
            setResults(finalResults);
            setState('results');
        }
    };

    const handleRestart = () => {
        setState('intro');
        setCurrentQuestion(0);
        setAnswers({});
        setShowExplanation(false);
        setResults(null);
    };

    const handleStartQuiz = () => {
        setState('questions');
    };

    // ─────────────────────────────────────────────────────────
    // INTRO SCREEN
    // ─────────────────────────────────────────────────────────
    if (state === 'intro') {
        return (
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award size={32} className="text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{quiz.title}</h2>
                    <p className="text-slate-300 mb-6">{quiz.description}</p>
                    
                    <div className="flex justify-center gap-6 text-sm text-slate-400 mb-8">
                        <div className="flex items-center gap-2">
                            <HelpCircle size={16} />
                            <span>{totalQuestions} preguntas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy size={16} />
                            <span>Mínimo {quiz.passingScore}% para aprobar</span>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleStartQuiz}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        Comenzar Cuestionario
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────
    // RESULTS SCREEN
    // ─────────────────────────────────────────────────────────
    if (state === 'results' && results) {
        const passed = results.passed;
        
        return (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className={`p-8 text-center ${passed ? 'bg-gradient-to-br from-emerald-600/20 to-blue-600/20' : 'bg-gradient-to-br from-red-600/20 to-orange-600/20'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        {passed ? (
                            <Trophy size={40} className="text-emerald-400" />
                        ) : (
                            <XCircle size={40} className="text-red-400" />
                        )}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {passed ? '¡Felicidades!' : 'Sigue practicando'}
                    </h2>
                    <p className="text-slate-300 mb-6">
                        {passed 
                            ? 'Has demostrado un buen dominio del tema.' 
                            : 'Repasa el contenido teórico e inténtalo de nuevo.'}
                    </p>
                    
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                {results.percentage}%
                            </div>
                            <div className="text-sm text-slate-400">Puntuación</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white">
                                {results.score}/{results.total}
                            </div>
                            <div className="text-sm text-slate-400">Puntos</div>
                        </div>
                    </div>

                    {/* Results breakdown */}
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Detalle de Respuestas</h3>
                        <div className="space-y-2">
                            {results.results.map((r, idx) => (
                                <div key={r.questionId} className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Pregunta {idx + 1}</span>
                                    <div className="flex items-center gap-2">
                                        {r.correct ? (
                                            <CheckCircle size={16} className="text-emerald-400" />
                                        ) : (
                                            <XCircle size={16} className="text-red-400" />
                                        )}
                                        <span className={`text-sm ${r.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {r.points} pts
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleRestart}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                        <RotateCcw size={18} />
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────
    // QUESTIONS SCREEN
    // ─────────────────────────────────────────────────────────
    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-slate-700">
                <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                />
            </div>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                    Pregunta {currentQuestion + 1} de {totalQuestions}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                    question.difficulty === 'basico' ? 'bg-green-500/20 text-green-300' :
                    question.difficulty === 'intermedio' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                }`}>
                    {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)} • {question.points} pts
                </span>
            </div>
            
            {/* Question */}
            <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-6">{question.question}</h3>
                
                {/* Options */}
                <div className="space-y-3">
                    {question.options?.map((option, idx) => {
                        const isSelected = answers[question.id] === option;
                        const isCorrectOption = option === question.correctAnswer;
                        
                        let optionClass = 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500';
                        
                        if (hasAnswered) {
                            if (isCorrectOption) {
                                optionClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-100';
                            } else if (isSelected && !isCorrectOption) {
                                optionClass = 'bg-red-500/20 border-red-500 text-red-100';
                            } else {
                                optionClass = 'bg-slate-800/50 border-slate-700 opacity-50';
                            }
                        }
                        
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectAnswer(option)}
                                disabled={hasAnswered}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${optionClass} ${!hasAnswered ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium shrink-0">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="flex-1">{option}</span>
                                    {hasAnswered && isCorrectOption && (
                                        <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                                    )}
                                    {hasAnswered && isSelected && !isCorrectOption && (
                                        <XCircle size={20} className="text-red-400 shrink-0" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                
                {/* Explanation */}
                {showExplanation && (
                    <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                        <div className="flex items-start gap-3">
                            {isCorrect ? (
                                <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                                <HelpCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className={`font-medium ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
                                    {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                                </p>
                                <p className="text-sm text-slate-300 mt-1">{question.explanation}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Next button */}
                {hasAnswered && (
                    <button
                        onClick={handleNextQuestion}
                        className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
                    >
                        {currentQuestion < totalQuestions - 1 ? (
                            <>Siguiente pregunta <ChevronRight size={18} /></>
                        ) : (
                            <>Ver resultados <Trophy size={18} /></>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Quiz;
