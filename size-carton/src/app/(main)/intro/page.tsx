"use client";

import React from "react";
import Image from "next/image";

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  효율적인
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {" "}
                    데이터 관리
                  </span>
                  <br />
                  솔루션
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  정임이 회사의 엑셀 데이터를 효율적으로 관리하고
                  <br />
                  업무 생산성을 극대화하는 스마트한 웹 플랫폼입니다.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                  <div className="text-blue-600 mb-2">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">빠른 처리</h3>
                  <p className="text-sm text-gray-600">실시간 데이터 처리</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                  <div className="text-green-600 mb-2">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">안전한 저장</h3>
                  <p className="text-sm text-gray-600">데이터 보안 보장</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                  시작하기
                </button>
                <button className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 border border-gray-200 hover:shadow-lg">
                  더 알아보기
                </button>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 shadow-2xl">
                {/* Main user image */}
                <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg relative">
                  <Image
                    src="/Images/IMG_5125.JPG"
                    alt="Size Carton System"
                    fill
                    style={{ objectFit: "cover" }}
                    className="hover:scale-105 transition-transform duration-300"
                    priority
                  />
                  {/* Overlay for better text readability if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-indigo-500 rounded-full opacity-60"></div>

                {/* Floating badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">
                      활성 상태
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              왜 우리 플랫폼을 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              정임이 회사의 업무 효율성을 극대화하는 핵심 기능들을 만나보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                간편한 업로드
              </h3>
              <p className="text-gray-600">
                드래그 앤 드롭으로 엑셀 파일을 쉽게 업로드하고, 실시간으로
                데이터를 확인할 수 있습니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                스마트 관리
              </h3>
              <p className="text-gray-600">
                체계적인 데이터 분류와 검색 기능으로 원하는 정보를 빠르게 찾을
                수 있습니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                실시간 분석
              </h3>
              <p className="text-gray-600">
                업로드된 데이터를 실시간으로 분석하고 직관적인 시각화로
                인사이트를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section for User Photos */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              함께하는 순간들
            </h2>
            <p className="text-xl text-gray-600">
              정임이 회사와 함께하는 소중한 추억들을 공유합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Photo Card 1 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src="/Images/IMG_5125.JPG"
                  alt="특별한 순간"
                  fill
                  style={{ objectFit: "cover" }}
                  className="hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  특별한 순간
                </h3>
                <p className="text-gray-600">
                  소중한 추억과 함께하는 아름다운 순간들을 담았습니다.
                </p>
              </div>
            </div>

            {/* Photo Card 2 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="font-medium">사진 2</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  소중한 추억
                </h3>
                <p className="text-gray-600">
                  여기에 사진과 관련된 설명을 추가해주세요
                </p>
              </div>
            </div>

            {/* Photo Card 3 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="font-medium">사진 3</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  함께한 시간
                </h3>
                <p className="text-gray-600">
                  여기에 사진과 관련된 설명을 추가해주세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            효율적인 데이터 관리로 업무 생산성을 향상시키세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg">
              엑셀 파일 업로드
            </button>
            <button className="bg-blue-800/50 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-800/70 transition-all duration-200 border border-blue-400">
              데이터 보기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
