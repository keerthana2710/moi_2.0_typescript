export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTime = (timeStr) => {
  return new Date(timeStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
