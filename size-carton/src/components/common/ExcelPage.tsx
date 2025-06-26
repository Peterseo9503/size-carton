"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
//1. 데이터 정합성 검사부터
// CREATE TABLE product_info (
//   id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   type TEXT CHECK (type IN ('CONDENSER', 'EVAPORATOR')) NOT NULL,
//   dimension VARCHAR(50),
//   weight DECIMAL(10, 2),
//   cbm DECIMAL(10, 6)
// );

export default function ExcelPage() {
  const [tableData, setTableData] = useState<unknown[][]>([]);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [productData, setProductData] = useState<unknown[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadToDB(productData: unknown[]) {
    setUploading(true);
    try {
      const res = await fetch("/api/upload-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productData }),
      });
      const result = await res.json();
      if (res.ok) {
        alert(`✅ ${result.message || "DB 저장 성공!"}`);
        // Reset form after successful upload
        setTableData([]);
        setIsFileUpload(false);
        setProductData([]);
        setFileName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert("❌ DB 저장 실패: " + result.error);
      }
    } catch {
      alert("❌ 네트워크 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  function isValidRow(row: unknown[]): boolean {
    // 8개 컬럼, Product(1), DIMENSION(2,5), WEIGHT(3,6), CBM(4,7)
    if (row.length < 8) return false;
    if (!row[1] || typeof row[1] !== "string") return false;

    // DIMENSION: "숫자X숫자X숫자"
    const dimPattern = /^\d+X\d+X\d+$/;
    if (!dimPattern.test(String(row[2])) || !dimPattern.test(String(row[5])))
      return false;

    // WEIGHT, CBM: 숫자
    if (
      isNaN(Number(row[3])) ||
      isNaN(Number(row[4])) ||
      isNaN(Number(row[6])) ||
      isNaN(Number(row[7]))
    )
      return false;

    return true;
  }

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });
      // 첫 행(헤더) 제외
      const dataRows = jsonData.slice(1);

      const validRows = dataRows.filter(isValidRow);

      if (validRows.length !== dataRows.length) {
        alert(
          "⚠️ 엑셀 데이터 형식이 올바르지 않은 행이 있습니다. 확인해주세요."
        );
        return;
      }
      const productData = convertRowsToProducts(validRows);
      // Fix: convert productData (array of objects) to array of arrays for tableData
      const tableRows = productData.map((product) => [
        product.productname,
        product.type,
        product.width,
        product.height,
        product.length,
        product.weight,
        product.cbm,
      ]);
      setTableData(tableRows);
      setProductData(productData);
      setIsFileUpload(true);
    };
    reader.readAsBinaryString(file);
  };

  // 엑셀 파일 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.type.includes("sheet") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        processFile(file);
      } else {
        alert("⚠️ 엑셀 파일만 업로드 가능합니다.");
      }
    }
  };

  function parseDimension(dimStr: string) {
    const [width, height, length] = dimStr.split("X").map(Number);
    return { width, height, length };
  }

  function convertRowsToProducts(rows: unknown[][]) {
    const products = [];
    for (const row of rows) {
      // CONDENSER
      const condenserDim = parseDimension(String(row[2]));
      products.push({
        productname: String(row[1]),
        type: "CONDENSER",
        ...condenserDim,
        weight: Number(row[3]),
        cbm: Number(row[4]),
      });
      // EVAPORATOR
      const evaporatorDim = parseDimension(String(row[5]));
      products.push({
        productname: String(row[1]),
        type: "EVAPORATOR",
        ...evaporatorDim,
        weight: Number(row[6]),
        cbm: Number(row[7]),
      });
    }
    return products;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            엑셀 파일 업로드
          </h1>
          <p className="text-gray-600 text-lg">
            제품 정보가 포함된 엑셀 파일을 업로드하여 데이터베이스에 저장하세요
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {/* Upload Icon */}
              <div className="mb-6">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
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

              {/* Upload Text */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  엑셀 파일을 여기에 드래그하거나 클릭하여 선택하세요
                </h3>
                <p className="text-gray-500">.xlsx, .xls 파일만 지원됩니다</p>
              </div>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                파일 선택하기
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* File Name Display */}
              {fileName && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-green-800 font-medium">
                      {fileName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {tableData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">미리보기</h3>
              <p className="text-gray-600">
                업로드된 데이터를 확인하세요 (총 {tableData.length}개 항목)
              </p>
            </div>

            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제품명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        타입
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가로
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        세로
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        높이
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        무게
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CBM
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.slice(0, 10).map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {j === 1 ? (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  cell === "CONDENSER"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {String(cell)}
                              </span>
                            ) : typeof cell === "object" && cell !== null ? (
                              JSON.stringify(cell)
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {tableData.length > 10 && (
                  <div className="mt-4 text-center text-gray-500">
                    ... 외 {tableData.length - 10}개 항목
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {isFileUpload && (
          <div className="text-center">
            <button
              onClick={() => uploadToDB(productData)}
              disabled={uploading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  데이터베이스에 저장 중...
                </>
              ) : (
                <>
                  <svg
                    className="inline-block w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  데이터베이스에 저장하기
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
