export const MOODS = [
  'Moved me to tears',
  'Mind-bending',
  'Still thinking about it',
  'Comforting',
  'Unsettling',
  'Pure joy',
  "Couldn't look away",
  'Broke my heart',
  'Changed how I see things',
  'Took me back',
  'Had me on the edge',
  'Left me inspired',
  'Genuinely scared me',
] as const;

export type Mood = typeof MOODS[number];

// The UI groups the 13 stored mood phrases into 6 feelings. Colour and emoji
// carry the meaning; the original phrase stays as secondary detail text.
export type FeelingKey = 'joy' | 'love' | 'sad' | 'scared' | 'hype' | 'mindblown';

export interface Feeling {
  key: FeelingKey;
  label: string;
  emoji: string;
  color: string;
}

export const FEELINGS: Record<FeelingKey, Feeling> = {
  joy: { key: 'joy', label: 'Joy', emoji: '😂', color: '#FFD83D' },
  love: { key: 'love', label: 'Love', emoji: '😍', color: '#FF4D9D' },
  sad: { key: 'sad', label: 'Sad', emoji: '😭', color: '#3D8BFF' },
  scared: { key: 'scared', label: 'Scared', emoji: '😱', color: '#A6FF3D' },
  hype: { key: 'hype', label: 'Hype', emoji: '🔥', color: '#FF5A36' },
  mindblown: { key: 'mindblown', label: 'Mind-blown', emoji: '🤯', color: '#9B6BFF' },
};

export const FEELING_LIST: Feeling[] = Object.values(FEELINGS);

const MOOD_TO_FEELING: Record<Mood, FeelingKey> = {
  'Pure joy': 'joy',
  'Comforting': 'joy',
  'Broke my heart': 'love',
  'Took me back': 'love',
  'Moved me to tears': 'sad',
  'Genuinely scared me': 'scared',
  'Unsettling': 'scared',
  'Had me on the edge': 'hype',
  "Couldn't look away": 'hype',
  'Left me inspired': 'hype',
  'Mind-bending': 'mindblown',
  'Changed how I see things': 'mindblown',
  'Still thinking about it': 'mindblown',
};

export const BRAND_COLOR = '#F5A623';

export function getFeeling (mood?: string | null): Feeling | null {
  if (!mood) return null;
  const key = MOOD_TO_FEELING[mood as Mood];
  return key ? FEELINGS[key] : null;
}

export function getMoodsForFeeling (key: FeelingKey): Mood[] {
  return MOODS.filter((m) => MOOD_TO_FEELING[m] === key);
}
