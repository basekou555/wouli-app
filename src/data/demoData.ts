
// Re-export all demo data from separate files for backwards compatibility
export { demoBusinessConfigs } from './businessConfigs';
export { demoBusinessEvents } from './businessEvents';
export { demoProfiles } from './profiles';
export { popularTags } from './tags';
export { generateRealisticStats } from './utils';

// Default export for convenience
export default {
  demoBusinessConfigs: require('./businessConfigs').demoBusinessConfigs,
  demoBusinessEvents: require('./businessEvents').demoBusinessEvents,
  demoProfiles: require('./profiles').demoProfiles,
  popularTags: require('./tags').popularTags,
  generateRealisticStats: require('./utils').generateRealisticStats
};
