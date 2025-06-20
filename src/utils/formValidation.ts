
export const getFieldValidationMessage = (field: string, value: string, minLength = 50) => {
  if (!value || value.trim() === '') {
    return `Please provide an answer for ${field.toLowerCase()}`;
  }
  
  if (value.trim().length < minLength) {
    return `Please provide a more detailed answer (minimum ${minLength} characters, current: ${value.trim().length})`;
  }
  
  return null;
};

export const getCharacterCountColor = (length: number, minLength = 50) => {
  if (length === 0) return 'text-gray-400';
  if (length < minLength) return 'text-orange-500';
  if (length < minLength * 2) return 'text-blue-500';
  return 'text-green-500';
};

export const getCharacterCountMessage = (length: number, minLength = 50) => {
  if (length === 0) return 'Start typing your answer...';
  if (length < minLength) return `${minLength - length} more characters recommended`;
  return 'Great! Detailed answer provided';
};
