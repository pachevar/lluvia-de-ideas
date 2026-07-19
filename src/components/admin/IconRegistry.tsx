import type { ElementType, FC } from 'react';
import { 
  GiBroadsword, GiSpikedShield, GiDungeonGate, GiScrollUnfurled, GiFairyWings, 
  GiGoblinHead, GiMagicPortal, GiOpenTreasureChest, GiPotionBall, GiLockedChest,
  GiKey, GiAxeSword, GiMightyForce, GiCrystalWand, GiBookshelf, GiCrown
} from 'react-icons/gi';
import { MdScience, MdSchool, MdMuseum, MdMenuBook, MdExplore, MdLightbulb, MdPets, MdLandscape, MdMap } from 'react-icons/md';
import { FaLandmark, FaFeather, FaFlask, FaDna, FaMicroscope, FaSpaceShuttle } from 'react-icons/fa';

// Diccionario de íconos disponibles para evitar inflar el bundle y poder renderizarlos desde texto (BD)
export const ICONS_REGISTRY: Record<string, ElementType> = {
  // Videojuegos / RPG (Gi)
  GiBroadsword, GiSpikedShield, GiDungeonGate, GiScrollUnfurled, GiFairyWings,
  GiGoblinHead, GiMagicPortal, GiOpenTreasureChest, GiPotionBall, GiLockedChest,
  GiKey, GiAxeSword, GiMightyForce, GiCrystalWand, GiBookshelf, GiCrown,

  // Ciencia y Educación (Md, Fa)
  MdScience, MdSchool, MdMuseum, MdMenuBook, MdExplore, MdLightbulb, MdPets, MdLandscape, MdMap,
  FaLandmark, FaFeather, FaFlask, FaDna, FaMicroscope, FaSpaceShuttle
};

export const ICON_CATEGORIES = [
  {
    name: 'Videojuegos / Aventura',
    icons: [
      'GiBroadsword', 'GiSpikedShield', 'GiDungeonGate', 'GiScrollUnfurled', 'GiFairyWings',
      'GiGoblinHead', 'GiMagicPortal', 'GiOpenTreasureChest', 'GiPotionBall', 'GiLockedChest',
      'GiKey', 'GiAxeSword', 'GiMightyForce', 'GiCrystalWand', 'GiBookshelf', 'GiCrown'
    ]
  },
  {
    name: 'Ciencia / Educación',
    icons: [
      'MdScience', 'MdSchool', 'MdMuseum', 'MdMenuBook', 'MdExplore', 'MdLightbulb', 'MdPets', 'MdLandscape', 'MdMap',
      'FaLandmark', 'FaFeather', 'FaFlask', 'FaDna', 'FaMicroscope', 'FaSpaceShuttle'
    ]
  }
];

export const EMOJI_CATEGORIES = [
  {
    name: 'Emojis Nativos',
    icons: [
      '🌲', '🏔️', '🌋', '🌊', '🏜️', '❄️', '🌿', '🍄',
      '🐉', '🐺', '🦉', '🐍', '🦅', '🦇', '🦖', '🦄',
      '⚔️', '🛡️', '🧪', '🔮', '📜', '📖', '🗝️', '💎',
      '👑', '⭐', '🔥', '💧', '⚡', '🌀', '🎭', '🏰'
    ]
  }
];

interface IconRendererProps {
  iconName: string;
  color?: string;
  size?: string | number;
  className?: string;
}

export const IconRenderer: FC<IconRendererProps> = ({ iconName, color = 'inherit', size = '3em', className = '' }) => {
  // Si es un emoji (no está en el registro y suele tener longitud pequeña), lo renderizamos como texto
  if (!ICONS_REGISTRY[iconName]) {
    return <span className={className} style={{ fontSize: size, color, lineHeight: 1 }}>{iconName}</span>;
  }

  // Si es un ícono de react-icons, lo renderizamos
  const IconComponent = ICONS_REGISTRY[iconName];
  return <IconComponent className={className} size={size} color={color} />;
};
