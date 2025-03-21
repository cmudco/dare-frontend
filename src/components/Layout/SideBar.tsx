import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RectangleGroupIcon,
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";
import { FolderIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Network, Terminal } from "lucide-react";
import { TooltipProvider } from "../ui/tooltip";

const GradientText = ({ children = "", className = "" }) => (
  <span className={`bg-dare-gradient bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

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
    { name: "Conversations", icon: ChatBubbleLeftIcon, path: "/conversation" },
    { name: "Files", icon: FolderIcon, path: "/files" },
    { name: "Prompts", icon: Terminal, path: "/prompts" },
    { name: "Workflows", icon: Network, path: "/workflows" },
  ];

  const bottomItems = [
    { name: "Help", icon: QuestionMarkCircleIcon, path: "/help" },
    { name: "Settings", icon: Cog8ToothIcon, path: "/settings" },
  ];

  return (
    <TooltipProvider>
      <div
        className={`relative flex ${isCollapsed ? "w-[80px]" : "w-[160px] md:w-[200px] lg:w-[260px]"
          } flex-col h-[auto] min-h-[90vh] bg-white bg-clip-border text-gray-700 shadow-blue-gray-900/5 transition-all duration-300 border border-t-0 border-pink-50`}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-4 transition-all -right-4 transform translate-x-0 mt-1 p-1 rounded-full bg-white hover:bg-primary-dark border-2 border-border-gray`}
          >
            <ChevronLeftIcon
              className={`w-5 h-5 text-primary font-bold transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-2 font-sans text-base font-normal flex-grow">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/conversation"
                ? location.pathname.startsWith("/conversation")
                : location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={undefined}
                className={`flex items-center w-full p-3 leading-tight transition-all rounded-xl outline-none text-start ${isActive
                  ? "bg-sky-50"
                  : "hover:bg-gray-200 hover:bg-opacity-80 hover:text--gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                  }`}
              >
                {isActive ? (
                  <item.icon
                    className={`w-5 h-5 font-bold transition-all duration-300 shrink-0 ${isCollapsed ? "mx-auto" : "mr-2"
                      }`}
                  />
                ) : (
                  <item.icon
                    className={`w-5 h-5 font-bold transition-all duration-300 shrink-0 ${isCollapsed ? "mx-auto" : "mr-2"
                      }`}
                  />
                )}
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                    }`}
                >
                  {isActive ? <GradientText>{item.name}</GradientText> : item.name}
                </span>
              </Link>
            );
          })}

          <div className="mt-auto sticky bottom-0">
            {bottomItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start ${location.pathname === item.path
                  ? "bg-primary text-white"
                  : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                  }`}
              >
                <item.icon
                  className={`w-5 h-5 font-bold transition-all duration-300 shrink-0 ${isCollapsed ? "mx-auto" : "mr-4"
                    }`}
                />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                    }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;