import { memo } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

function Layout() {
  return (
    <div className="h-screen w-screen flex flex-row bg-[#f2f6f9]">
      <main className="w-full h-full">
        <Outlet />
      </main>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: "",
          duration: 2500,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
          }
        }}
      />
    </div>
  );
}

export default memo(Layout);
