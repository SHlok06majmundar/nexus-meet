import React from "react";
import { sideMenuData } from "../constants/SideMenuData";

import { Link, NavLink } from "react-router-dom";

// icons
import { FiSettings as SettingIcon } from "react-icons/fi";

const Sidebar = () => {
  return (
    <aside className="bg-neutral-900/95 backdrop-blur-md flex flex-col items-center justify-between p-4 w-[72px] h-screen border-r border-neutral-800/50 shadow-medium">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <Link 
          to="/" 
          className="group relative"
          title="Nexus Meet"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-strong transition-all duration-200 group-hover:scale-110">
            <span className="text-white font-bold text-lg">N</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {sideMenuData?.map((item, index) => (
            <NavLink
              to={item.route}
              key={index}
              className={({ isActive }) =>
                `relative flex items-center justify-center h-11 w-11 text-lg group transition-all duration-200 rounded-xl
                ${
                  isActive
                    ? "bg-primary-600 text-white shadow-glow"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`
              }
            >
              <div className="relative">
                {item?.icon}
                {/* Tooltip */}
                <span className="absolute z-20 top-1/2 left-14 -translate-y-1/2 px-3 py-2 text-xs font-medium text-white bg-neutral-800 rounded-lg shadow-strong opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-neutral-700">
                  {item.text}
                  {/* Arrow */}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-neutral-800 rotate-45 border-l border-b border-neutral-700"></div>
                </span>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Settings */}
      <button className="flex items-center justify-center h-11 w-11 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-200 rounded-xl group" title="Settings">
        <SettingIcon className="text-lg group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </aside>
  );
};

export default Sidebar;
