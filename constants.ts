
import { SectionTemplate } from './types';

// ============================================
// ETIQUETAS DE ANÁLISIS - EL ARQUITECTO MUSICAL
// Alineadas con la programación del Grado Profesional
// ============================================

export const ANALYSIS_SECTIONS: Record<string, SectionTemplate> = {
  // ──────────────────────────────────────────
  // ESTRUCTURA FORMAL - FORMA SONATA
  // ──────────────────────────────────────────
  exposition: {
    label: 'Exposición',
    color: 'rgba(239, 68, 68, 0.4)',
    tailwind: 'bg-red-500 hover:bg-red-600 text-white'
  },
  themeA: {
    label: 'Tema A',
    color: 'rgba(34, 197, 94, 0.4)',
    tailwind: 'bg-green-500 hover:bg-green-600 text-white'
  },
  themeB: {
    label: 'Tema B',
    color: 'rgba(59, 130, 246, 0.4)',
    tailwind: 'bg-blue-500 hover:bg-blue-600 text-white'
  },
  bridge: {
    label: 'Puente/Transición',
    color: 'rgba(107, 114, 128, 0.4)',
    tailwind: 'bg-gray-500 hover:bg-gray-600 text-white'
  },
  development: {
    label: 'Desarrollo',
    color: 'rgba(249, 115, 22, 0.4)',
    tailwind: 'bg-orange-500 hover:bg-orange-600 text-white'
  },
  recapitulation: {
    label: 'Reexposición',
    color: 'rgba(139, 92, 246, 0.4)',
    tailwind: 'bg-violet-500 hover:bg-violet-600 text-white'
  },
  coda: {
    label: 'Coda',
    color: 'rgba(234, 179, 8, 0.4)',
    tailwind: 'bg-yellow-500 hover:bg-yellow-600 text-white'
  },
  introduction: {
    label: 'Introducción',
    color: 'rgba(156, 163, 175, 0.4)',
    tailwind: 'bg-gray-400 hover:bg-gray-500 text-white'
  },

  // ──────────────────────────────────────────
  // FORMA RONDÓ
  // ──────────────────────────────────────────
  rondoRefrain: {
    label: 'Estribillo (A)',
    color: 'rgba(16, 185, 129, 0.4)',
    tailwind: 'bg-emerald-500 hover:bg-emerald-600 text-white'
  },
  rondoCoupletB: {
    label: 'Copla B',
    color: 'rgba(14, 165, 233, 0.4)',
    tailwind: 'bg-sky-500 hover:bg-sky-600 text-white'
  },
  rondoCoupletC: {
    label: 'Copla C',
    color: 'rgba(99, 102, 241, 0.4)',
    tailwind: 'bg-indigo-500 hover:bg-indigo-600 text-white'
  },

  // ──────────────────────────────────────────
  // TEMA Y VARIACIONES
  // ──────────────────────────────────────────
  theme: {
    label: 'Tema',
    color: 'rgba(236, 72, 153, 0.4)',
    tailwind: 'bg-pink-500 hover:bg-pink-600 text-white'
  },
  variation: {
    label: 'Variación',
    color: 'rgba(244, 114, 182, 0.4)',
    tailwind: 'bg-pink-400 hover:bg-pink-500 text-white'
  },

  // ──────────────────────────────────────────
  // FUGA (5º GP)
  // ──────────────────────────────────────────
  fugaSubject: {
    label: 'Sujeto',
    color: 'rgba(220, 38, 38, 0.4)',
    tailwind: 'bg-red-600 hover:bg-red-700 text-white'
  },
  fugaAnswer: {
    label: 'Respuesta',
    color: 'rgba(37, 99, 235, 0.4)',
    tailwind: 'bg-blue-600 hover:bg-blue-700 text-white'
  },
  fugaCountersubject: {
    label: 'Contrasujeto',
    color: 'rgba(5, 150, 105, 0.4)',
    tailwind: 'bg-emerald-600 hover:bg-emerald-700 text-white'
  },
  fugaEpisode: {
    label: 'Episodio',
    color: 'rgba(217, 119, 6, 0.4)',
    tailwind: 'bg-amber-600 hover:bg-amber-700 text-white'
  },
  fugaStretto: {
    label: 'Stretto',
    color: 'rgba(124, 58, 237, 0.4)',
    tailwind: 'bg-violet-600 hover:bg-violet-700 text-white'
  },

  // ──────────────────────────────────────────
  // FORMAS BARROCAS
  // ──────────────────────────────────────────
  ritornello: {
    label: 'Ritornello',
    color: 'rgba(168, 85, 247, 0.4)',
    tailwind: 'bg-purple-500 hover:bg-purple-600 text-white'
  },
  solo: {
    label: 'Solo',
    color: 'rgba(251, 146, 60, 0.4)',
    tailwind: 'bg-orange-400 hover:bg-orange-500 text-white'
  },
  ariaDaCapo: {
    label: 'Aria Da Capo',
    color: 'rgba(192, 132, 252, 0.4)',
    tailwind: 'bg-purple-400 hover:bg-purple-500 text-white'
  },

  // ──────────────────────────────────────────
  // SUITE BARROCA
  // ──────────────────────────────────────────
  allemande: {
    label: 'Allemande',
    color: 'rgba(45, 212, 191, 0.4)',
    tailwind: 'bg-teal-400 hover:bg-teal-500 text-white'
  },
  courante: {
    label: 'Courante',
    color: 'rgba(20, 184, 166, 0.4)',
    tailwind: 'bg-teal-500 hover:bg-teal-600 text-white'
  },
  sarabande: {
    label: 'Sarabande',
    color: 'rgba(13, 148, 136, 0.4)',
    tailwind: 'bg-teal-600 hover:bg-teal-700 text-white'
  },
  gigue: {
    label: 'Gigue',
    color: 'rgba(15, 118, 110, 0.4)',
    tailwind: 'bg-teal-700 hover:bg-teal-800 text-white'
  },

  // ──────────────────────────────────────────
  // ANÁLISIS ARMÓNICO (Cadencias)
  // ──────────────────────────────────────────
  cadencePerfect: {
    label: 'Cadencia Perfecta (V-I)',
    color: 'rgba(34, 197, 94, 0.5)',
    tailwind: 'bg-green-600 hover:bg-green-700 text-white'
  },
  cadencePlagal: {
    label: 'Cadencia Plagal (IV-I)',
    color: 'rgba(22, 163, 74, 0.5)',
    tailwind: 'bg-green-700 hover:bg-green-800 text-white'
  },
  cadenceDeceptive: {
    label: 'Cadencia Rota (V-VI)',
    color: 'rgba(239, 68, 68, 0.5)',
    tailwind: 'bg-red-500 hover:bg-red-600 text-white'
  },
  halfCadence: {
    label: 'Semicadencia (...-V)',
    color: 'rgba(251, 191, 36, 0.5)',
    tailwind: 'bg-amber-400 hover:bg-amber-500 text-black'
  },

  // ──────────────────────────────────────────
  // ANÁLISIS ARMÓNICO (Acordes Alterados - 5º GP)
  // ──────────────────────────────────────────
  augmentedSixth: {
    label: '6ª Aumentada',
    color: 'rgba(190, 24, 93, 0.5)',
    tailwind: 'bg-pink-700 hover:bg-pink-800 text-white'
  },
  neapolitan: {
    label: '6ª Napolitana',
    color: 'rgba(157, 23, 77, 0.5)',
    tailwind: 'bg-pink-800 hover:bg-pink-900 text-white'
  },
  modulation: {
    label: 'Modulación',
    color: 'rgba(79, 70, 229, 0.5)',
    tailwind: 'bg-indigo-600 hover:bg-indigo-700 text-white'
  },

  // ──────────────────────────────────────────
  // TEXTURA (5º GP)
  // ──────────────────────────────────────────
  monophonic: {
    label: 'Monodía',
    color: 'rgba(148, 163, 184, 0.4)',
    tailwind: 'bg-slate-400 hover:bg-slate-500 text-white'
  },
  homophonic: {
    label: 'Homofonía',
    color: 'rgba(100, 116, 139, 0.4)',
    tailwind: 'bg-slate-500 hover:bg-slate-600 text-white'
  },
  polyphonic: {
    label: 'Polifonía',
    color: 'rgba(71, 85, 105, 0.4)',
    tailwind: 'bg-slate-600 hover:bg-slate-700 text-white'
  },
  melodySupportBass: {
    label: 'Melodía Acompañada',
    color: 'rgba(51, 65, 85, 0.4)',
    tailwind: 'bg-slate-700 hover:bg-slate-800 text-white'
  },

  // ──────────────────────────────────────────
  // ROMÁNTICO / LIED (6º GP)
  // ──────────────────────────────────────────
  strophe: {
    label: 'Estrofa',
    color: 'rgba(251, 113, 133, 0.4)',
    tailwind: 'bg-rose-400 hover:bg-rose-500 text-white'
  },
  refrain: {
    label: 'Estribillo/Refrán',
    color: 'rgba(244, 63, 94, 0.4)',
    tailwind: 'bg-rose-500 hover:bg-rose-600 text-white'
  },
  leitmotiv: {
    label: 'Leitmotiv',
    color: 'rgba(225, 29, 72, 0.4)',
    tailwind: 'bg-rose-600 hover:bg-rose-700 text-white'
  }
};

// ============================================
// CATEGORÍAS DE ETIQUETAS PARA UI
// ============================================
export const SECTION_CATEGORIES = {
  formaSonata: {
    label: 'Forma Sonata',
    keys: ['exposition', 'themeA', 'themeB', 'bridge', 'development', 'recapitulation', 'coda', 'introduction']
  },
  rondo: {
    label: 'Rondó',
    keys: ['rondoRefrain', 'rondoCoupletB', 'rondoCoupletC']
  },
  variaciones: {
    label: 'Tema y Variaciones',
    keys: ['theme', 'variation']
  },
  fuga: {
    label: 'Fuga',
    keys: ['fugaSubject', 'fugaAnswer', 'fugaCountersubject', 'fugaEpisode', 'fugaStretto']
  },
  barroco: {
    label: 'Formas Barrocas',
    keys: ['ritornello', 'solo', 'ariaDaCapo']
  },
  suite: {
    label: 'Suite Barroca',
    keys: ['allemande', 'courante', 'sarabande', 'gigue']
  },
  cadencias: {
    label: 'Cadencias',
    keys: ['cadencePerfect', 'cadencePlagal', 'cadenceDeceptive', 'halfCadence']
  },
  armonia: {
    label: 'Armonía Avanzada',
    keys: ['augmentedSixth', 'neapolitan', 'modulation']
  },
  textura: {
    label: 'Textura',
    keys: ['monophonic', 'homophonic', 'polyphonic', 'melodySupportBass']
  },
  romantico: {
    label: 'Romántico/Lied',
    keys: ['strophe', 'refrain', 'leitmotiv']
  }
};

// Obtener categoría por topic del syllabus
export const getCategoriesForTopic = (topicId: string): string[] => {
  const topicCategories: Record<string, string[]> = {
    // 5º GP
    'textura': ['textura'],
    'melodia': ['formaSonata'],
    'armonia-1': ['cadencias'],
    'armonia-2': ['armonia'],
    'modulacion': ['armonia'],
    'madrigal': ['textura'],
    'aria': ['barroco'],
    'coral': ['cadencias', 'textura'],
    'fuga': ['fuga'],
    'concerto': ['barroco'],
    'suite': ['suite'],
    'binaria': ['formaSonata'],
    'sonata-pre': ['formaSonata'],
    'sonata-clas': ['formaSonata'],
    'minueto': ['formaSonata'],
    'variaciones': ['variaciones'],
    // 6º GP
    'repaso': ['formaSonata', 'cadencias'],
    'sonata-clas-2': ['formaSonata'],
    'rondo': ['rondo'],
    'rom-armonia': ['armonia', 'cadencias'],
    'lied': ['romantico'],
    'peq-formas': ['romantico'],
    'autores-rom': ['romantico', 'armonia'],
    'wagner': ['romantico'],
    'nacionalismo': ['romantico'],
    'sxx': ['textura', 'armonia']
  };
  return topicCategories[topicId] || ['formaSonata'];
};
