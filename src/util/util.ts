export const handleJsonParse = (data: string | null): any | null => {
  try {
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

export const handleJsonStringify = (data: any | null): string | null => {
  return data
    ? typeof data === 'string'
      ? data
      : JSON.stringify(data)
    : typeof data === 'boolean'
    ? JSON.stringify(data)
    : null;
};
