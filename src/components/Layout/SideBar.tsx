import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RectangleGroupIcon,
  FolderIcon,
  ChatBubbleBottomCenterIcon,
  QuestionMarkCircleIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); 

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: RectangleGroupIcon, path: "/dashboard" },
    { name: "Files", icon: FolderIcon, path: "/files" },
    { name: "Chat", icon: ChatBubbleBottomCenterIcon, path: "/chat" },
  ];

  const bottomItems = [
    { name: "Help", icon: QuestionMarkCircleIcon, path: "/help" },
    { name: "Settings", icon: Cog8ToothIcon, path: "/settings" },
  ];

  return (
    <div
      className={`relative flex h-[calc(100vh)] ${
        isCollapsed ? "w-[80px]" : "xl:w-[320px] lg:w-[240px] md:w-[200px] w-[160px]"
      } flex-col bg-white bg-clip-border text-gray-700 shadow-xl shadow-blue-gray-900/5 transition-width duration-300`}
    >
      <div className='flex items-center justify-between p-4 mb-2'>
        <img
          src='/icons/LogoWithText.png'
          alt='Logo'
          className={`h-12 transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"} mx-auto`}
        />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-4 ${
            isCollapsed ? "left-1/2 transform -translate-x-1/2" : "right-4"
          } p-2 rounded-full bg-lightpink hover:bg-primary-dark border-2 border-border-gray transition-all duration-300`}
        >
          {isCollapsed ? (
            <ChevronRightIcon className='w-5 h-5 text-primary font-bold' />
          ) : (
            <ChevronLeftIcon
              className={`w-5 h-5 text-primary font-bold transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
      </div>
      <nav className='flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700 flex-grow'>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start ${
              location.pathname === item.path
                ? "bg-primary text-white"
                : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
            }`}
          >
            <item.icon
              className={`w-5 h-5 font-bold ${
                isCollapsed ? "mx-auto" : "mr-4"
              }`}
            />
            {!isCollapsed && item.name}
          </Link>
        ))}
        <div className='mt-auto'>
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start ${
                location.pathname === item.path
                  ? "bg-primary text-white"
                  : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 font-bold ${
                  isCollapsed ? "mx-auto" : "mr-4"
                }`}
              />
              {!isCollapsed && item.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
