"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/axios';
import { ImagePlus, X, Send, Loader2 } from 'lucide-react';

export default function CreatePost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Technology',
    isPublished: false
  });
  const [images, setImages] = useState([]); // Selected files
  const [previews, setPreviews] = useState([]); // For UI display

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert("You can only upload up to 5 images.");
      return;
    }

    setImages([...images, ...files]);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  // Remove selected image before upload
  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('category', formData.category);
    data.append('isPublished', formData.isPublished);

    // Append all selected images
    images.forEach((image) => {
      data.append('images', image);
    });

    try {
      await API.post('/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Post created successfully!");
      router.push('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
        <p className="text-gray-500">Fill in the details and upload up to 5 images.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title</label>
          <input 
            type="text"
            required
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Enter an engaging title..."
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select 
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Coding">Coding</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <div className="flex items-center space-x-4 p-3 border border-gray-100 rounded-xl bg-gray-50">
               <input 
                type="checkbox" 
                id="publish"
                className="w-5 h-5 accent-blue-600"
                onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
               />
               <label htmlFor="publish" className="text-sm text-gray-600 font-medium cursor-pointer">Publish immediately?</label>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Images (Max 5)</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative group h-24 w-full">
                <img src={src} className="h-full w-full object-cover rounded-lg border shadow-sm" alt="preview" />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center h-24 w-full border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] text-gray-400 mt-1">Add Image</span>
                <input type="file" multiple hidden onChange={handleImageChange} accept="image/*" />
              </label>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
          <textarea 
            required
            rows="10"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Tell your story..."
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 disabled:bg-blue-300 transition shadow-lg shadow-blue-100"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          <span>{loading ? "Uploading to Cloudinary..." : "Publish Blog Post"}</span>
        </button>
      </form>
    </div>
  );
}