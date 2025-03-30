import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RectangleGroupIcon,
  ChatBubbleLeftIcon,
  FolderOpenIcon,
  QuestionMarkCircleIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { TooltipProvider } from "../ui/tooltip";

const PromptsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);

const WorkflowsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="16" y="16" width="6" height="6" rx="1" />
    <rect x="2" y="16" width="6" height="6" rx="1" />
    <rect x="9" y="2" width="6" height="6" rx="1" />
    <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
    <path d="M12 12V8" />
  </svg>
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

  interface MenuItem {
    name: string;
    icon: React.ElementType;
    path: string;
  }

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: RectangleGroupIcon, path: "/dashboard" },
    { name: "Conversations", icon: ChatBubbleLeftIcon, path: "/conversation" },
    { name: "Files", icon: FolderOpenIcon, path: "/files" },
    { name: "Prompts", icon: PromptsIcon, path: "/prompts" },
    { name: "Workflows", icon: WorkflowsIcon, path: "/workflows" },
  ];

  const bottomItems = [
    { name: "Help", icon: QuestionMarkCircleIcon, path: "/help" },
    { name: "Settings", icon: Cog8ToothIcon, path: "/settings" },
  ];

  return (
    <TooltipProvider>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="dare-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EE183C" />
            <stop offset="100%" stopColor="#023572" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className={`relative flex ${isCollapsed ? "w-[80px]" : "w-[160px] md:w-[200px] lg:w-[18vw]"
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
                className={`flex items-center w-full p-3 leading-tight transition-all rounded-xl outline-none text-start ${isActive
                    ? "bg-sky-50"
                    : "hover:bg-gray-200 hover:bg-opacity-80 hover:text-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gradient-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                  }`}
              >
                <div className={`${isCollapsed ? "mx-auto" : "mr-2"} relative`}>
                  {isActive ? (
                    <item.icon
                      className="w-5 h-5 font-bold transition-all duration-300 shrink-0"
                      style={{
                        fill: "none",
                        stroke: "url(#dare-gradient)",
                        color: "url(#dare-gradient)",
                      }}
                    />
                  ) : (
                    <item.icon className="w-5 h-5 font-bold transition-all duration-300 shrink-0" />
                  )}
                </div>
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                    }`}
                >
                  {isActive ? (
                    <span className="bg-dare-gradient bg-clip-text text-transparent">
                      {item.name}
                    </span>
                  ) : (
                    item.name
                  )}
                </span>
              </Link>
            );
          })}

          <div className="mt-auto sticky bottom-0 bg-white z-10">
            {bottomItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start ${isActive
                      ? "bg-sky-50"
                      : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gradient-50 active:bg-opacity-80 active:text-blue-gray-900"
                    }`}
                >
                  <div className={`${isCollapsed ? "mx-auto" : "mr-4"} relative`}>
                    {isActive ? (
                      <item.icon
                        className="w-5 h-5 font-bold transition-all duration-300 shrink-0"
                        style={{
                          fill: "none",
                          stroke: "url(#dare-gradient)",
                          color: "url(#dare-gradient)",
                        }}
                      />
                    ) : (
                      <item.icon className="w-5 h-5 font-bold transition-all duration-300 shrink-0" />
                    )}
                  </div>
                  <span
                    className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                      }`}
                  >
                    {isActive ? (
                      <span className="bg-dare-gradient bg-clip-text text-transparent">
                        {item.name}
                      </span>
                    ) : (
                      item.name
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;