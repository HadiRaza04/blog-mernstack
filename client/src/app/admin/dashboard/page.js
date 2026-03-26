"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/axios';
import { Edit, Trash2, Plus, MessageSquare, Heart, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // We send 'all=true' to trigger the backend logic to show unpublished posts
      const { data } = await API.get('/posts?all=true');
      setPosts(data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      const { data } = await API.patch(`/posts/${id}/status`);
      // Update local state so UI reflects change immediately
      setPosts(posts.map(p => p._id === id ? { ...p, isPublished: data.isPublished } : p));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Permanently delete this blog?")) {
      try {
        await API.delete(`/posts/${id}`);
        setPosts(posts.filter(p => p._id !== id));
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  if (loading) return <div className="p-20 text-center">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Content Manager</h1>
        <button 
          onClick={() => router.push('/admin/create')}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center font-semibold hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" /> New Post
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Post</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Engagement</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img src={post.images?.[0]} className="w-10 h-10 rounded object-cover" alt="" />
                    <span className="font-medium text-gray-800 line-clamp-1">{post.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3 text-gray-500 text-sm">
                    <span className="flex items-center"><Heart className="w-4 h-4 mr-1" /> {post.likes?.length}</span>
                    <span className="flex items-center"><MessageSquare className="w-4 h-4 mr-1" /> {post.comments?.length}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {/* Status Dropdown / Toggle Button */}
                  <button 
                    onClick={() => handleStatusToggle(post._id)}
                    className={`flex items-center px-3 py-1 rounded-full text-xs font-bold transition ${
                      post.isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {post.isPublished ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Published</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Draft</>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => router.push(`/admin/edit/${post._id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(post._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}