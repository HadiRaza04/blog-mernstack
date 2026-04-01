"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/axios";
import { ToastContainer, toast } from 'react-toastify';
import {
  ImagePlus,
  X,
  Send,
  Loader2,
  Bold,
  Italic,
  Underline,
  Link,
  List,
} from "lucide-react";

export default function CreatePost() {
  const notifyError = (msg) => {
    toast.error(msg);
  };
  const notifySuccess = (msg) => {
    toast.success(msg);
  };
  const router = useRouter();
  const editorRef = useRef(null); // Reference for our custom editor
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Technology",
    isPublished: false,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // --- Custom Editor Logic ---
  const handleFormat = (command, value = null) => {
    // Focus editor and execute native browser command
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  // const handleLink = () => {
  //   const url = prompt("Enter the URL (e.g., https://google.com):");
  //   if (url){
  //     handleFormat('createLink', url);
  //   }
  // };
  const handleLink = () => {
    const url = prompt("Enter the URL (e.g., https://google.com):");

    if (url) {
      // 1. Pehle normal link create karein
      handleFormat("createLink", url);

      // 2. Ab selection check karein aur target attribute add karein
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const container = selection.getRangeAt(0).startContainer;
        // Agar node text node hai to uska parent (<a>) pakrein
        const parentElement =
          container.nodeType === 3 ? container.parentNode : container;

        if (parentElement.tagName === "A") {
          parentElement.setAttribute("target", "_blank");
          parentElement.setAttribute("rel", "noopener noreferrer"); // Security ke liye zaroori hai

          // Editor mein link nazar aaye isliye blue color aur underline manually add karein
          parentElement.style.color = "#2563eb";
          parentElement.style.textDecoration = "underline";
        }
      }
    }
  };

  // --- Existing Image Logic ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      notifyError("You can only upload up to 5 images.");
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    // GET HTML CONTENT FROM DIV INSTEAD OF TEXTAREA
    data.append("content", editorRef.current.innerHTML);
    data.append("category", formData.category);
    data.append("isPublished", formData.isPublished);

    images.forEach((image) => {
      data.append("images", image);
    });

    try {
      await API.post("/posts", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notifySuccess("Post created successfully!");
      router.push("/admin/dashboard");
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <ToastContainer />
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
        <p className="text-gray-500">
          Add formatted content and up to 5 images.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Blog Title
          </label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Enter an engaging title..."
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Coding">Coding</option>
              <option value="Business">Business</option>
            </select>
          </div> */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>

            <select
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={
                ["Technology", "Lifestyle", "Coding", "Business"].includes(
                  formData.category,
                )
                  ? formData.category
                  : ""
              }
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Coding">Coding</option>
              <option value="Business">Business</option>
            </select>

            {/* Custom input */}
            <input
              type="text"
              placeholder="Or write your own category..."
              className="w-full mt-3 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />
          </div>
          <div className="flex items-center space-x-4 p-3 border border-gray-100 rounded-xl bg-gray-50 mt-7">
            <input
              type="checkbox"
              id="publish"
              className="w-5 h-5 accent-blue-600"
              onChange={(e) =>
                setFormData({ ...formData, isPublished: e.target.checked })
              }
            />
            <label
              htmlFor="publish"
              className="text-sm text-gray-600 font-medium cursor-pointer"
            >
              Publish immediately?
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Images (Max 5)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative group h-24 w-full">
                <img
                  src={src}
                  className="h-full w-full object-cover rounded-lg border shadow-sm"
                  alt="preview"
                />
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
              <label className="flex flex-col items-center justify-center h-24 w-full border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition text-gray-400">
                <ImagePlus size={20} />
                <span className="text-[10px] mt-1 font-medium">Add Image</span>
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>
            )}
          </div>
        </div>

        {/* --- CUSTOM TEXT EDITOR --- */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Content
          </label>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
              <button
                type="button"
                onClick={() => handleFormat("bold")}
                className="p-2 hover:bg-white hover:shadow-sm rounded transition"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleFormat("italic")}
                className="p-2 hover:bg-white hover:shadow-sm rounded transition"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleFormat("underline")}
                className="p-2 hover:bg-white hover:shadow-sm rounded transition"
                title="Underline"
              >
                <Underline size={18} />
              </button>
              <button
                type="button"
                onClick={handleLink}
                className="p-2 hover:bg-white hover:shadow-sm rounded transition"
                title="Add Link"
              >
                <Link size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleFormat("insertUnorderedList")}
                className="p-2 hover:bg-white hover:shadow-sm rounded transition"
                title="List"
              >
                <List size={18} />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => handleFormat("formatBlock", "H2")}
                className="p-2 hover:bg-white hover:shadow-sm rounded transition text-xs font-bold"
              >
                H2
              </button>
            </div>

            {/* Editable Area */}
            <div
              ref={editorRef}
              contentEditable={true}
              className="w-full min-h-[300px] p-4 outline-none prose max-w-none text-gray-800"
              placeholder="Start writing your story..."
            ></div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 disabled:bg-blue-300 transition shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span>
            {loading ? "Uploading to Cloudinary..." : "Publish Blog Post"}
          </span>
        </button>
      </form>
    </div>
  );
}
