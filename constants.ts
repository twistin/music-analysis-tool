
import { SectionTemplate } from './types';

export const ANALYSIS_SECTIONS: Record<string, SectionTemplate> = {
  exposition: {
    label: 'Exposición',
    color: 'rgba(239, 68, 68, 0.4)', // Red-500
    tailwind: 'bg-red-500 hover:bg-red-600 text-white'
  },
  themeA: {
    label: 'Tema A',
    color: 'rgba(34, 197, 94, 0.4)', // Green-500
    tailwind: 'bg-green-500 hover:bg-green-600 text-white'
  },
  themeB: {
    label: 'Tema B',
    color: 'rgba(59, 130, 246, 0.4)', // Blue-500
    tailwind: 'bg-blue-500 hover:bg-blue-600 text-white'
  },
  bridge: {
    label: 'Puente/Transición',
    color: 'rgba(107, 114, 128, 0.4)', // Gray-500
    tailwind: 'bg-gray-500 hover:bg-gray-600 text-white'
  },
  development: {
    label: 'Desarrollo',
    color: 'rgba(249, 115, 22, 0.4)', // Orange-500
    tailwind: 'bg-orange-500 hover:bg-orange-600 text-white'
  },
  recapitulation: {
    label: 'Reexposición',
    color: 'rgba(139, 92, 246, 0.4)', // Violet-500
    tailwind: 'bg-violet-500 hover:bg-violet-600 text-white'
  },
  coda: {
    label: 'Coda',
    color: 'rgba(234, 179, 8, 0.4)', // Yellow-500
    tailwind: 'bg-yellow-500 hover:bg-yellow-600 text-white'
  }
};
