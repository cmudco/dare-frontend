import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import Header from "./Header";

const UserView: React.FC = () => {
  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <div className='flex flex-grow overflow-hidden'>
        <SideBar />
        <div className='flex-grow overflow-auto '>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserView;