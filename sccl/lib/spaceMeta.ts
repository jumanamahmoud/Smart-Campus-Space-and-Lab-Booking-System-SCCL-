import type { Space } from '@/types/booking';

export type SpaceCategory =
  | 'Laboratory'
  | 'Study Room'
  | 'Conference'
  | 'Lecture Hall'
  | 'Multi-purpose';

export const FILTER_CATEGORIES = [
  'All Types',
  'Laboratory',
  'Study Room',
  'Conference',
  'Lecture Hall',
] as const;

export type FilterCategory = (typeof FILTER_CATEGORIES)[number];

const categoryStyles: Record<
  SpaceCategory,
  { badge: string; icon: string; iconBg: string }
> = {
  Laboratory: {
    badge: 'bg-violet-100 text-violet-700',
    icon: '🧪',
    iconBg: 'bg-violet-50',
  },
  'Study Room': {
    badge: 'bg-emerald-100 text-emerald-700',
    icon: '📚',
    iconBg: 'bg-emerald-50',
  },
  Conference: {
    badge: 'bg-teal-100 text-teal-700',
    icon: '💼',
    iconBg: 'bg-teal-50',
  },
  'Lecture Hall': {
    badge: 'bg-blue-100 text-blue-700',
    icon: '🎓',
    iconBg: 'bg-blue-50',
  },
  'Multi-purpose': {
    badge: 'bg-indigo-100 text-indigo-700',
    icon: '🏛️',
    iconBg: 'bg-indigo-50',
  },
};

const amenityMap: Record<SpaceCategory, string[]> = {
  Laboratory: ['Lab Equipment', 'Safety Gear', 'Workstations'],
  'Study Room': ['Whiteboard', 'Power Outlets', 'Wi-Fi'],
  Conference: ['Projector', 'Video Conferencing', 'Whiteboard'],
  'Lecture Hall': ['Projector', 'Microphone', 'Seating'],
  'Multi-purpose': ['Flexible Layout', 'Projector', 'Wi-Fi'],
};

const descriptionMap: Record<SpaceCategory, string> = {
  Laboratory:
    'Fully equipped laboratory space for research, experiments, and practical sessions.',
  'Study Room':
    'Quiet collaborative space ideal for group study and focused academic work.',
  Conference:
    'Professional meeting room with presentation tools for discussions and reviews.',
  'Lecture Hall':
    'Large-capacity hall suitable for lectures, seminars, and campus events.',
  'Multi-purpose':
    'Versatile campus space that adapts to workshops, events, and team activities.',
};

export function normalizeCategory(type: string): SpaceCategory {
  const value = type.toLowerCase();

  if (value.includes('lab')) return 'Laboratory';
  if (value.includes('meeting') || value.includes('conference')) return 'Conference';
  if (value.includes('study')) return 'Study Room';
  if (value.includes('lecture')) return 'Lecture Hall';
  if (value.includes('multi')) return 'Multi-purpose';

  return 'Multi-purpose';
}

export function getSpaceCategoryStyle(type: string) {
  const category = normalizeCategory(type);
  return { category, ...categoryStyles[category] };
}

export function getSpaceDescription(space: Space) {
  return descriptionMap[normalizeCategory(space.type)];
}

export function getSpaceAmenities(type: string) {
  return amenityMap[normalizeCategory(type)];
}

export function getSpaceFloor(location: string) {
  const match = location.match(/level\s*(\d+)|floor\s*(\d+)|ground\s*floor/i);
  if (!match) return 'Floor 1';
  if (/ground/i.test(location)) return 'Ground Floor';
  return `Floor ${match[1] ?? match[2]}`;
}

export function getUserInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function matchesFilter(space: Space, filter: FilterCategory) {
  if (filter === 'All Types') return true;
  return normalizeCategory(space.type) === filter;
}

export function matchesSearch(space: Space, query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return true;

  return (
    space.name.toLowerCase().includes(value) ||
    space.location.toLowerCase().includes(value) ||
    space.type.toLowerCase().includes(value)
  );
}
