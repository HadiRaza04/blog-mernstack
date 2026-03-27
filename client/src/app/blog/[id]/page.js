"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns'; // Optional: npm install date-fns

export default function BlogDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await API.get(`/posts/${id}`);
        setPost(data);
      } catch (err) {
        console.error("Post not found");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const { data } = await API.post(`/posts/${id}/comment`, { content: comment });
      setPost({ ...post, comments: data.comments }); // Update UI with new comment
      setComment('');
    } catch (err) {
      alert("Failed to post comment");
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!post) return <div className="p-20 text-center">Post not found.</div>;

  return (
    <>
    <button 
  onClick={() => router.back()} 
  className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition font-medium"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
  Back to Feed
</button>
    
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      {/* 1. 5-Image Gallery Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
        {post.images?.map((img, index) => (
          <div key={index} className={`${index === 0 ? 'col-span-2 row-span-2' : 'col-span-1'}`}>
            <a href={img} target='_blank' rel="noopener noreferrer">
              <img 
                src={img} 
                alt={`Slide ${index}`} 
                className="w-full h-full object-cover rounded-lg shadow-sm"
              />
            </a>
          </div>
        ))}
      </div>

      {/* 2. Blog Content */}
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-500 text-sm space-x-4">
          <span>By <span className="font-bold text-gray-800">{post.user?.name || 'Admin'}</span></span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs uppercase">{post.category}</span>
        </div>
      </header>

      <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed border-b pb-10">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        {/* {post.content} */}
      </article>

      {/* 3. Comments Section */}
      <section className="mt-10">
        <h3 className="text-2xl font-bold mb-6">Comments ({post.comments?.length || 0})</h3>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-10">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Write a comment..."
            rows="3"
            required
          ></textarea>
          <button className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            Post Comment
          </button>
        </form>

        {/* Comment List */}
        <div className="space-y-6">
          {post.comments?.length > 0 ? (
            post.comments.map((c) => (
              <div key={c._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-400">
                    {/* Shows "2 mins ago" etc. */}
                    {formatDistanceToNow(new Date(c.createdAt))} ago
                  </span>
                </div>
                <p className="text-gray-700">{c.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet. Be the first to join the conversation!</p>
          )}
        </div>
      </section>
    </div>
    </>
  );
}