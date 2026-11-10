'use client';

import { FeelingPicker } from './feeling-picker';
import { getFeeling, getMoodsForFeeling, type FeelingKey } from '@/lib/moods';

interface FeelingMoodSelectProps {
  value: string[];
  onChange: (moods: string[]) => void;
}

// Pick one of 6 feelings, then optionally the exact phrase. The stored value is still the phrase.
export function FeelingMoodSelect ({ value, onChange }: FeelingMoodSelectProps) {
  const feeling = getFeeling(value[0]);
  const phrases = feeling ? getMoodsForFeeling(feeling.key) : [];

  const handlePick = (key: FeelingKey | null) => {
    onChange(key ? [getMoodsForFeeling(key)[0]] : []);
  };

  return (
    <div className="flex flex-col gap-2">
      <FeelingPicker active={feeling?.key ?? null} onChange={handlePick} bleed={false} />

      {feeling && (
        <div role="group" aria-label="Say it more exactly" className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#B8AA98]">Exactly:</span>
          {phrases.map((phrase) => {
            const isOn = value[0] === phrase;
            return (
              <button
                key={phrase}
                type="button"
                aria-pressed={isOn}
                onClick={() => onChange([phrase])}
                className="press rounded-full border px-3 py-1.5 text-xs font-bold transition-all"
                style={isOn
                  ? { background: feeling.color, borderColor: feeling.color, color: '#0D0A08' }
                  : { background: `${feeling.color}12`, borderColor: `${feeling.color}44`, color: feeling.color }}
              >
                {phrase}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
