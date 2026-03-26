"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/lib/axios';

export default function VerifyEmail() {
  const { token } = useParams();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      try {
        await API.get(`/users/verify/${token}`);
        alert("Email verified!");
        router.push('/login');
      } catch (err) {
        alert("Verification failed");
      }
    };
    if (token) verify();
  }, [token, router]);

  return <div className="p-10 text-center">Verifying your email, please wait...</div>;
}