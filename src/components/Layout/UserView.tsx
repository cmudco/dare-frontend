import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

const UserView: React.FC = () => {
  return (
    <div className="flex">
      <SideBar />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default UserView;