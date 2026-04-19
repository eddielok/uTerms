import { useEffect } from 'react';

export function usePrefillFromStorage<T extends object>(
  key: string,
  setAnswers: React.Dispatch<React.SetStateAction<T>>,
  isEditing: boolean,
): void {
  useEffect(() => {
    if (!isEditing) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) setAnswers(prev => ({ ...prev, ...(JSON.parse(stored) as Partial<T>) }));
      } catch { /* ignore parse errors */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
