'use client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PostForm } from '@/modules/user-post';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 w-[90%] max-w-xl mx-auto my-10 p-6 border border-gray-700 rounded-lg relative shadow-lg overflow-y-auto">
        <XMarkIcon
          onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 text-gray-500 cursor-pointer"
        />
        <div className='pt-4'><PostForm /></div>
        
      </div>
    </div>
  );
};