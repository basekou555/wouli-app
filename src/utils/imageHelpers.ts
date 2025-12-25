/**
 * Helper functions for image focus positioning
 */

export type ImageFocusPosition = 'top' | 'center' | 'bottom';

/**
 * Returns the Tailwind CSS class for image object-position based on focus setting
 */
export const getFocusClass = (position?: string): string => {
  switch (position) {
    case 'top':
      return 'object-top';
    case 'bottom':
      return 'object-bottom';
    case 'center':
    default:
      return 'object-center';
  }
};

/**
 * Returns a default focus position based on event category
 */
export const getDefaultFocusByCategory = (category?: string): ImageFocusPosition => {
  switch (category) {
    case 'soirees':
      return 'top'; // Infos lineup généralement en haut
    case 'a-manger':
      return 'center'; // Photo plat au centre
    case 'a-boire':
      return 'center';
    case 'activites':
      return 'center';
    default:
      return 'center';
  }
};

/**
 * Focus position labels for UI
 */
export const focusPositionLabels: Record<ImageFocusPosition, { label: string; icon: string }> = {
  top: { label: 'Haut', icon: '⬆️' },
  center: { label: 'Centre', icon: '⏺️' },
  bottom: { label: 'Bas', icon: '⬇️' }
};
