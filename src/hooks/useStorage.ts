import { useCallback, useEffect, useState } from "react";

export type Serializable = string | number | boolean | null | undefined | { [key: string]: Serializable } | Serializable[];

export const serializeStorageValue = <T extends Serializable>(value: T): string => {
  return JSON.stringify(value);
};

export const deserializeStorageValue = <T extends Serializable>(item: string): T | undefined => {
  try {
    return JSON.parse(item) as T;
  } catch {
    return undefined;
  }
};

export type StorageData<T extends Serializable> = [
  value: T | null, 
  setValue: (newValue: T) => void,
]

export function useStorage<T extends Serializable>(key: string, defaultValue?: T): StorageData<T> {
    const [value, setValue] = useState<T | null>(defaultValue ?? null);
    
    const getItem = useCallback((): T | null => {
        const item = localStorage.getItem(key);
        if (item) {
          return deserializeStorageValue<T>(item) || null;
        }
        return null;
    }, [key]);

    const setItem = useCallback((newValue: T): void => {
        localStorage.setItem(key, serializeStorageValue(newValue));
        setValue(newValue);
    }, [key]);

    useEffect(() => {
      const storedValue = getItem();
      setValue(storedValue);
    }, [getItem]);

    return [value, setItem];
}