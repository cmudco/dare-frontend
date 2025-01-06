import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BellIcon } from "@heroicons/react/24/solid";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";

import { AppDispatch, RootState } from "../../redux/store";
import { userLogout } from "../../redux/aynscThunks/user";
import { useNavigate } from "react-router-dom";


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
    <header className='bg-white p-1 flex justify-between items-center w-full top-0 left-0 right-0 border border-pink-50'>
      <div className='flex items-center'>
        <img
          src='/icons/LogoWithText.png'
          alt='Logo'
          className='w-24 md:w-32 lg:w-40 h-auto mr-4'
        />
      </div>
      <div className='flex items-center'>
        <BellIcon className='h-6 w-6' />
        <Menu>
          <MenuHandler>
            <Button variant="text" className="flex items-center gap-x-2 p-0 ml-4">
              <img
                src={`https://avatar.iran.liara.run/public/job/teacher/male`}
                alt="User"
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className='flex flex-col mr-4 items-start normal-case'>
                <span className='text-sm font-medium text-gray-900'>
                  {user?.username || "John Doe"}
                </span>
                <span className='text-xs text-gray-500 normal-case'>
                  {user?.email || "Loading..."}
                </span>
              </div>
            </Button>
          </MenuHandler>
          <MenuList className="p-1 border border-pink-50">
            {/* <MenuItem className="flex items-center gap-2 rounded hover:bg-gray-100">
              Your Profile
            </MenuItem> */}
            {/* <MenuItem className="flex items-center gap-2 rounded hover:bg-gray-100">
              Settings
            </MenuItem> */}
            {/* <hr className="my-2 border-blue-gray-50" /> */}
            <MenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 rounded inherit  hover:bg-gray-100 text-red-500"
            >
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    </header>
  );
};

export default Header;
