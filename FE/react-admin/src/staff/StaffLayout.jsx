import React from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "./global/StaffSidebar";
import StaffTopbar from "./global/StaffTopbar";

const StaffLayout = () => {
    return (
        <div className="app">
          <StaffSidebar />
          <main className="content">
            <StaffTopbar />
            <Outlet /> {/* Đây là nơi các route con sẽ được hiển thị */}
          </main>
        </div>
      );
    };

export default StaffLayout;
