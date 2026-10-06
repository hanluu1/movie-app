'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MOODS } from '@/lib/moods';

interface EditPostFormProps {
  postId: string;
  title: string;
  content: string;
  mood?: string[];
  onCancel: () => void;
  onSave: () => void;
}

export const EditPostForm = ({ postId, title, content, mood = [], onCancel, onSave }: EditPostFormProps) => {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content || '');
  const [editedMoods, setEditedMoods] = useState<string[]>(mood);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdatePost = async () => {
    if (!editedTitle.trim()) return;

    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from('posts')
      .update({ title: editedTitle, content: editedContent, mood: editedMoods })
      .eq('id', postId)
      .eq('user_id', user.id);

    if (!error) onSave();
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#8C7E6E]">
          Title
        </label>
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="Edit title"
          className="w-full px-4 py-3 border border-[#3A3530] focus:border-[#C8956A]/60 bg-[#272320] rounded-xl text-sm text-[#EEEAE2] placeholder:text-[#4A4038] outline-none transition-all"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#8C7E6E]">
          Your reaction
        </label>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder="Edit your reaction..."
          rows={6}
          className="w-full px-4 py-3 border border-[#3A3530] focus:border-[#C8956A]/60 bg-[#272320] rounded-xl text-sm text-[#EEEAE2] placeholder:text-[#4A4038] outline-none transition-all resize-none leading-relaxed"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#8C7E6E]">
          How did it make you feel?
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => setEditedMoods(prev =>
                prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
              )}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                editedMoods.includes(mood)
                  ? 'bg-[#C8956A] text-[#0A0908] border-[#C8956A]'
                  : 'border-[#3A3530] text-[#8C7E6E] hover:border-[#C8956A]/50 hover:text-[#C8956A]'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#C8B8A2] bg-[#272320] border border-[#3A3530] hover:bg-[#3A3530] hover:text-[#EEEAE2] transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdatePost}
          disabled={isSaving || !editedTitle.trim()}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#0A0908] bg-[#C8956A] hover:bg-[#D4A870] transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
