import React from "react";
import { Outlet } from "react-router";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full h-full sm:w-[390px] sm:h-[844px] bg-[#FAF9F6] relative overflow-hidden sm:rounded-[40px] shadow-2xl">
        <Outlet />
      </div>
    </div>
  );
}
