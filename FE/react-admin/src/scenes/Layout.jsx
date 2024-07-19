import React from "react";
import Sidebar from "./global/Sidebar";
import Topbar from "./global/Topbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Topbar />
        <Outlet /> {/* Đây là nơi các route con sẽ được hiển thị */}
      </main>
    </div>
  );
};

export default Layout;
