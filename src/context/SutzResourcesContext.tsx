import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { SutzResourceKey, SutzResources } from '../types';
import { SUTZ_RESOURCE_KEYS, DEFAULT_SUTZ_RESOURCES } from '../data/sutzResources';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SutzBadge {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  desc: string;
}

export interface SutzQuest {
  id: string;
  title: string;
  icon: string;
  rewardXp: number;
  progress: number;
  target: number;
  completed: boolean;
  desc: string;
}

interface SutzResourcesContextValue {
  resources: SutzResources;
  addResources: (delta: Partial<Record<SutzResourceKey, number>>) => void;
  trySubtract: (delta: Partial<Record<SutzResourceKey, number>>) => boolean;
  completedStories: string[];
  grantStoryCompletion: (storyId: string) => void;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpPercentage: number;
  badges: SutzBadge[];
  quests: SutzQuest[];
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
  const { user } = useAuth();

  const [resources, setResources] = useState<SutzResources>(() => ({
    ...DEFAULT_SUTZ_RESOURCES,
    ...readStored<SutzResources>(STORAGE_KEY, DEFAULT_SUTZ_RESOURCES)
  }));

  const [completedStories, setCompletedStories] = useState<string[]>(() =>
    readStored<string[]>(STORIES_KEY, [])
  );

  // Synchronize from Firestore when user logs in
  useEffect(() => {
    if (!user) return;
    const loadFromFirestore = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'sutz_progress', 'data');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.resources) {
            setResources(prev => ({ ...prev, ...data.resources }));
          }
          if (Array.isArray(data.completedStories)) {
            setCompletedStories(prev => Array.from(new Set([...prev, ...data.completedStories])));
          }
        }
      } catch (err) {
        console.warn('Could not load Sutz progress from Firestore:', err);
      }
    };
    loadFromFirestore();
  }, [user]);

  // Save to localStorage
  useEffect(() => {
    writeStored(STORAGE_KEY, resources);
  }, [resources]);

  useEffect(() => {
    writeStored(STORIES_KEY, completedStories);
  }, [completedStories]);

  // Sync to Firestore when resources or stories change
  const saveToFirestore = async (newRes: SutzResources, newStories: string[]) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'sutz_progress', 'data');
      await setDoc(docRef, {
        resources: newRes,
        completedStories: newStories,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Could not save Sutz progress to Firestore:', err);
    }
  };

  const addResources = (delta: Partial<Record<SutzResourceKey, number>>) => {
    setResources(prev => {
      const next: SutzResources = { ...prev };
      SUTZ_RESOURCE_KEYS.forEach(key => {
        const amount = delta[key];
        if (typeof amount === 'number' && amount !== 0) {
          next[key] = Math.max(0, prev[key] + amount);
        }
      });
      saveToFirestore(next, completedStories);
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
      saveToFirestore(next, completedStories);
      return next;
    });
    return true;
  };

  const grantStoryCompletion = (storyId: string) => {
    const isNew = !completedStories.includes(storyId);
    const nextStories = isNew ? [...completedStories, storyId] : completedStories;
    if (isNew) {
      setCompletedStories(nextStories);
      setResources(r => {
        const next: SutzResources = {
          pergaminos: r.pergaminos + 1,
          puntos: r.puntos + 120,
          monedas: r.monedas + 50,
          gemas: r.gemas + 10
        };
        saveToFirestore(next, nextStories);
        return next;
      });
    }
  };

  // Dynamic Level and XP Calculations
  const LEVEL_THRESHOLD = 250;
  const level = useMemo(() => Math.max(1, Math.floor(resources.puntos / LEVEL_THRESHOLD) + 1), [resources.puntos]);
  const currentLevelXP = useMemo(() => resources.puntos % LEVEL_THRESHOLD, [resources.puntos]);
  const nextLevelXP = LEVEL_THRESHOLD;
  const xpPercentage = useMemo(() => Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100)), [currentLevelXP]);

  // Dynamic Badges
  const badges: SutzBadge[] = useMemo(() => [
    {
      id: 'sutz_explorer',
      title: 'Explorador de Sutz',
      icon: '☁️',
      unlocked: true,
      desc: 'Ingresó al mundo virtual Sutz.'
    },
    {
      id: 'popol_vuh_scholar',
      title: 'Erudito del Popol Vuh',
      icon: '📜',
      unlocked: completedStories.length >= 3,
      desc: 'Completó 3 o más leyendas ancestrales.'
    },
    {
      id: 'master_mythologist',
      title: 'Maestro de la Mitología',
      icon: '🏛️',
      unlocked: completedStories.length >= 5,
      desc: 'Descubrió todos los cuentos del Popol Vuh.'
    },
    {
      id: 'steam_innovator',
      title: 'Sabio de las Gemas',
      icon: '💎',
      unlocked: resources.gemas >= 20,
      desc: 'Acumuló 20 o más gemas de aprendizaje.'
    }
  ], [completedStories.length, resources.gemas]);

  // Dynamic Quests / Missions
  const quests: SutzQuest[] = useMemo(() => [
    {
      id: 'q1',
      title: 'Misterios del Popol Vuh',
      icon: '📜',
      rewardXp: 150,
      progress: Math.min(5, completedStories.length),
      target: 5,
      completed: completedStories.length >= 5,
      desc: 'Descubre las 5 historias de los orígenes mayas en el mapa.'
    },
    {
      id: 'q2',
      title: 'Coleccionista de Pergaminos',
      icon: '⚡',
      rewardXp: 200,
      progress: Math.min(5, resources.pergaminos),
      target: 5,
      completed: resources.pergaminos >= 5,
      desc: 'Reúne 5 pergaminos completando desafíos educativos.'
    },
    {
      id: 'q3',
      title: 'Gran Maestro de Sutz (Nivel 5)',
      icon: '👑',
      rewardXp: 300,
      progress: Math.min(5, level),
      target: 5,
      completed: level >= 5,
      desc: 'Alcanza el nivel 5 de experiencia pedagógica.'
    }
  ], [completedStories.length, resources.pergaminos, level]);

  return (
    <SutzResourcesContext.Provider
      value={{
        resources,
        addResources,
        trySubtract,
        completedStories,
        grantStoryCompletion,
        level,
        currentLevelXP,
        nextLevelXP,
        xpPercentage,
        badges,
        quests
      }}
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