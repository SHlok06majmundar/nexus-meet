import React from "react";

import { Routes, Route, useLocation } from "react-router-dom";

// components
import Header from "./Header";
import Sidebar from "./Sidebar";

// pages
import Home from "../page/Home";
import Room from "../page/Room";
import NotFound from "../page/NotFound";
import NewRoom from "../page/NewRoom";

const App = () => {
  const location = useLocation();
  console.log("🌐 Current route:", location.pathname);
  
  return (
    <div className="flex min-h-screen bg-neutral-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/room/:roomID" element={<NewRoom />} /> */}
            <Route path="/room/:roomID" element={<Room />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
