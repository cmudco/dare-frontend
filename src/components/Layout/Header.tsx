import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BellIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { userLogout } from "../../redux/aynscThunks/user";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { Button } from "../ui/button";


const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);

  const handleLogout = async () => {
    try {
      await dispatch(userLogout()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="h-[80px] bg-white p-1 flex justify-between items-center w-full top-0 left-0 right-0 border border-pink-50">
      <div className="flex items-center">
        <img src="/icons/LogoWithText.png" alt="Logo" className="w-24 md:w-32 lg:w-40 h-auto mr-4" />
      </div>

      <div className="flex items-center gap-4">
        <BellIcon className="h-6 w-6 text-gray-600" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-x-2 p-0">
              <img
                src={`https://avatar.iran.liara.run/public/job/teacher/male`}
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex flex-col items-start normal-case">
                <span className="text-sm font-medium text-gray-900">{user?.name || "John Doe"}</span>
                <span className="text-xs text-gray-500">{user?.email || "Loading..."}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="p-1 border border-gray-100 w-[200px]">
            {/* Optional Profile & Settings */}
            {/* <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">Your Profile</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">Settings</DropdownMenuItem>
            <Separator className="my-2" /> */}

            <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer hover:bg-gray-100 py-3 ">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
