"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelPage() {
  const [tableData, setTableData] = useState<unknown[][]>([]);

  // 엑셀 파일 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      console.log(jsonData);
      setTableData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <div className="mb-4">
        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      </div>
      <div>
        {tableData.length > 0 && (
          <table className="border-collapse border w-full">
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border px-2 py-1">
                      {typeof cell === "object" && cell !== null
                        ? JSON.stringify(cell)
                        : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
