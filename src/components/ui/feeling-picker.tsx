'use client';

import { FEELING_LIST, type FeelingKey } from '@/lib/moods';

interface FeelingPickerProps {
  active: FeelingKey | null;
  onChange: (key: FeelingKey | null) => void;
  layout?: 'row' | 'grid';
  // Row layout bleeds 16px past its parent so it can scroll edge to edge; turn off inside padded forms
  bleed?: boolean;
}

export function FeelingPicker ({ active, onChange, layout = 'row', bleed = true }: FeelingPickerProps) {
  const isGrid = layout === 'grid';

  return (
    <div
      role="group"
      aria-label="Filter by feeling"
      className={isGrid
        ? 'grid grid-cols-3 gap-2'
        : `scrollbar-none flex gap-3 overflow-x-auto py-3 ${bleed ? '-mx-4 px-4' : ''}`}
    >
      {FEELING_LIST.map((f) => {
        const isActive = active === f.key;
        return (
          <button
            key={f.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(isActive ? null : f.key)}
            className={`press group flex shrink-0 flex-col items-center gap-1.5 ${
              isGrid ? 'rounded-2xl border px-2 py-3' : 'w-16'
            }`}
            style={isGrid
              ? isActive
                ? { background: f.color, borderColor: f.color, color: '#0D0A08', boxShadow: `0 0 24px ${f.color}66` }
                : { background: `${f.color}12`, borderColor: `${f.color}33`, color: f.color }
              : undefined}
          >
            {isGrid ? (
              <span className="text-2xl leading-none">{f.emoji}</span>
            ) : (
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-all duration-200 group-hover:scale-105"
                style={{
                  background: isActive
                    ? `radial-gradient(circle at 30% 30%, ${f.color}, ${f.color}99)`
                    : `radial-gradient(circle at 30% 30%, ${f.color}40, ${f.color}14)`,
                  boxShadow: isActive ? `0 0 22px ${f.color}99` : `inset 0 0 0 1px ${f.color}44`,
                }}
              >
                {f.emoji}
              </span>
            )}
            <span
              className="text-[11px] font-bold leading-none"
              style={isGrid ? undefined : { color: isActive ? f.color : '#B8AA98' }}
            >
              {f.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
