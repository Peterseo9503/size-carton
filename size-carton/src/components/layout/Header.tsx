"use client";
import { useRouter } from "next/navigation";
import React from "react";

interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export default function Header({ title, rightElement }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="w-full h-20 flex items-center justify-between px-8 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg border-b border-blue-800/20">
      {/* Left Side - Logo/Title */}
      <div
        className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:scale-105"
        onClick={() => router.push("/intro")}
      >
        {/* Logo Icon */}
        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-200">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0h3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight group-hover:text-blue-100 transition-colors duration-200">
            {title}
          </h1>
          <p className="text-blue-100/70 text-sm font-medium">
            Size Carton System
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {rightElement}

        {/* User Profile Section */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-3.5-3.5a8.038 8.038 0 01-1.5-4.5V7a6 6 0 00-6-6v0a6 6 0 00-6 6v2c0 1.692-.558 3.346-1.5 4.5L1 17h5m8 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-700"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full pl-3 pr-4 py-2 hover:bg-white/20 transition-all duration-200 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Admin</span>
            <svg
              className="w-4 h-4 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
