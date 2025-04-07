import React, { useContext, useState, useRef, useEffect } from "react";
import { TermisContext } from "../../context/context";
const { ipcRenderer } = window.require("electron");


const Search = () => {
  const { searchQuery, setSearchQuery } = useContext(TermisContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text , setText] = useState('')
  const { setHosts, setGroups } = useContext(TermisContext);
  const dropdownRef = useRef(null);
  
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 mb-4">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="relative p-4 w-full max-w-2xl">
            <div className="relative bg-white rounded-lg shadow ">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <button
                  type="button"
                  className="text-gray-400 bg-transparent  hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => setIsModalOpen(false)}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* body */}
              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Group</h2>

                <div className="flex items-center mb-4">
                  <input
                    type="text"
                    placeholder="Label"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="border border-blue-500 focus:border-blue-700 focus:ring-blue-700 rounded-lg px-3 py-2 w-full"
                  />
                </div>

                <div className="flex items-center">
                  <button
                    type="text"
                    
                    className="border border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg px-3 py-2 w-full"
                    onClick={()=>{
                      ipcRenderer.invoke("create-group", text).then((response) => {
                        if (response === 1) {
                         
                          ipcRenderer.invoke("get-system-data").then((data) => {
                            if (data.hosts != undefined) setHosts(data.hosts);
                            if (data.groups != undefined) setGroups(data.groups);
                          });
                        } else if (response === -1) {
                         
                          console.error("Failed to create group");
                        }
                      }).catch((error) => {
                      
                        console.error("Unexpected error:", error);
                      });
                    }}
                  >add</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 pl-8 border rounded-md"
        />
        <svg
          className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center p-2 h-10 w-10 text-gray-600 hover:text-gray-900 bg-white border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                  setIsDropdownOpen(false);
                }}
              >
                Group
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Host
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                AWS Integration
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Azure Integration
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Import Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
