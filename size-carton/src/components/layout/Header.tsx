"use client";
import { useRouter } from "next/navigation";
import React from "react";

interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export default function Header({ title, rightElement }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="w-full h-16 flex items-center justify-between px-6 bg-white shadow ">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => router.push("/intro")}
      >
        {title}
      </h1>
      <div>{rightElement}</div>
    </header>
  );
}
