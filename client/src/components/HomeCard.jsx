import React from "react";

const HomeCard = ({ icon, title, desc, bgColor, route, disabled = false }) => {
  const getGradientClass = () => {
    switch (bgColor) {
      case "bg-yellow":
        return "bg-gradient-to-br from-yellow to-orange-500";
      case "bg-blue":
        return "bg-gradient-to-br from-primary-500 to-primary-600";
      default:
        return "bg-gradient-to-br from-neutral-700 to-neutral-800";
    }
  };

  return (
    <div
      className={`meeting-card group p-6 rounded-2xl h-48 w-full glass border border-neutral-800/50 hover:border-primary-500/30 cursor-pointer transition-all duration-300 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl ${getGradientClass()} flex items-center justify-center text-white text-2xl shadow-medium group-hover:shadow-glow group-hover:scale-110 transition-all duration-300`}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-white text-xl font-semibold group-hover:text-primary-300 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/0 to-primary-600/0 group-hover:from-primary-600/5 group-hover:to-primary-600/10 rounded-2xl transition-all duration-300"></div>
    </div>
  );
};

export default HomeCard;
