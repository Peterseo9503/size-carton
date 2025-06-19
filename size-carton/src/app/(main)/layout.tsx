// src/app/(main)/layout.tsx
import Header from "@/components/layout/Header";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        title="조미❤️동현"
        rightElement={
          <>
            <Link href="/excel">엑셀파일등록</Link>{" "}
            <Link href="/dataList">데이터리스트</Link>
          </>
        }
      />
      <main>{children}</main>
    </>
  );
}
