import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SutzResourceKey, SutzResources } from '../types';
import { SUTZ_RESOURCE_KEYS, DEFAULT_SUTZ_RESOURCES } from '../data/sutzResources';

interface SutzResourcesContextValue {
  resources: SutzResources;
  addResources: (delta: Partial<Record<SutzResourceKey, number>>) => void;
  trySubtract: (delta: Partial<Record<SutzResourceKey, number>>) => boolean;
  completedStories: string[];
  grantStoryCompletion: (storyId: string) => void;
}

const SutzResourcesContext = createContext<SutzResourcesContextValue | undefined>(undefined);

const STORAGE_KEY = 'sutz_resources_v1';
const STORIES_KEY = 'sutz_completed_stories_v1';

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('Could not read Sutz resources from localStorage:', e);
  }
  return fallback;
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Could not persist Sutz resources to localStorage:', e);
  }
}

export const SutzResourcesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<SutzResources>(() => ({
    ...DEFAULT_SUTZ_RESOURCES,
    ...readStored<SutzResources>(STORAGE_KEY, DEFAULT_SUTZ_RESOURCES)
  }));

  const [completedStories, setCompletedStories] = useState<string[]>(() =>
    readStored<string[]>(STORIES_KEY, [])
  );

  useEffect(() => {
    writeStored(STORAGE_KEY, resources);
  }, [resources]);

  useEffect(() => {
    writeStored(STORIES_KEY, completedStories);
  }, [completedStories]);

  const addResources = (delta: Partial<Record<SutzResourceKey, number>>) => {
    setResources(prev => {
      const next: SutzResources = { ...prev };
      SUTZ_RESOURCE_KEYS.forEach(key => {
        const amount = delta[key];
        if (typeof amount === 'number' && amount !== 0) {
          next[key] = Math.max(0, prev[key] + amount);
        }
      });
      return next;
    });
  };

  const trySubtract = (delta: Partial<Record<SutzResourceKey, number>>): boolean => {
    let success = true;
    SUTZ_RESOURCE_KEYS.forEach(key => {
      const amount = delta[key] ?? 0;
      if (resources[key] < amount) success = false;
    });
    if (!success) return false;

    setResources(prev => {
      const next: SutzResources = { ...prev };
      SUTZ_RESOURCE_KEYS.forEach(key => {
        const amount = delta[key] ?? 0;
        next[key] = Math.max(0, prev[key] - amount);
      });
      return next;
    });
    return true;
  };

  const grantStoryCompletion = (storyId: string) => {
    if (completedStories.includes(storyId)) return;
    setCompletedStories(prev => (prev.includes(storyId) ? prev : [...prev, storyId]));
    setResources(r => ({
      pergaminos: r.pergaminos + 1,
      puntos: r.puntos + 120,
      monedas: r.monedas,
      gemas: r.gemas
    }));
  };

  return (
    <SutzResourcesContext.Provider
      value={{ resources, addResources, trySubtract, completedStories, grantStoryCompletion }}
    >
      {children}
    </SutzResourcesContext.Provider>
  );
};

export const useSutzResources = (): SutzResourcesContextValue => {
  const context = useContext(SutzResourcesContext);
  if (context === undefined) {
    throw new Error('useSutzResources must be used within a SutzResourcesProvider');
  }
  return context;
};