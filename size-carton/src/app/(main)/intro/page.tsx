"use client";

import React from "react";

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            서비스 이용 방법
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            간단한 3단계로 엑셀 데이터를 효율적으로 관리해보세요
          </p>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    엑셀 파일 업로드
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  관리하고 싶은 엑셀 파일을 업로드하세요. 드래그 앤 드롭으로
                  쉽게 파일을 선택할 수 있습니다.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Excel (.xlsx, .xls) 파일 지원</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>최대 10MB 파일 크기 지원</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>안전한 데이터 암호화</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                    <p className="text-gray-600 font-medium">
                      엑셀 파일을 여기에 끌어놓으세요
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      또는 클릭하여 파일 선택
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex justify-center">
              <div className="w-px h-16 bg-gradient-to-b from-gray-300 to-transparent"></div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    데이터 목록 조회
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  업로드된 제품 정보를 테이블 형태로 확인하고, 각 제품의 상세
                  정보를 검토할 수 있습니다.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>제품별 상세 정보 표시</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>CONDENSER/EVAPORATOR 구분</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>치수, 무게, CBM 정보</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <h3 className="font-semibold text-gray-900">
                        데이터 테이블
                      </h3>
                      <span className="text-sm text-gray-500">총 24건</span>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <div>제품명</div>
                        <div>타입</div>
                        <div>치수(mm)</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 p-3 border-b border-gray-100">
                        <div>AIR-001</div>
                        <div>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            CONDENSER
                          </span>
                        </div>
                        <div>1200×800×500</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 p-3 border-b border-gray-100">
                        <div>AIR-001</div>
                        <div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            EVAPORATOR
                          </span>
                        </div>
                        <div>1100×700×450</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 p-3 border-b border-gray-100">
                        <div>AIR-002</div>
                        <div>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            CONDENSER
                          </span>
                        </div>
                        <div>1400×900×600</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex justify-center">
              <div className="w-px h-16 bg-gradient-to-b from-gray-300 to-transparent"></div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    컨테이너 적재 최적화
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  제품을 선택하고 컨테이너 타입을 설정하여 최적의 적재 방법을
                  시뮬레이션할 수 있습니다.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>20ft, 40ft 컨테이너 지원</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>3D 적재 시뮬레이션</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>적재율 및 효율성 분석</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-3">
                      컨테이너 적재 시뮬레이션
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6">
                        {/* 컨테이너 모형 */}
                        <div className="relative bg-white rounded border-2 border-blue-300 h-32 p-2">
                          {/* 적재된 제품들을 나타내는 박스들 */}
                          <div className="absolute top-2 left-2 w-6 h-6 bg-red-400 rounded-sm shadow-sm"></div>
                          <div className="absolute top-2 left-10 w-6 h-6 bg-blue-400 rounded-sm shadow-sm"></div>
                          <div className="absolute top-2 left-18 w-6 h-6 bg-green-400 rounded-sm shadow-sm"></div>
                          <div className="absolute top-10 left-2 w-6 h-6 bg-yellow-400 rounded-sm shadow-sm"></div>
                          <div className="absolute top-10 left-10 w-6 h-6 bg-purple-400 rounded-sm shadow-sm"></div>
                          <div className="absolute top-10 left-18 w-6 h-6 bg-orange-400 rounded-sm shadow-sm"></div>

                          {/* 컨테이너 라벨 */}
                          <div className="absolute bottom-1 right-2 text-xs text-blue-600 font-medium">
                            40ft Container
                          </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-3">
                          제품 적재 배치도
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            지금 시작해보세요!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            3단계로 간편하게 데이터를 관리하고 컨테이너 적재를 최적화해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg">
              엑셀 업로드 시작하기
            </button>
            <button className="bg-blue-800/50 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-800/70 transition-all duration-200 border border-blue-400">
              적재 최적화 보기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
