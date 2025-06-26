// src/app/(main)/layout.tsx
"use client";

import Header from "@/components/layout/Header";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/excel",
      label: "엑셀파일등록",
      icon: (
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      href: "/dataList",
      label: "데이터리스트",
      icon: (
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
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10V9a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      href: "/dataVisualization",
      label: "컨테이너최적화",
      icon: (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Header
        title="조미❤️동현"
        rightElement={
          <nav className="flex items-center gap-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-white/20 text-white shadow-lg transform scale-105"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:scale-105"
                    }
                  `}
                >
                  <span
                    className={`transition-transform duration-200 ${
                      isActive ? "scale-110" : ""
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="hidden sm:inline font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-white/20 mx-2"></div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group">
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group">
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </button>
            </div>
          </nav>
        }
      />
      <main className="min-h-screen">{children}</main>
    </>
  );
}
