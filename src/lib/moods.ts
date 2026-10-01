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
