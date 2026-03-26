"use client";
import { useState } from 'react';
import API from '@/lib/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users/forgotpassword', { email });
      alert("Reset link sent to your email.");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-8 border rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
        <input type="email" placeholder="Enter your email" className="w-full p-2 border mb-4" 
          onChange={(e) => setEmail(e.target.value)} required />
        <button className="w-full bg-black text-white p-2 rounded">Send Reset Link</button>
      </form>
    </div>
  );
}