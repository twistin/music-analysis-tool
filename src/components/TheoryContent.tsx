import React, { useMemo } from 'react';
import { BookOpen, ChevronRight, ExternalLink, FileMusic } from 'lucide-react';
import { getTheoryContent, TheoryTopic } from '../data/theory';
import { getSheetMusicForTopic } from '../data/sheetMusic';
import SheetMusicViewer from './SheetMusicViewer';

interface TheoryContentProps {
    topicId: string;
}

const TheoryContent: React.FC<TheoryContentProps> = ({ topicId }) => {
    const theory = useMemo(() => getTheoryContent(topicId), [topicId]);
    const sheetMusic = useMemo(() => getSheetMusicForTopic(topicId), [topicId]);

    if (!theory) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 text-slate-400">
                    <BookOpen size={24} />
                    <div>
                        <p className="font-medium">Contenido teórico no disponible</p>
                        <p className="text-sm text-slate-500">
                            El contenido para "{topicId}" se añadirá próximamente.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span className={`px-2 py-0.5 rounded-full ${theory.course === '5gp' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                        {theory.course === '5gp' ? '5º GP' : '6º GP'}
                    </span>
                </div>
                <h2 className="text-xl font-bold text-white">{theory.title}</h2>
                <p className="text-slate-300 text-sm mt-1">{theory.summary}</p>
            </div>

            {/* Key Points */}
            <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Puntos Clave
                </h3>
                <ul className="space-y-2">
                    {theory.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-200 text-sm">
                            <ChevronRight size={16} className="mt-0.5 text-emerald-400 shrink-0" />
                            {point}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content - Rendered as simple formatted text */}
            <div className="px-6 py-5">
                <div className="prose prose-invert prose-sm max-w-none">
                    <TheoryMarkdown content={theory.content} />
                </div>
            </div>

            {/* Sheet Music Section */}
            {sheetMusic && (
                <div className="px-6 py-4 border-t border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileMusic size={16} className="text-purple-400" />
                        Partitura de Ejemplo
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                        {sheetMusic.composer} - {sheetMusic.description}
                    </p>
                    <SheetMusicViewer 
                        musicXmlUrl={sheetMusic.url} 
                        title={sheetMusic.title}
                    />
                </div>
            )}

            {/* Related Topics */}
            {theory.relatedTopics && theory.relatedTopics.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/30">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Temas Relacionados
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {theory.relatedTopics.map(id => (
                            <span key={id} className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                                {id}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Bibliography */}
            {theory.bibliography && theory.bibliography.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Bibliografía
                    </h3>
                    <ul className="space-y-1">
                        {theory.bibliography.map((ref, idx) => (
                            <li key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                                <ExternalLink size={12} />
                                {ref}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Simple markdown-like renderer for theory content
const TheoryMarkdown: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.trim().split('\n');
    const elements: React.ReactElement[] = [];
    let listItems: string[] = [];
    let inList = false;

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1 my-2">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="text-slate-300 text-sm">{item}</li>
                    ))}
                </ul>
            );
            listItems = [];
        }
        inList = false;
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        
        if (!trimmed) {
            flushList();
            return;
        }

        // Headers
        if (trimmed.startsWith('## ')) {
            flushList();
            elements.push(
                <h2 key={idx} className="text-lg font-bold text-white mt-6 mb-3 border-b border-slate-700 pb-2">
                    {trimmed.replace('## ', '')}
                </h2>
            );
        } else if (trimmed.startsWith('### ')) {
            flushList();
            elements.push(
                <h3 key={idx} className="text-base font-semibold text-blue-300 mt-4 mb-2">
                    {trimmed.replace('### ', '')}
                </h3>
            );
        } else if (trimmed.startsWith('#### ')) {
            flushList();
            elements.push(
                <h4 key={idx} className="text-sm font-semibold text-slate-200 mt-3 mb-1">
                    {trimmed.replace('#### ', '')}
                </h4>
            );
        }
        // List items
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            inList = true;
            listItems.push(trimmed.substring(2));
        }
        // Numbered list
        else if (/^\d+\.\s/.test(trimmed)) {
            inList = true;
            listItems.push(trimmed.replace(/^\d+\.\s/, ''));
        }
        // Regular paragraph with bold/italic support
        else {
            flushList();
            const formatted = trimmed
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>');
            elements.push(
                <p 
                    key={idx} 
                    className="text-slate-300 text-sm my-2"
                    dangerouslySetInnerHTML={{ __html: formatted }}
                />
            );
        }
    });

    flushList();
    return <>{elements}</>;
};

export default TheoryContent;
