import React, { useContext } from "react";

import { TermisContext } from "../../context/context";
export const Tabs = () => {
  const { tabs, setActiveTab, activeTabId, closeTab } =
    useContext(TermisContext);

  return (
    <div className="">
      <div className="bg-gray-200 px-3 pt-2 rounded-t-lg">
        <div className="flex overflow-x-auto">
          <div className="flex flex-nowrap">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-t-lg mr-1 cursor-pointer ${
                  tab.id === activeTabId
                    ? "bg-white border-b-2 border-blue-500"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                <span className="truncate max-w-[180px]">{tab.title}</span>
                <span
                  onClick={(e) => closeTab(tab.id, e)}
                  className="ml-2 w-5 h-5 flex items-center justify-center hover:bg-gray-500 rounded-full"
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
