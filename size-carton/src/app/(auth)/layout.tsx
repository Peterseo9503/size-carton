// src/app/(main)/layout.tsx
import Header from "@/components/layout/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header title="My App" />
      <main>{children}</main>
    </>
  );
}
