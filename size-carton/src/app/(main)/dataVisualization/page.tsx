"use client";

import React, { useState, useEffect } from "react";

interface Product {
  id: number;
  productname: string;
  type: "CONDENSER" | "EVAPORATOR";
  width: number;
  height: number;
  length: number;
  weight: number;
  cbm: number;
  selected?: boolean;
  quantity?: number;
  displayIndex?: number;
}

interface Container {
  type: "20ft" | "40ft";
  internal: {
    width: number;
    height: number;
    length: number;
    volume: number;
  };
}

interface LoadedItem {
  product: Product;
  position: { x: number; y: number; z: number };
  rotation: number;
}

export default function DataVisualizationPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<"20ft" | "40ft">(
    "20ft"
  );
  const [optimizedLoad, setOptimizedLoad] = useState<LoadedItem[]>([]);
  const [loadingOptimization, setLoadingOptimization] = useState(false);

  // Container specifications (high-cube containers)
  const containers: Record<string, Container> = {
    "20ft": {
      type: "20ft",
      internal: { width: 2350, height: 2695, length: 5900, volume: 37.3 },
    },
    "40ft": {
      type: "40ft",
      internal: { width: 2350, height: 2695, length: 12032, volume: 76.3 },
    },
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-products");
      const result = await res.json();

      if (res.ok && result.data) {
        const productsWithSelection = result.data.map((product: Product) => ({
          ...product,
          selected: false,
          quantity: 0,
        }));
        setProducts(productsWithSelection);
        setHasData(result.data.length > 0);
      } else {
        alert("데이터 조회 실패: " + (result.error || "알 수 없는 오류"));
        setHasData(false);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("데이터 조회 중 오류가 발생했습니다.");
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  // 제품 선택/해제
  const toggleProductSelection = (productId: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              selected: !product.selected,
              quantity: product.selected ? 0 : 1,
            }
          : product
      )
    );
  };

  // 제품 수량 변경
  const updateProductQuantity = (productId: number, quantity: number) => {
    const validQuantity = Math.max(0, quantity);
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, quantity: validQuantity, selected: validQuantity > 0 }
          : product
      )
    );
  };

  // 선택된 제품 업데이트 (수량 기반으로 확장)
  useEffect(() => {
    const expandedProducts: Product[] = [];
    products.forEach((product) => {
      if (product.selected && product.quantity && product.quantity > 0) {
        for (let i = 0; i < product.quantity; i++) {
          expandedProducts.push({
            ...product,
            id: product.id * 1000 + i, // 고유 ID 생성
          });
        }
      }
    });
    setSelectedProducts(expandedProducts);
  }, [products]);

  // 전체 선택/해제
  const toggleAllSelection = () => {
    const allSelected = products.every((product) => product.selected);
    setProducts((prev) =>
      prev.map((product) => ({
        ...product,
        selected: !allSelected,
        quantity: !allSelected ? 1 : 0,
      }))
    );
  };

  // 컨테이너 적재 최적화 알고리즘
  const optimizeLoading = () => {
    if (selectedProducts.length === 0) {
      alert("최소 1개 이상의 제품을 선택해주세요.");
      return;
    }

    // 기존 적재 결과 초기화
    setOptimizedLoad([]);
    setLoadingOptimization(true);

    setTimeout(() => {
      const container = containers[selectedContainer];
      const usableSpace = {
        width: container.internal.width * 0.95,
        height: container.internal.height * 0.95,
        length: container.internal.length * 0.95,
      };

      const loaded: LoadedItem[] = [];
      let currentX = 0;
      const currentY = 0;
      let currentZ = 0;
      let maxHeightInRow = 0;

      // 선택된 모든 제품을 순서대로 배치 (수량만큼 확장된 배열 사용)
      // 1. 무게 기준으로 정렬 (무거운 것을 아래로)
      // 2. 에바포레이터를 앞쪽에 우선 배치
      const sortedProducts = [...selectedProducts].sort((a, b) => {
        // 먼저 타입별로 정렬 (EVAPORATOR가 앞으로)
        if (a.type !== b.type) {
          return a.type === "EVAPORATOR" ? -1 : 1;
        }
        // 같은 타입 내에서는 무게 기준 정렬 (무거운 것이 먼저)
        return b.weight - a.weight;
      });

      sortedProducts.forEach((product, index) => {
        // 공간 체크 - 더 유연한 배치
        if (currentX + product.width > usableSpace.width) {
          currentX = 0;
          currentZ += maxHeightInRow;
          maxHeightInRow = 0;
        }

        // 컨테이너 길이 초과 시 다음 층으로 (높이 방향)
        if (currentZ + product.length > usableSpace.length) {
          // 새로운 층 시작
          currentX = 0;
          currentZ = 0;
          // Y축으로 쌓기 (실제로는 시각화에서만 구분)
        }

        // 모든 제품을 같은 높이에 배치하되, 시각적으로 구분
        const position = {
          x: currentX,
          y: currentY,
          z: currentZ,
        };

        loaded.push({
          product: {
            ...product,
            displayIndex: index + 1, // 표시용 순번 추가
          },
          position,
          rotation: 0,
        });

        currentX += product.width + 80; // 간격을 80mm로 줄여서 더 많이 배치
        maxHeightInRow = Math.max(maxHeightInRow, product.length + 120);
      });

      setOptimizedLoad(loaded);
      setLoadingOptimization(false);
    }, 1000);
  };

  // 최대 적재 가능 개수 계산
  const calculateMaxCapacity = () => {
    if (selectedProducts.length === 0) return null;

    const container = containers[selectedContainer];
    const usableSpace = {
      width: container.internal.width * 0.95,
      height: container.internal.height * 0.95,
      length: container.internal.length * 0.95,
      volume: container.internal.volume * 0.95,
    };

    // 각 제품별 최대 개수 계산
    const capacityByProduct = selectedProducts.map((product) => {
      // 부피 기준 계산
      const maxByVolume = Math.floor(usableSpace.volume / product.cbm);

      // 공간 배치 기준 계산 (간단한 직육면체 배치)
      const unitsInWidth = Math.floor(usableSpace.width / product.width);
      const unitsInLength = Math.floor(usableSpace.length / product.length);
      const unitsInHeight = Math.floor(usableSpace.height / product.height);
      const maxBySpace = unitsInWidth * unitsInLength * unitsInHeight;

      // 더 제한적인 값 선택
      const maxCapacity = Math.min(maxByVolume, maxBySpace);

      return {
        product,
        maxCapacity,
        maxByVolume,
        maxBySpace,
      };
    });

    return capacityByProduct;
  };

  // 적재율 계산
  const calculateLoadingStats = () => {
    if (optimizedLoad.length === 0) return null;

    const totalVolume = optimizedLoad.reduce(
      (sum, item) => sum + item.product.cbm,
      0
    );
    const totalWeight = optimizedLoad.reduce(
      (sum, item) => sum + item.product.weight,
      0
    );
    const containerVolume = containers[selectedContainer].internal.volume;
    const volumeRatio = (totalVolume / containerVolume) * 100;

    return {
      totalItems: optimizedLoad.length,
      totalVolume: totalVolume.toFixed(2),
      totalWeight: totalWeight.toFixed(1),
      volumeRatio: volumeRatio.toFixed(1),
      efficiency:
        volumeRatio > 90 ? "최적" : volumeRatio > 70 ? "양호" : "개선필요",
    };
  };

  // 컨테이너 타입 변경 시 기존 적재 결과 초기화
  const handleContainerChange = (containerType: "20ft" | "40ft") => {
    setSelectedContainer(containerType);
    setOptimizedLoad([]); // 기존 적재 결과 초기화
  };

  const stats = calculateLoadingStats();
  const maxCapacities = calculateMaxCapacity();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                컨테이너 적재 최적화
              </h1>
              <p className="text-gray-600">
                제품을 선택하고 컨테이너 적재를 최적화하여 효율적인 운송 계획을
                수립하세요.
              </p>
            </div>
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  데이터 로딩중...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  제품 데이터 로드
                </>
              )}
            </button>
          </div>
        </div>

        {hasData && (
          <>
            {/* Product Selection Section */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Product List */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                      제품 선택
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        총 {selectedProducts.length}개 (
                        {products.filter((p) => p.selected).length}종류)
                      </span>
                      <button
                        onClick={toggleAllSelection}
                        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                      >
                        {products.every((p) => p.selected)
                          ? "전체 해제"
                          : "전체 선택"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          product.selected
                            ? "border-blue-400 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={product.selected || false}
                              onChange={() =>
                                toggleProductSelection(product.id)
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {product.productname}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.width}×{product.height}×
                                {product.length}mm | {product.weight}kg |{" "}
                                {product.cbm}m³
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Quantity Input */}
                            {product.selected && (
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">
                                  수량:
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="999"
                                  value={product.quantity || 1}
                                  onChange={(e) =>
                                    updateProductQuantity(
                                      product.id,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <span className="text-sm text-gray-500">
                                  개
                                </span>
                              </div>
                            )}

                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.type === "CONDENSER"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {product.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Control Panel */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  컨테이너 설정
                </h3>

                {/* Container Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    컨테이너 타입
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(containers).map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          handleContainerChange(type as "20ft" | "40ft")
                        }
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedContainer === type
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {containers[selectedContainer].internal.width}×
                    {containers[selectedContainer].internal.height}×
                    {containers[selectedContainer].internal.length}mm
                  </div>
                </div>

                {/* Selected Products Summary */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선택된 제품 (총 {selectedProducts.length}개)
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {selectedProducts.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        선택된 제품이 없습니다
                      </p>
                    ) : (
                      // 제품별로 그룹핑해서 표시
                      Object.entries(
                        products
                          .filter((p) => p.selected)
                          .reduce((acc, product) => {
                            const key = `${product.productname}_${product.type}`;
                            acc[key] = {
                              product,
                              count: product.quantity || 0,
                            };
                            return acc;
                          }, {} as Record<string, { product: Product; count: number }>)
                      ).map(([key, { product, count }]) => (
                        <div
                          key={key}
                          className="text-xs text-gray-600 mb-1 flex justify-between items-center"
                        >
                          <span>
                            • {product.productname} ({product.type})
                          </span>
                          <span className="font-medium text-blue-600">
                            {count}개
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Max Capacity Analysis */}
                {maxCapacities && maxCapacities.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📊 최대 적재 가능 개수
                    </label>
                    <div className="bg-blue-50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                      {maxCapacities.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-md p-2 shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {item.product.productname}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.product.type}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {item.maxCapacity}개
                              </div>
                              <div className="text-xs text-gray-500">
                                최대 가능
                              </div>
                            </div>
                          </div>

                          {/* Detail breakdown */}
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-gray-600">
                                부피 기준:{" "}
                                <span className="font-medium">
                                  {item.maxByVolume}개
                                </span>
                              </div>
                              <div className="text-gray-600">
                                공간 기준:{" "}
                                <span className="font-medium">
                                  {item.maxBySpace}개
                                </span>
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              💡 더 제한적인 조건이 최대 개수를 결정합니다
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Summary */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md p-3 mt-3">
                        <div className="text-sm font-medium">
                          🎯 최적 적재 전략
                        </div>
                        <div className="text-xs mt-1 opacity-90">
                          각 제품의 최대 개수를 참고하여 효율적인 조합을
                          선택하세요!
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optimize Button */}
                <button
                  onClick={optimizeLoading}
                  disabled={
                    loadingOptimization || selectedProducts.length === 0
                  }
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loadingOptimization ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      최적화 중...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
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
                      적재 최적화 실행
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {stats && (
              <>
                {/* Stats Dashboard */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    적재 분석 결과
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalItems}
                      </div>
                      <div className="text-sm text-blue-600">적재 품목</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.totalVolume}m³
                      </div>
                      <div className="text-sm text-green-600">총 부피</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.totalWeight}kg
                      </div>
                      <div className="text-sm text-purple-600">총 무게</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.volumeRatio}%
                      </div>
                      <div className="text-sm text-orange-600">적재율</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div
                        className={`text-2xl font-bold ${
                          stats.efficiency === "최적"
                            ? "text-green-600"
                            : stats.efficiency === "양호"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {stats.efficiency}
                      </div>
                      <div className="text-sm text-gray-600">효율성</div>
                    </div>
                  </div>
                </div>

                {/* 3D Visualization */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedContainer} 컨테이너 적재 시뮬레이션
                  </h3>

                  <div className="relative bg-blue-50 rounded-lg p-8 min-h-[500px] overflow-hidden">
                    {/* Container Outline */}
                    <div className="absolute inset-4 border-2 border-blue-300 rounded-lg bg-white/50">
                      <div className="absolute top-2 left-2 text-xs text-blue-600 font-medium">
                        {containers[selectedContainer].internal.width} ×{" "}
                        {containers[selectedContainer].internal.height} ×{" "}
                        {containers[selectedContainer].internal.length} mm
                      </div>

                      {/* Loading Visualization */}
                      <div className="relative w-full h-full p-2">
                        {optimizedLoad.map((item, index) => {
                          const containerWidth =
                            containers[selectedContainer].internal.width;
                          const containerLength =
                            containers[selectedContainer].internal.length;

                          // 더 작은 스케일로 더 많은 제품을 표시
                          const scaleX = 0.95 / containerWidth;
                          const scaleZ = 0.95 / containerLength;

                          // 제품별 고유 색상 생성
                          const productColors = [
                            {
                              bg: "bg-red-200",
                              border: "border-red-400",
                              hover: "hover:bg-red-300",
                              text: "text-red-800",
                            },
                            {
                              bg: "bg-blue-200",
                              border: "border-blue-400",
                              hover: "hover:bg-blue-300",
                              text: "text-blue-800",
                            },
                            {
                              bg: "bg-green-200",
                              border: "border-green-400",
                              hover: "hover:bg-green-300",
                              text: "text-green-800",
                            },
                            {
                              bg: "bg-yellow-200",
                              border: "border-yellow-400",
                              hover: "hover:bg-yellow-300",
                              text: "text-yellow-800",
                            },
                            {
                              bg: "bg-purple-200",
                              border: "border-purple-400",
                              hover: "hover:bg-purple-300",
                              text: "text-purple-800",
                            },
                            {
                              bg: "bg-pink-200",
                              border: "border-pink-400",
                              hover: "hover:bg-pink-300",
                              text: "text-pink-800",
                            },
                            {
                              bg: "bg-indigo-200",
                              border: "border-indigo-400",
                              hover: "hover:bg-indigo-300",
                              text: "text-indigo-800",
                            },
                            {
                              bg: "bg-cyan-200",
                              border: "border-cyan-400",
                              hover: "hover:bg-cyan-300",
                              text: "text-cyan-800",
                            },
                            {
                              bg: "bg-teal-200",
                              border: "border-teal-400",
                              hover: "hover:bg-teal-300",
                              text: "text-teal-800",
                            },
                            {
                              bg: "bg-orange-200",
                              border: "border-orange-400",
                              hover: "hover:bg-orange-300",
                              text: "text-orange-800",
                            },
                          ];

                          // 제품명과 타입을 조합해서 색상 인덱스 결정
                          const colorIndex =
                            (item.product.productname.charCodeAt(0) +
                              (item.product.type === "CONDENSER" ? 0 : 5)) %
                            productColors.length;
                          const colors = productColors[colorIndex];

                          // 최소 크기 보장하되 더 작게
                          const displayWidth = Math.max(
                            item.product.width * scaleX * 100,
                            2.5
                          );
                          const displayHeight = Math.max(
                            item.product.length * scaleZ * 100,
                            2.5
                          );

                          return (
                            <div
                              key={index}
                              className={`absolute border-2 rounded-md shadow-md transition-all duration-200 hover:shadow-lg hover:z-20 hover:scale-125 ${colors.bg} ${colors.border} ${colors.hover}`}
                              style={{
                                left: `${Math.min(
                                  item.position.x * scaleX * 100,
                                  98
                                )}%`,
                                top: `${Math.min(
                                  item.position.z * scaleZ * 100,
                                  98
                                )}%`,
                                width: `${displayWidth}%`,
                                height: `${displayHeight}%`,
                                minWidth: "25px",
                                minHeight: "18px",
                                zIndex: 10 + index,
                              }}
                              title={`#${
                                item.product.displayIndex || index + 1
                              } - ${item.product.productname} (${
                                item.product.type
                              })\n크기: ${item.product.width}×${
                                item.product.height
                              }×${item.product.length}mm\n무게: ${
                                item.product.weight
                              }kg | 부피: ${item.product.cbm}m³`}
                            >
                              <div
                                className={`p-0.5 text-xs font-bold text-center overflow-hidden h-full flex flex-col justify-center leading-none ${colors.text}`}
                              >
                                {/* 순번 표시 */}
                                <div className="text-[10px] font-black mb-0.5">
                                  #{item.product.displayIndex || index + 1}
                                </div>

                                {/* 제품명 첫 글자들 */}
                                <div className="text-[8px] font-semibold truncate">
                                  {item.product.productname
                                    .split(" ")
                                    .map((word) => word.charAt(0))
                                    .join("")
                                    .slice(0, 3)}
                                </div>

                                {/* 타입 표시 */}
                                <div className="text-[6px] opacity-80 font-medium">
                                  {item.product.type === "CONDENSER"
                                    ? "C"
                                    : "E"}
                                </div>

                                {/* 크기가 충분하면 무게 표시 */}
                                {displayWidth > 4 && displayHeight > 3.5 && (
                                  <div className="text-[6px] opacity-70 mt-0.5">
                                    {item.product.weight}kg
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Direction Indicator */}
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>→ 운전자석</span>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-sm max-w-64">
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        📊 시각화 정보
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2 mb-1">
                          <div className="font-medium text-gray-600 mb-1">
                            표시 정보:
                          </div>
                          <div className="text-gray-500 text-[10px]">
                            • #순번 - 제품명 첫글자 - C(콘덴서)/E(에바포레이터)
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600">
                            총 적재:
                          </div>
                          <div className="text-blue-600 font-bold">
                            {optimizedLoad.length}개
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600">색상:</div>
                          <div className="text-gray-500 text-[10px]">
                            제품별 자동 할당
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-[10px] text-gray-500">
                          💡 마우스를 올려보세요 - 상세 정보가 표시됩니다
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Empty States */}
        {hasData === null && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              제품 데이터를 로드해주세요
            </h3>
            <p className="text-gray-500">
              위의 &apos;제품 데이터 로드&apos; 버튼을 클릭하여 제품 정보를
              불러오세요.
            </p>
          </div>
        )}

        {hasData === false && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              제품 데이터가 없습니다
            </h3>
            <p className="text-gray-500">
              먼저 엑셀 파일을 업로드하여 제품 정보를 등록해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
