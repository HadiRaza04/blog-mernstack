"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/lib/axios';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const { token } = useParams();
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/users/resetpassword/${token}`, { password });
      alert("Password reset successful!");
      router.push('/login');
    } catch (err) {
      alert("Invalid or expired token");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleReset} className="p-8 border rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Set New Password</h2>
        <input type="password" placeholder="New Password" className="w-full p-2 border mb-4" 
          onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Update Password</button>
      </form>
    </div>
  );
}