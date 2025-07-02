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
  stackCount: number; // 해당 위치에 쌓인 개수
  stackHeight: number; // 실제 쌓인 높이 (mm)
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
  const [showUnplaced, setShowUnplaced] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Container specifications (high-cube containers)
  const containers: Record<string, Container> = {
    "20ft": {
      type: "20ft",
      internal: { width: 2340, height: 2280, length: 5898, volume: 31.44 },
    },
    "40ft": {
      type: "40ft",
      internal: { width: 2340, height: 2585, length: 12032, volume: 64.15 },
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
              // 선택할 때 수량이 0이면 1로 설정, 해제할 때는 0으로 설정
              quantity: !product.selected
                ? product.quantity === 0
                  ? 1
                  : product.quantity
                : 0,
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

  // 선택된 제품 업데이트 (선택되고 수량이 있는 제품만)
  useEffect(() => {
    console.log("Products 상태:", products);
    const expandedProducts: Product[] = [];
    products.forEach((product) => {
      console.log(
        `제품 ${product.productname}: selected=${product.selected}, quantity=${product.quantity}`
      );
      // 선택되고 수량이 1 이상인 제품만 포함
      if (product.selected && product.quantity && product.quantity > 0) {
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
        // 선택할 때 수량이 0이면 1로 설정, 해제할 때는 0으로 설정
        quantity: !allSelected
          ? product.quantity === 0
            ? 1
            : product.quantity
          : 0,
      }))
    );
  };

  // 완전히 새로운 3D 공간 활용 적재 알고리즘
  const optimizeLoading = () => {
    if (selectedProducts.length === 0) {
      alert("최소 1개 이상의 제품을 선택해주세요.");
      return;
    }

    setOptimizedLoad([]);
    setUnplacedProducts([]);
    setLoadingOptimization(true);

    setTimeout(() => {
      const container = containers[selectedContainer];
      const usableSpace = {
        width: container.internal.width * 0.98,
        height: container.internal.height * 0.98,
        length: container.internal.length * 0.98,
      };

      console.log("컨테이너 사용 가능 공간:", usableSpace);

      const loaded: LoadedItem[] = [];
      const unplaced: Product[] = [];

      // 제품별로 그룹핑
      const productGroups = selectedProducts.reduce((acc, product) => {
        const key = `${product.productname}_${product.type}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(product);
        return acc;
      }, {} as Record<string, Product[]>);

      console.log("제품 그룹:", productGroups);

      // 각 제품 그룹별로 최적 배치 계산
      Object.entries(productGroups).forEach(([groupKey, products]) => {
        const product = products[0];
        const totalCount = products.length;

        console.log(`\n=== ${groupKey} 배치 계산 ===`);
        console.log(
          `제품 크기: ${product.width} × ${product.height} × ${product.length}mm`
        );
        console.log(`총 개수: ${totalCount}개`);

        // 각 방향으로 들어갈 수 있는 개수 계산
        const maxX = Math.floor(usableSpace.width / product.width);
        const maxY = Math.floor(usableSpace.height / product.height);
        const maxZ = Math.floor(usableSpace.length / product.length);

        const maxPossible = maxX * maxY * maxZ;
        console.log(
          `이론적 최대 개수: ${maxX} × ${maxY} × ${maxZ} = ${maxPossible}개`
        );

        // 실제 배치할 개수 결정
        const actualCount = Math.min(totalCount, maxPossible);
        console.log(`실제 배치 개수: ${actualCount}개`);

        // 3D 그리드로 배치
        let placedCount = 0;

        outerLoop: for (let z = 0; z < maxZ && placedCount < actualCount; z++) {
          for (let y = 0; y < maxY && placedCount < actualCount; y++) {
            for (let x = 0; x < maxX && placedCount < actualCount; x++) {
              const position = {
                x: x * product.width,
                y: y * product.height,
                z: z * product.length,
              };

              // 현재 위치가 이미 사용된 공간과 겹치는지 확인
              const isConflict = loaded.some((item) => {
                const noOverlapX =
                  position.x >= item.position.x + item.product.width ||
                  item.position.x >= position.x + product.width;
                const noOverlapY =
                  position.y >= item.position.y + item.stackHeight ||
                  item.position.y >= position.y + product.height;
                const noOverlapZ =
                  position.z >= item.position.z + item.product.length ||
                  item.position.z >= position.z + product.length;

                return !(noOverlapX || noOverlapY || noOverlapZ);
              });

              if (!isConflict) {
                loaded.push({
                  product: {
                    ...product,
                    displayIndex: loaded.length + 1,
                  },
                  position,
                  rotation: 0,
                  stackCount: 1,
                  stackHeight: product.height,
                });
                placedCount++;

                console.log(
                  `${placedCount}번째 배치: (${position.x}, ${position.y}, ${position.z})`
                );
              }
            }
          }
        }

        console.log(`최종 배치된 개수: ${placedCount}개`);

        // 배치되지 못한 제품들을 unplaced에 추가
        for (let i = placedCount; i < totalCount; i++) {
          unplaced.push(products[i]);
        }
      });

      console.log("\n=== 최종 결과 ===");
      console.log("총 배치된 제품:", loaded.length);
      console.log("배치되지 못한 제품:", unplaced.length);

      setOptimizedLoad(loaded);
      setUnplacedProducts(unplaced);
      setLoadingOptimization(false);
    }, 1000);
  };

  // 검색어로 제품 필터링
  const filteredProducts = products.filter(
    (product) =>
      product.productname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <div className="flex justify-between items-center mb-4">
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

                  {/* 검색 입력 */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    </div>
                    <input
                      type="text"
                      placeholder="제품명 또는 타입으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredProducts.length === 0 && searchTerm ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-lg mb-2">🔍</div>
                        <div>
                          &quot;{searchTerm}&quot;에 대한 검색 결과가 없습니다
                        </div>
                        <div className="text-sm">
                          다른 검색어를 시도해보세요
                        </div>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-lg mb-2">📦</div>
                        <div>제품 데이터가 없습니다</div>
                        <div className="text-sm">
                          위의 &apos;제품 데이터 로드&apos; 버튼을 클릭해주세요
                        </div>
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
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
                                <span className="text-sm text-gray-500">
                                  개
                                </span>
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
                      ))
                    )}
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
                {/* 컨테이너 적재 시각화 - 전체 너비 사용 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedContainer} 컨테이너 적재 시각화
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="text-sm text-gray-600">
                        내부 치수:{" "}
                        {containers[selectedContainer].internal.width} ×{" "}
                        {containers[selectedContainer].internal.height} ×{" "}
                        {containers[selectedContainer].internal.length} mm
                      </div>
                      <div className="text-sm text-gray-600">
                        적재율:{" "}
                        <span className="font-semibold text-blue-600">
                          {stats.volumeRatio}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 컨테이너 세로 뷰 */}
                  <div
                    className="relative bg-gray-100 rounded-lg p-8"
                    style={{ minHeight: "600px" }}
                  >
                    {/* 운전석 표시 */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                      🚛 운전석 (앞쪽)
                    </div>

                    {/* 컨테이너 내부 */}
                    <div
                      className="relative mx-auto mt-12 border-4 border-gray-400 bg-white"
                      style={{
                        width: "95%",
                        height: "500px",
                        borderRadius: "8px",
                      }}
                    >
                      {/* 적재된 제품들 */}
                      {optimizedLoad.map((item, index) => {
                        // 같은 X,Z 위치에 있는 다른 제품들 찾기
                        const samePositionItems = optimizedLoad.filter(
                          (otherItem) =>
                            Math.abs(otherItem.position.x - item.position.x) <
                              10 &&
                            Math.abs(otherItem.position.z - item.position.z) <
                              10
                        );

                        const totalAtPosition = samePositionItems.length;
                        const isBottomItem = samePositionItems.every(
                          (otherItem) => otherItem.position.y >= item.position.y
                        );

                        // 위에 다른 제품이 있는지 확인
                        const hasOtherProductAbove = samePositionItems.some(
                          (otherItem) =>
                            otherItem.position.y > item.position.y &&
                            otherItem.product.productname !==
                              item.product.productname
                        );

                        // 가장 아래 제품만 표시 (겹침 방지)
                        if (!isBottomItem) return null;
                        // 제품명으로 색상 결정 (다른 제품이 위에 있으면 어두운 색상)
                        const getProductColor = (
                          productName: string,
                          type: string,
                          hasOtherAbove: boolean = false
                        ) => {
                          const normalColors = [
                            {
                              bg: "bg-red-400",
                              border: "border-red-600",
                              text: "text-red-900",
                            },
                            {
                              bg: "bg-blue-400",
                              border: "border-blue-600",
                              text: "text-blue-900",
                            },
                            {
                              bg: "bg-green-400",
                              border: "border-green-600",
                              text: "text-green-900",
                            },
                            {
                              bg: "bg-yellow-400",
                              border: "border-yellow-600",
                              text: "text-yellow-900",
                            },
                            {
                              bg: "bg-purple-400",
                              border: "border-purple-600",
                              text: "text-purple-900",
                            },
                            {
                              bg: "bg-pink-400",
                              border: "border-pink-600",
                              text: "text-pink-900",
                            },
                            {
                              bg: "bg-indigo-400",
                              border: "border-indigo-600",
                              text: "text-indigo-900",
                            },
                            {
                              bg: "bg-cyan-400",
                              border: "border-cyan-600",
                              text: "text-cyan-900",
                            },
                            {
                              bg: "bg-teal-400",
                              border: "border-teal-600",
                              text: "text-teal-900",
                            },
                            {
                              bg: "bg-orange-400",
                              border: "border-orange-600",
                              text: "text-orange-900",
                            },
                          ];

                          const darkColors = [
                            {
                              bg: "bg-red-700",
                              border: "border-red-800",
                              text: "text-red-100",
                            },
                            {
                              bg: "bg-blue-700",
                              border: "border-blue-800",
                              text: "text-blue-100",
                            },
                            {
                              bg: "bg-green-700",
                              border: "border-green-800",
                              text: "text-green-100",
                            },
                            {
                              bg: "bg-yellow-700",
                              border: "border-yellow-800",
                              text: "text-yellow-100",
                            },
                            {
                              bg: "bg-purple-700",
                              border: "border-purple-800",
                              text: "text-purple-100",
                            },
                            {
                              bg: "bg-pink-700",
                              border: "border-pink-800",
                              text: "text-pink-100",
                            },
                            {
                              bg: "bg-indigo-700",
                              border: "border-indigo-800",
                              text: "text-indigo-100",
                            },
                            {
                              bg: "bg-cyan-700",
                              border: "border-cyan-800",
                              text: "text-cyan-100",
                            },
                            {
                              bg: "bg-teal-700",
                              border: "border-teal-800",
                              text: "text-teal-100",
                            },
                            {
                              bg: "bg-orange-700",
                              border: "border-orange-800",
                              text: "text-orange-100",
                            },
                          ];

                          // 제품명과 타입을 조합하여 색상 인덱스 생성
                          const hash = (productName + type)
                            .split("")
                            .reduce((a, b) => {
                              a = (a << 5) - a + b.charCodeAt(0);
                              return a & a;
                            }, 0);

                          const colors = hasOtherAbove
                            ? darkColors
                            : normalColors;
                          return colors[Math.abs(hash) % colors.length];
                        };

                        const containerWidth =
                          containers[selectedContainer].internal.width;
                        const containerLength =
                          containers[selectedContainer].internal.length;

                        // 컨테이너 내부 영역의 픽셀 크기 (고정값 사용)
                        const containerPixelWidth = 800; // 고정 가로 크기
                        const containerPixelHeight = 500; // 고정 높이

                        // 실제 적재 위치 계산 (세로 뷰로 변환)
                        const pixelX =
                          (item.position.z / containerLength) *
                          containerPixelWidth; // z축이 가로
                        const pixelY =
                          (item.position.x / containerWidth) *
                          containerPixelHeight; // x축이 세로

                        // 박스 크기 계산
                        const boxWidth = Math.max(
                          (item.product.length / containerLength) *
                            containerPixelWidth,
                          30
                        );
                        const boxHeight = Math.max(
                          (item.product.width / containerWidth) *
                            containerPixelHeight,
                          30
                        );

                        const colorScheme = getProductColor(
                          item.product.productname,
                          item.product.type,
                          hasOtherProductAbove
                        );

                        return (
                          <div key={index}>
                            {/* 메인 제품 박스 */}
                            <div
                              className={`absolute ${colorScheme.bg} ${colorScheme.border} border-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center overflow-hidden`}
                              style={{
                                left: `${Math.min(
                                  pixelX,
                                  containerPixelWidth - boxWidth
                                )}px`,
                                top: `${Math.min(
                                  pixelY,
                                  containerPixelHeight - boxHeight
                                )}px`,
                                width: `${boxWidth}px`,
                                height: `${boxHeight}px`,
                                minWidth: "40px",
                                minHeight: "40px",
                              }}
                              title={`${item.product.productname} (${
                                item.product.type
                              })\n크기: ${item.product.width}×${
                                item.product.height
                              }×${item.product.length}mm\n무게: ${
                                item.product.weight
                              }kg\n위치: (${Math.round(
                                item.position.x
                              )}, ${Math.round(item.position.y)}, ${Math.round(
                                item.position.z
                              )})`}
                            >
                              {/* 제품명 */}
                              <div
                                className={`text-xs font-bold ${colorScheme.text} text-center px-1 leading-tight`}
                              >
                                {item.product.productname}
                              </div>

                              {/* 타입 표시 */}
                              <div
                                className={`text-[10px] ${colorScheme.text} opacity-80 text-center`}
                              >
                                {item.product.type === "CONDENSER"
                                  ? "콘덴서"
                                  : "에바포레이터"}
                              </div>

                              {/* 같은 위치 총 개수 표시 */}
                              {totalAtPosition > 1 && (
                                <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full mt-1 font-bold">
                                  {totalAtPosition}개
                                </div>
                              )}

                              {/* 순번 */}
                              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* 컨테이너가 비어있을 때 */}
                      {optimizedLoad.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📦</div>
                            <div>
                              적재 최적화를 실행하면 결과가 여기에 표시됩니다
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 뒤쪽 표시 */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white px-4 py-2 rounded-lg">
                      뒤쪽 (문)
                    </div>
                  </div>
                </div>

                {/* 통계 및 상세 정보 */}
                <div className="grid grid-cols-4 gap-6 mb-6">
                  {/* 적재 통계 */}
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.totalItems}
                    </div>
                    <div className="text-sm text-blue-600">총 개수</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.totalWeight}kg
                    </div>
                    <div className="text-sm text-green-600">총 무게</div>
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

                {/* 상세 정보 */}
                <div className="grid grid-cols-1 gap-6">
                  {/* 적재된 제품 상세 리스트 */}
                  <div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      {/* 탭 헤더 */}
                      <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                          <button
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                              !showUnplaced
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() => setShowUnplaced(false)}
                          >
                            적재된 제품 ({optimizedLoad.length}개)
                          </button>
                          {unplacedProducts.length > 0 && (
                            <button
                              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                showUnplaced
                                  ? "border-red-500 text-red-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              }`}
                              onClick={() => setShowUnplaced(true)}
                            >
                              배치 실패 ({unplacedProducts.length}개)
                            </button>
                          )}
                        </nav>
                      </div>

                      {/* 탭 컨텐츠 */}
                      <div className="p-6">
                        {!showUnplaced ? (
                          // 적재된 제품 목록
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">
                                적재된 제품 상세 목록
                              </h3>
                              <div className="text-sm text-gray-500">
                                총 {optimizedLoad.length}개 제품
                              </div>
                            </div>

                            <div className="overflow-x-auto max-h-96">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                      순번
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                      제품명
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                      타입
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                      크기 (W×H×L)
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                      무게
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                      CBM
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
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
                                        (item.product.type === "CONDENSER"
                                          ? 0
                                          : 5)) %
                                      productColors.length;

                                    return (
                                      <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                      >
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
                                          {item.product.width}×
                                          {item.product.height}×
                                          {item.product.length}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {item.product.weight}kg
                                          {item.stackCount &&
                                            item.stackCount > 1 && (
                                              <div className="text-xs text-gray-500">
                                                × {item.stackCount} ={" "}
                                                {(
                                                  item.product.weight *
                                                  item.stackCount
                                                ).toFixed(1)}
                                                kg
                                              </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {item.product.cbm}m³
                                          {item.stackCount &&
                                            item.stackCount > 1 && (
                                              <div className="text-xs text-gray-500">
                                                × {item.stackCount} ={" "}
                                                {(
                                                  item.product.cbm *
                                                  item.stackCount
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
                        ) : (
                          // 배치되지 못한 제품들
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold text-red-800">
                                배치되지 못한 제품
                              </h3>
                              <div className="text-sm text-red-600">
                                총 {unplacedProducts.length}개 제품
                              </div>
                            </div>

                            <div className="text-sm text-red-700 mb-4">
                              다음 제품들은 컨테이너에 공간이 부족하여 배치할 수
                              없습니다:
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {unplacedProducts.map((product, index) => (
                                <div
                                  key={`unplaced-${product.id}-${index}`}
                                  className="bg-red-50 rounded-md p-4 border border-red-200 hover:bg-red-100 transition-colors"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-900">
                                          {product.productname}
                                        </span>
                                        <span
                                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            product.type === "CONDENSER"
                                              ? "bg-blue-100 text-blue-800"
                                              : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {product.type === "CONDENSER"
                                            ? "콘덴서"
                                            : "에바포레이터"}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        크기: {product.width}×{product.height}×
                                        {product.length}mm
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        무게: {product.weight}kg | CBM:{" "}
                                        {product.cbm}m³
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="text-sm text-yellow-800">
                                💡 팁: 더 큰 컨테이너를 선택하거나 일부 제품을
                                제외해보세요.
                              </div>
                            </div>
                          </div>
                        )}
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
