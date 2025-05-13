
// This file dynamically imports the lovable-tagger plugin when needed
export async function loadTaggerPlugin(isDev) {
  if (isDev) {
    try {
      const { componentTagger } = await import('lovable-tagger');
      return componentTagger();
    } catch (err) {
      console.warn('Failed to load lovable-tagger:', err);
      return null;
    }
  }
  return null;
}
