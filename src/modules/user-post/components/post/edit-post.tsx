'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface EditPostFormProps {
  postId: string;
  title: string;
  content: string;
  imageUrl: string;
  onCancel: () => void;
  onSave: () => void;
}

export const EditPostForm = ({ postId, title, content, imageUrl, onCancel, onSave }: EditPostFormProps) => {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content || '');
  const [editedImageUrl, setEditedImageUrl] = useState(imageUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdatePost = async () => {
    if (!editedTitle.trim()) return;

    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      setIsSaving(false);
      return;
    }
    
    const { error } = await supabase
      .from('posts')
      .update({
        title: editedTitle,
        content: editedContent,
        image_url: editedImageUrl,
        
      })
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating post:', error);
    } else {
      onSave(); // Notify parent to refresh post
    }

    setIsSaving(false);
  };

  return (
    <div className="flex flex-col min-w-96 gap-4 mb-6 text-black">
      <input
        type="text"
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        placeholder="Edit title"
        className="border rounded p-2"
      />
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        placeholder="Edit content"
        className="border rounded p-2 h-32 resize-none"
      />
      <input
        type="text"
        value={editedImageUrl}
        onChange={(e) => setEditedImageUrl(e.target.value)}
        placeholder="Edit Image URL"
        className="border rounded p-2"
      />

      <div className="flex gap-2">
        <button
          onClick={handleUpdatePost}
          disabled={isSaving}
          className=" bg-[#cfcfcf] text-black px-4 py-2 rounded-lg hover:bg-gray-400 hover:text-white"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          onClick={onCancel}
          className="bg-[#cfcfcf] text-black  px-4 py-2 rounded-lg hover:bg-gray-400 hover:text-white"
        >
            Cancel
        </button>
      </div>
    </div>
  );
};
