export const tunePostMessage = (message?: string) => {
  if (!message) {
    return '';
  }

  const strings = message
    .split('\n')
    .map(string => string.trim())
    .filter(Boolean);

  return strings.join('\n\n');
}
