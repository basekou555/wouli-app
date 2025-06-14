
export const generateRealisticStats = (baseViews: number) => ({
  views: baseViews + Math.floor(Math.random() * 100),
  likes: Math.floor(baseViews * 0.15) + Math.floor(Math.random() * 20),
  participants: Math.floor(baseViews * 0.25) + Math.floor(Math.random() * 30),
  search_appearances: Math.floor(baseViews * 0.8) + Math.floor(Math.random() * 50)
});
