"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/axios';
import Link from 'next/link';

export default function PostCard({ post }) {
  const router = useRouter();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false); // Initial state should ideally come from backend

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const { data } = await API.post(`/posts/${post._id}/like`);
      setLikes(data.likes);
      setIsLiked(data.isLiked);
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleCommentRedirect = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      router.push(`/blog/${post._id}`); // Go to detail page to comment
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 5-Image Logic: Show the first image as thumbnail */}
      {post.images && post.images.length > 0 && (
        <img 
          src={post.images[0]} 
          alt={post.title} 
          className="w-full h-52 object-cover"
        />
      )}

      <div className="p-5">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
          {post.category}
        </span>
        <h2 className="text-xl font-bold mt-2 mb-3 text-gray-800 line-clamp-1">
          {post.title}
        </h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {post.content}
        </p>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex space-x-4">
            {/* Like Button */}
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likes}</span>
            </button>

            {/* Comment Button */}
            <button 
              onClick={handleCommentRedirect}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.827-1.213L3 21l1.657-4.51C3.438 15.024 3 13.568 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>

          <Link href={`/blog/${post._id}`} className="text-sm font-bold text-gray-900 hover:underline">
            Read Full →
          </Link>
        </div>
      </div>
    </div>
  );
}