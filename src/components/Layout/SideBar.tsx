import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RectangleGroupIcon,
  FolderIcon,
  ChatBubbleBottomCenterIcon,
  QuestionMarkCircleIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { GoCommandPalette } from "react-icons/go";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
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
    { name: "Chat", icon: ChatBubbleBottomCenterIcon, path: "/chat" },
    { name: "Files", icon: FolderIcon, path: "/files" },
    { name: "Prompts", icon: GoCommandPalette, path: "/prompts", disabled: true }, 
  ];

  const bottomItems = [
    { name: "Help", icon: QuestionMarkCircleIcon, path: "/help" },
    { name: "Settings", icon: Cog8ToothIcon, path: "/settings" },
  ];

  return (
    <div
      className={`relative flex ${
        isCollapsed
          ? "w-[80px]"
          : "w-[160px] md:w-[200px] lg:w-[260px]"
      } flex-col bg-white bg-clip-border text-gray-700 shadow-xl shadow-blue-gray-900/5 transition-width duration-300 border border-t-0 border-pink-50`}
    >
      <div className='flex items-center justify-between p-4  '>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-4 transition-all -right-4 transform translate-x-0 mt-1 p-1 rounded-full bg-lightpink hover:bg-primary-dark border-2 border-border-gray`}
        >
          <ChevronLeftIcon
            className={`w-5 h-5 text-primary font-bold transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      <nav className='flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700 flex-grow'>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.disabled ? "#" : item.path} 
            onClick={item.disabled ? (e) => e.preventDefault() : undefined} 
            className={`flex items-center w-full p-3 leading-tight transition-all rounded-xl outline-none text-start ${
              item.disabled
                ? "cursor-not-allowed opacity-50" 
                : location.pathname === item.path
                ? "bg-pink-50 text-primary"
                : "hover:bg-gray-200 hover:bg-opacity-80 hover:text--gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
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
        <div className='mt-auto '>
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
