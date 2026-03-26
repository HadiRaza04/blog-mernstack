"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/lib/axios';

export default function EditPost() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await API.get(`/posts/${id}`);
      setFormData({ title: data.title, content: data.content, category: data.category });
    };
    fetchPost();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/posts/${id}`, formData);
      alert("Updated successfully!");
      router.push('/admin/dashboard');
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input 
          className="w-full p-3 border rounded" 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
        />
        <textarea 
          className="w-full p-3 border rounded h-40" 
          value={formData.content} 
          onChange={(e) => setFormData({...formData, content: e.target.value})} 
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Save Changes</button>
      </form>
    </div>
  );
}