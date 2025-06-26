"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 페이지 로드 시 intro로 자동 리다이렉트
    router.push("/intro");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">
          Size Carton System
        </h1>
        <p className="text-gray-500">인트로 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
