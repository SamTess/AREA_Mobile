import { useColorScheme } from 'nativewind';

export type DesignToken = 
  | 'primary-500' | 'primary-600' | 'primary-700'
  | 'error-500' | 'error-600' | 'error-700'
  | 'success-500' | 'success-600' | 'success-700'
  | 'warning-500' | 'warning-600' | 'warning-700'
  | 'info-500' | 'info-600' | 'info-700'
  | 'typography-500' | 'typography-600' | 'typography-700' | 'typography-800' | 'typography-900'
  | 'background-0' | 'background-50' | 'background-100' | 'background-200' | 'background-300'
  | 'outline-200' | 'outline-300' | 'outline-400'
  | 'indigo-500' | 'indigo-600'
  | 'gray-200' | 'gray-400' | 'gray-500'
  | 'yellow-400';

/**
 * Hook pour utiliser les design tokens de manière cohérente
 * Les valeurs sont automatiquement adaptées selon le mode (light/dark)
 */
export function useDesignTokens() {
  const { colorScheme } = useColorScheme();
  
  const tokenValues = {
    light: {
      // Primary
      'primary-500': 'rgb(51 51 51)',
      'primary-600': 'rgb(41 41 41)',
      'primary-700': 'rgb(31 31 31)',
      
      // Interface colors
      'indigo-500': 'rgb(129 140 248)',
      'indigo-600': 'rgb(99 102 241)',
      'gray-200': 'rgb(229 231 235)',
      'gray-400': 'rgb(156 163 175)',
      'gray-500': 'rgb(107 114 128)',
      'yellow-400': 'rgb(252 211 77)',
      
      // Typography
      'typography-500': 'rgb(140 140 140)',
      'typography-600': 'rgb(115 115 115)',
      'typography-700': 'rgb(82 82 82)',
      'typography-800': 'rgb(64 64 64)',
      'typography-900': 'rgb(38 38 39)',
      
      // Background
      'background-0': 'rgb(255 255 255)',
      'background-50': 'rgb(246 246 246)',
      'background-100': 'rgb(242 241 241)',
      'background-200': 'rgb(220 219 219)',
      'background-300': 'rgb(213 212 212)',
      
      // Outline
      'outline-200': 'rgb(221 220 219)',
      'outline-300': 'rgb(211 211 211)',
      'outline-400': 'rgb(165 163 163)',
      
      // Semantic colors
      'error-500': 'rgb(230 53 53)',
      'error-600': 'rgb(220 38 38)',
      'error-700': 'rgb(185 28 28)',
      'success-500': 'rgb(52 131 82)',
      'success-600': 'rgb(42 121 72)',
      'success-700': 'rgb(32 111 62)',
      'warning-500': 'rgb(231 120 40)',
      'warning-600': 'rgb(215 108 31)',
      'warning-700': 'rgb(180 90 26)',
      'info-500': 'rgb(13 166 242)',
      'info-600': 'rgb(11 141 205)',
      'info-700': 'rgb(9 115 168)',
    },
    dark: {
      // Primary (inversed in dark mode)
      'primary-500': 'rgb(230 230 230)',
      'primary-600': 'rgb(240 240 240)',
      'primary-700': 'rgb(250 250 250)',
      
      // Interface colors
      'indigo-500': 'rgb(165 180 252)',
      'indigo-600': 'rgb(129 140 248)',
      'gray-200': 'rgb(75 85 99)',
      'gray-400': 'rgb(156 163 175)',
      'gray-500': 'rgb(156 163 175)',
      'yellow-400': 'rgb(252 211 77)',
      
      // Typography
      'typography-500': 'rgb(163 163 163)',
      'typography-600': 'rgb(212 212 212)',
      'typography-700': 'rgb(219 219 220)',
      'typography-800': 'rgb(229 229 229)',
      'typography-900': 'rgb(245 245 245)',
      
      // Background
      'background-0': 'rgb(18 18 18)',
      'background-50': 'rgb(39 38 37)',
      'background-100': 'rgb(65 64 64)',
      'background-200': 'rgb(83 82 82)',
      'background-300': 'rgb(116 116 116)',
      
      // Outline
      'outline-200': 'rgb(83 82 82)',
      'outline-300': 'rgb(115 116 116)',
      'outline-400': 'rgb(140 141 141)',
      
      // Semantic colors (adapted for dark mode)
      'error-500': 'rgb(239 68 68)',
      'error-600': 'rgb(249 97 96)',
      'error-700': 'rgb(229 91 90)',
      'success-500': 'rgb(72 151 102)',
      'success-600': 'rgb(102 181 132)',
      'success-700': 'rgb(132 211 162)',
      'warning-500': 'rgb(251 149 75)',
      'warning-600': 'rgb(253 173 116)',
      'warning-700': 'rgb(254 205 170)',
      'info-500': 'rgb(50 180 244)',
      'info-600': 'rgb(87 194 246)',
      'info-700': 'rgb(124 207 248)',
    },
  } as const;
  
  /**
   * Obtient la valeur RGB d'un token de design
   */
  const getToken = (token: DesignToken): string => {
    return tokenValues[colorScheme || 'light'][token];
  };
  
  /**
   * Obtient la classe Tailwind correspondant au token
   */
  const getTokenClass = (token: DesignToken): string => {
    return `text-${token}`;
  };
  
  /**
   * Obtient la classe de background correspondant au token
   */
  const getBgTokenClass = (token: DesignToken): string => {
    return `bg-${token}`;
  };
  
  /**
   * Obtient la classe de border correspondant au token
   */
  const getBorderTokenClass = (token: DesignToken): string => {
    return `border-${token}`;
  };
  
  return {
    getToken,
    getTokenClass,
    getBgTokenClass,
    getBorderTokenClass,
    colorScheme: colorScheme || 'light',
  };
}