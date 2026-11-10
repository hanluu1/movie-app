'use client';

import { useState } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase/client';
import { FeelingMoodSelect } from '@/components/ui/feeling-mood-select';

interface EditPostFormProps {
  postId: string;
  content: string;
  mood?: string[];
  imageUrl?: string | null;
  onCancel: () => void;
  onSave: () => void;
}

export const EditPostForm = ({ postId, content, mood = [], imageUrl, onCancel, onSave }: EditPostFormProps) => {
  const [editedContent, setEditedContent] = useState(content || '');
  const [editedMoods, setEditedMoods] = useState<string[]>(mood);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleUpdatePost = async () => {
    if (!editedContent.trim()) return;

    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSaving(false);
      return;
    }

    let newImageUrl: string | null | undefined = undefined;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('post-images').upload(path, imageFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
        newImageUrl = publicUrl;
      }
    } else if (removeImage) {
      newImageUrl = null;
    }

    const updatePayload: Record<string, unknown> = { content: editedContent, mood: editedMoods };
    if (newImageUrl !== undefined) updatePayload.image_url = newImageUrl;

    const { error } = await supabase
      .from('posts')
      .update(updatePayload)
      .eq('id', postId)
      .eq('user_id', user.id);

    if (!error) onSave();
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#8C7E6E]">
          Your reaction
        </label>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder="Edit your reaction..."
          rows={6}
          className="w-full px-4 py-3 border border-white/15 focus:border-[#F5A623]/60 bg-white/[0.06] rounded-xl text-sm text-[#EEEAE2] placeholder:text-[#B8AA98] outline-none transition-all resize-none leading-relaxed"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#8C7E6E]">
          How did it make you feel?
        </label>
        <FeelingMoodSelect value={editedMoods} onChange={setEditedMoods} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#8C7E6E]">
          Photo
        </label>
        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-white/15 h-48 w-full">
            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : imageUrl && !removeImage ? (
          <div className="relative rounded-xl overflow-hidden border border-white/15 h-48 w-full">
            <Image src={imageUrl} alt="Current photo" fill className="object-cover" sizes="700px" />
            <button
              type="button"
              onClick={() => setRemoveImage(true)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-white/15 rounded-xl cursor-pointer hover:border-[#F5A623]/50 transition-all bg-white/[0.04]">
            <span className="text-2xl">📷</span>
            <span className="text-xs text-[#8C7E6E]">{removeImage ? 'Add a new photo' : 'Click to upload a photo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#C8B8A2] bg-white/[0.06] border border-white/15 hover:bg-white/10 hover:text-[#EEEAE2] transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdatePost}
          disabled={isSaving || !editedContent.trim()}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#0A0908] bg-[#F5A623] hover:bg-[#FFC04D] transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
