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
  stackCount?: number; // 같은 위치에 쌓인 개수
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
  const [unplacedProducts, setUnplacedProducts] = useState<Product[]>([]);

  // Container specifications (high-cube containers)
  const containers: Record<string, Container> = {
    "20ft": {
      type: "20ft",
      internal: { width: 2340, height: 2280, length: 5898, volume: 31.44 },
    },
    "40ft": {
      type: "40ft",
      internal: { width: 2340, height: 2280, length: 12032, volume: 64.15 },
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
              // 수량은 자동으로 변경하지 않음
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
          ? { ...product, quantity: validQuantity }
          : product
      )
    );
  };

  // 선택된 제품 업데이트 (수량 기반으로 확장)
  useEffect(() => {
    console.log("Products 상태:", products);
    const expandedProducts: Product[] = [];
    products.forEach((product) => {
      console.log(
        `제품 ${product.productname}: selected=${product.selected}, quantity=${product.quantity}`
      );
      if (product.quantity && product.quantity > 0) {
        console.log(`${product.productname}을 ${product.quantity}개 추가`);
        for (let i = 0; i < product.quantity; i++) {
          expandedProducts.push({
            ...product,
            id: product.id * 1000 + i, // 고유 ID 생성
          });
        }
      }
    });
    console.log("최종 selectedProducts:", expandedProducts);
    setSelectedProducts(expandedProducts);
  }, [products]);

  // 전체 선택/해제
  const toggleAllSelection = () => {
    const allSelected = products.every((product) => product.selected);
    setProducts((prev) =>
      prev.map((product) => ({
        ...product,
        selected: !allSelected,
        // 수량은 기존 값 유지
      }))
    );
  };

  // 개선된 3D 컨테이너 적재 최적화 알고리즘
  const optimizeLoading = () => {
    if (selectedProducts.length === 0) {
      alert("최소 1개 이상의 제품을 선택해주세요.");
      return;
    }

    // 기존 적재 결과 초기화
    setOptimizedLoad([]);
    setUnplacedProducts([]);
    setLoadingOptimization(true);

    setTimeout(() => {
      const container = containers[selectedContainer];
      const usableSpace = {
        width: container.internal.width * 0.95,
        height: container.internal.height * 0.95,
        length: container.internal.length * 0.95,
      };

      const loaded: LoadedItem[] = [];

      console.log("선택된 제품들:", selectedProducts);

      // 임시로 간단한 방식으로 되돌림 - 각 제품을 개별적으로 처리
      const sortedProducts = [...selectedProducts].sort((a, b) => {
        // 먼저 타입별로 정렬 (EVAPORATOR가 앞으로)
        if (a.type !== b.type) {
          return a.type === "EVAPORATOR" ? -1 : 1;
        }
        // 같은 타입 내에서는 무게 기준 정렬 (무거운 것이 먼저)
        return b.weight - a.weight;
      });

      console.log("정렬된 제품들:", sortedProducts);

      // 충돌 검사 함수
      const checkCollision = (
        newPos: { x: number; y: number; z: number },
        newProduct: Product
      ) => {
        return loaded.some((item) => {
          const existingPos = item.position;
          const existingProduct = item.product;

          // 3D 박스 충돌 검사
          const noOverlapX =
            newPos.x >= existingPos.x + existingProduct.width ||
            existingPos.x >= newPos.x + newProduct.width;
          const noOverlapY =
            newPos.y >= existingPos.y + existingProduct.height ||
            existingPos.y >= newPos.y + newProduct.height;
          const noOverlapZ =
            newPos.z >= existingPos.z + existingProduct.length ||
            existingPos.z >= newPos.z + newProduct.length;

          return !(noOverlapX || noOverlapY || noOverlapZ);
        });
      };

      // 최적 위치 찾기 함수
      const findOptimalPosition = (product: Product) => {
        const spacing = 50; // 제품 간 최소 간격 (mm)

        // 가능한 모든 위치를 시도해보며 최적 위치 찾기
        for (
          let y = 0;
          y <= usableSpace.height - product.height;
          y += spacing
        ) {
          for (
            let z = 0;
            z <= usableSpace.length - product.length;
            z += spacing
          ) {
            for (
              let x = 0;
              x <= usableSpace.width - product.width;
              x += spacing
            ) {
              const position = { x, y, z };

              // 컨테이너 경계 체크
              if (
                x + product.width <= usableSpace.width &&
                y + product.height <= usableSpace.height &&
                z + product.length <= usableSpace.length &&
                !checkCollision(position, product)
              ) {
                return position;
              }
            }
          }
        }

        // 최적 위치를 찾지 못한 경우 null 반환
        return null;
      };

      // 각 제품을 순차적으로 배치
      const unplaced: Product[] = [];

      sortedProducts.forEach((product, index) => {
        console.log(
          `처리 중인 제품: ${product.productname} (${index + 1}/${
            sortedProducts.length
          })`
        );

        const position = findOptimalPosition(product);

        if (position) {
          loaded.push({
            product: {
              ...product,
              displayIndex: loaded.length + 1, // 실제 배치된 순번
            },
            position,
            rotation: 0,
          });
          console.log(
            `배치 성공: ${product.productname} at (${position.x}, ${position.y}, ${position.z})`
          );
        } else {
          unplaced.push(product);
          console.log(`배치 실패: ${product.productname}`);
        }
      });

      console.log("최종 적재 결과:", loaded);
      console.log("배치되지 못한 제품:", unplaced);

      setOptimizedLoad(loaded);
      setUnplacedProducts(unplaced);
      setLoadingOptimization(false);
    }, 1000);
  };

  // 선택된 제품들의 총 CBM 계산
  const calculateTotalCBM = () => {
    return selectedProducts.reduce((sum, product) => sum + product.cbm, 0);
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
      totalItems: optimizedLoad.length, // 적재된 개수
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
    setUnplacedProducts([]); // 배치되지 못한 제품 목록도 초기화
  };

  const stats = calculateLoadingStats();
  const totalCBM = calculateTotalCBM();

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
                            {/* Quantity Input - 항상 표시 */}
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">
                                수량:
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="999"
                                value={product.quantity ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "") {
                                    updateProductQuantity(product.id, 0);
                                  } else {
                                    const numValue = parseInt(value);
                                    if (!isNaN(numValue)) {
                                      updateProductQuantity(
                                        product.id,
                                        numValue
                                      );
                                    }
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <span className="text-sm text-gray-500">개</span>
                            </div>

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

                {/* CBM 경고 메시지 */}
                {totalCBM > 27 && selectedContainer === "20ft" && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-red-900">
                          ⚠️ 컨테이너 변경 필요
                        </div>
                        <div className="text-sm text-red-700 mt-1">
                          총 CBM이 {totalCBM.toFixed(2)}m³로 27m³를
                          초과했습니다.
                          <br />
                          40ft 컨테이너를 사용해주세요.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CBM 정보 표시 */}
                {selectedProducts.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 mb-1">
                      📦 총 CBM 정보
                    </div>
                    <div className="text-sm text-blue-700">
                      선택된 제품 총 CBM:{" "}
                      <span className="font-semibold">
                        {totalCBM.toFixed(2)}m³
                      </span>
                      <div className="text-xs text-blue-600 mt-1">
                        💡 27m³ 초과 시 40ft 컨테이너 권장
                      </div>
                    </div>
                  </div>
                )}

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
                {/* 분할 뷰: 왼쪽 컨테이너 요약 + 오른쪽 상세 리스트 */}
                <div className="grid grid-cols-5 gap-6">
                  {/* 왼쪽: 컨테이너 요약 및 통계 */}
                  <div className="col-span-2 space-y-6">
                    {/* 컨테이너 정보 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {selectedContainer} 컨테이너 정보
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">내부 치수:</span>
                          <span className="font-medium text-sm">
                            {containers[selectedContainer].internal.width} ×{" "}
                            {containers[selectedContainer].internal.height} ×{" "}
                            {containers[selectedContainer].internal.length} mm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">내부 용량:</span>
                          <span className="font-medium">
                            {containers[selectedContainer].internal.volume} m³
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 적재 통계 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        적재 결과 분석
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {stats.totalItems}
                          </div>
                          <div className="text-sm text-blue-600">총 개수</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-green-600">
                            {stats.totalWeight}kg
                          </div>
                          <div className="text-sm text-green-600">총 무게</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-orange-600">
                            {stats.volumeRatio}%
                          </div>
                          <div className="text-sm text-orange-600">적재율</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div
                            className={`text-xl font-bold ${
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

                    {/* 작은 컨테이너 썸네일 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        적재 배치도 (상면도)
                      </h3>
                      <div className="relative bg-blue-50 rounded-lg p-4 h-64">
                        <div className="absolute inset-2 border-2 border-blue-300 rounded-lg bg-white/50">
                          <div className="relative w-full h-full p-1">
                            {optimizedLoad.map((item, index) => {
                              const containerWidth =
                                containers[selectedContainer].internal.width;
                              const containerLength =
                                containers[selectedContainer].internal.length;

                              const scaleX = 0.8 / containerWidth;
                              const scaleZ = 0.8 / containerLength;

                              const productColors = [
                                "bg-red-400",
                                "bg-blue-400",
                                "bg-green-400",
                                "bg-yellow-400",
                                "bg-purple-400",
                                "bg-pink-400",
                                "bg-indigo-400",
                                "bg-cyan-400",
                                "bg-teal-400",
                                "bg-orange-400",
                              ];

                              const colorIndex =
                                (item.product.productname.charCodeAt(0) +
                                  (item.product.type === "CONDENSER" ? 0 : 5)) %
                                productColors.length;

                              const boxWidth = Math.max(
                                item.product.width * scaleX * 100,
                                3
                              );
                              const boxHeight = Math.max(
                                item.product.length * scaleZ * 100,
                                3
                              );

                              return (
                                <div
                                  key={index}
                                  className={`absolute rounded-sm border border-white ${productColors[colorIndex]} opacity-80 hover:opacity-100 transition-opacity flex flex-col items-center justify-center`}
                                  style={{
                                    left: `${Math.min(
                                      item.position.x * scaleX * 100,
                                      95
                                    )}%`,
                                    top: `${Math.min(
                                      item.position.z * scaleZ * 100,
                                      95
                                    )}%`,
                                    width: `${boxWidth}%`,
                                    height: `${boxHeight}%`,
                                    minWidth: "20px",
                                    minHeight: "20px",
                                  }}
                                  title={`#${index + 1} - ${
                                    item.product.productname
                                  }${
                                    item.stackCount
                                      ? ` (${item.stackCount}개 적재)`
                                      : ""
                                  }\n크기: ${item.product.width}×${
                                    item.product.height
                                  }×${item.product.length}mm\n무게: ${
                                    item.product.weight
                                  }kg${
                                    item.stackCount
                                      ? ` × ${item.stackCount} = ${(
                                          item.product.weight * item.stackCount
                                        ).toFixed(1)}kg`
                                      : ""
                                  }`}
                                >
                                  {/* 제품 순번과 개수 */}
                                  <div className="text-xs font-bold text-white bg-black/40 px-1 rounded mb-1">
                                    #{index + 1}
                                    {item.stackCount && item.stackCount > 1
                                      ? ` (${item.stackCount}개)`
                                      : ""}
                                  </div>

                                  {/* 치수 정보 (큰 박스일 때만 표시) */}
                                  {boxWidth > 8 && boxHeight > 6 && (
                                    <div className="text-[8px] text-white bg-black/40 px-1 rounded leading-tight text-center">
                                      <div>
                                        {item.product.width}×
                                        {item.product.height}
                                      </div>
                                      <div>×{item.product.length}</div>
                                      {item.stackCount &&
                                        item.stackCount > 1 && (
                                          <div className="text-yellow-300 font-bold">
                                            ↑{item.stackCount}층
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="absolute bottom-1 right-1 text-xs text-gray-600 bg-white/80 px-1 rounded">
                            → 운전자석
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: 적재된 제품 상세 리스트 */}
                  <div className="col-span-3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          적재된 제품 상세 목록
                        </h3>
                        <div className="text-sm text-gray-500">
                          총 {optimizedLoad.length}개 제품
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                순번
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                제품명
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                타입
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                크기 (W×H×L)
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                무게
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                CBM
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                적재 위치 (X,Y,Z)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {optimizedLoad.map((item, index) => {
                              const productColors = [
                                "bg-red-100 text-red-800",
                                "bg-blue-100 text-blue-800",
                                "bg-green-100 text-green-800",
                                "bg-yellow-100 text-yellow-800",
                                "bg-purple-100 text-purple-800",
                                "bg-pink-100 text-pink-800",
                                "bg-indigo-100 text-indigo-800",
                                "bg-cyan-100 text-cyan-800",
                                "bg-teal-100 text-teal-800",
                                "bg-orange-100 text-orange-800",
                              ];

                              const colorIndex =
                                (item.product.productname.charCodeAt(0) +
                                  (item.product.type === "CONDENSER" ? 0 : 5)) %
                                productColors.length;

                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${productColors[colorIndex]}`}
                                    >
                                      #{index + 1}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.product.productname}
                                      {item.stackCount &&
                                        item.stackCount > 1 && (
                                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {item.stackCount}개 적재
                                          </span>
                                        )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        item.product.type === "CONDENSER"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {item.product.type === "CONDENSER"
                                        ? "콘덴서"
                                        : "에바포레이터"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.product.width}×{item.product.height}×
                                    {item.product.length}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.product.weight}kg
                                    {item.stackCount && item.stackCount > 1 && (
                                      <div className="text-xs text-gray-500">
                                        × {item.stackCount} ={" "}
                                        {(
                                          item.product.weight * item.stackCount
                                        ).toFixed(1)}
                                        kg
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.product.cbm}m³
                                    {item.stackCount && item.stackCount > 1 && (
                                      <div className="text-xs text-gray-500">
                                        × {item.stackCount} ={" "}
                                        {(
                                          item.product.cbm * item.stackCount
                                        ).toFixed(3)}
                                        m³
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ({Math.round(item.position.x)},{" "}
                                    {Math.round(item.position.y)},{" "}
                                    {Math.round(item.position.z)})
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {optimizedLoad.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          적재 최적화를 실행하면 결과가 여기에 표시됩니다.
                        </div>
                      )}
                    </div>

                    {/* 배치되지 못한 제품들 */}
                    {unplacedProducts.length > 0 && (
                      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-red-800 mb-3">
                          배치되지 못한 제품 ({unplacedProducts.length}개)
                        </h4>
                        <div className="text-sm text-red-700 mb-3">
                          다음 제품들은 컨테이너에 공간이 부족하여 배치할 수
                          없습니다:
                        </div>
                        <div className="space-y-2">
                          {unplacedProducts.map((product, index) => (
                            <div
                              key={`unplaced-${product.id}-${index}`}
                              className="bg-white rounded-md p-3 border border-red-200"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {product.productname}
                                  </span>
                                  <span className="ml-2 text-sm text-gray-600">
                                    (
                                    {product.type === "CONDENSER"
                                      ? "콘덴서"
                                      : "에바포레이터"}
                                    )
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.width}×{product.height}×
                                  {product.length}mm ({product.weight}kg)
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-red-600">
                          💡 팁: 더 큰 컨테이너를 선택하거나 일부 제품을
                          제외해보세요.
                        </div>
                      </div>
                    )}
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
