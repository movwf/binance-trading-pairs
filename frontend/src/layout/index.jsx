import { memo } from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="h-screen w-screen flex flex-row bg-[#f2f6f9]">
      <main className="w-full h-full">
        <Outlet />
      </main>
    </div>
  );
}

export default memo(Layout);
