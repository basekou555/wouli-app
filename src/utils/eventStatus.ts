
export const getEventStatus = (event: { date: string; end_time?: string }): 'active' | 'grace_period' | 'archived' => {
  const now = new Date();
  const eventDate = new Date(event.date);
  
  // Estimer l'heure de fin (ex: +3h si pas définie)
  const endTime = event.end_time ? new Date(event.end_time) : new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);
  const graceEndTime = new Date(endTime.getTime() + 2 * 60 * 60 * 1000); // +2h
  
  if (now < eventDate) return 'active';
  if (now < graceEndTime) return 'grace_period';
  return 'archived';
};

export const getHoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

export const getMonthAgo = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString();
};
