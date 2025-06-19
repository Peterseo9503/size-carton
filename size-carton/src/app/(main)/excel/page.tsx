import ExcelPage from "@/components/common/ExcelPage";

export default function Page() {
  return (
    <>
      <div>지정된 양식과 같은 엑셀파일을 등록하세요</div>
      <div>지정양식 보여주고</div>
      <div>
        <ExcelPage />
      </div>
    </>
  );
}
