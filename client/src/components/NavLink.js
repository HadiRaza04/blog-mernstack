"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }) {
  const pathname = usePathname();

  // Check if this link is active
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-3 py-2  ${
        isActive ? "border-b-2 border-blue-500 text-black" : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </Link>
  );
}