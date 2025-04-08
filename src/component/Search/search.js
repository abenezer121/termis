import React, { useContext, useState, useRef, useEffect } from "react";
import { TermisContext } from "../../context/context";
import Modal from "../Modal/modal";
import AddGroupForm from "../Form/GroupForm";
import AddHostForm from "../Form/HostForm";
const { ipcRenderer } = window.require("electron");



const Search = () => {
  const { searchQuery, setSearchQuery } = useContext(TermisContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDropdownClick = (option) => {
    setIsDropdownOpen(false);
    setIsModalOpen(true);

    switch (option) {
      case "Group":
        setModalContent({
          title: "Group",
          body: <AddGroupForm />,
          actionButton: <div></div>,
        });
        break;

      case "Host":
        setModalContent({
          title: "Host",
          body: <AddHostForm />,
          actionButton: (
            <div></div>),
        });
        break;

      case "AWS Integration":
        setModalContent({
          title: "AWS Integration",
          body: <div>Unimplemented</div>,
          actionButton: (
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-md">
              Save AWS Config
            </button>
          ),
        });
        break;

      case "Azure Integration":
        setModalContent({
          title: "Azure Integration",
          body: <div>Unimplemented</div>,
          actionButton: (
            <button className="bg-indigo-500 text-white px-4 py-2 rounded-md">
              Save Azure Config
            </button>
          ),
        });
        break;

      case "Import Configuration":
        setModalContent({
          title: "Import Configuration",
          body: <div>Unimplemented</div>,
          actionButton: (
            <button className="bg-purple-500 text-white px-4 py-2 rounded-md">
              Import
            </button>
          ),
        });
        break;

      default:
        break;
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent?.title || ""}
        actionButton={modalContent?.actionButton}
      >
        {modalContent?.body}
      </Modal>

      {/* Search Input */}
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

      {/* Dropdown */}
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
                onClick={() => handleDropdownClick("Group")}
              >
                Group
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleDropdownClick("Host")}
              >
                Host
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleDropdownClick("AWS Integration")}
              >
                AWS Integration
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleDropdownClick("Azure Integration")}
              >
                Azure Integration
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleDropdownClick("Import Configuration")}
              >
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
