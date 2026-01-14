import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Music, Clock, ChevronRight, GraduationCap, Headphones, Piano } from 'lucide-react';
import { SYLLABUS } from '../data/syllabus';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto p-6 space-y-8">
            <header className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Conservatorio Virtual
                </h1>
                <p className="text-slate-400 text-lg">
                    Plataforma de Análisis Musical - Grado Profesional
                </p>
                <button
                    onClick={() => navigate('/practice')}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-white font-medium transition-all hover:scale-105"
                >
                    <Headphones size={20} />
                    Sala de Práctica
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Piano + Ear Training</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {SYLLABUS.map((course) => (
                    <div key={course.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-6 bg-slate-900/50 border-b border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                                <GraduationCap className="text-blue-400" size={24} />
                                <h2 className="text-2xl font-bold text-white">{course.title}</h2>
                            </div>
                            <p className="text-slate-400 text-sm">{course.description}</p>
                        </div>

                        <div className="p-6 flex-1 space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                    Objetivos
                                </h3>
                                <ul className="space-y-2">
                                    {course.objectives.slice(0, 3).map((obj, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            {obj}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                    Temario y Práctica
                                </h3>
                                <div className="grid gap-2">
                                    {course.topics.map((topic) => (
                                        <button
                                            key={topic.id}
                                            onClick={() => navigate(`/analysis/${topic.id}`)}
                                            className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700 transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-md ${topic.category === 'form' ? 'bg-purple-500/20 text-purple-400' :
                                                        topic.category === 'history' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {topic.category === 'form' ? <Music size={16} /> :
                                                        topic.category === 'history' ? <Clock size={16} /> :
                                                            <BookOpen size={16} />}
                                                </div>
                                                <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                                    {topic.title}
                                                </span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
