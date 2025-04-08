import React, { useState, useContext } from "react";
import { TermisContext } from "../../context/context";
const { ipcRenderer } = window.require("electron");

const AddGroupModal = ({ isOpen, onClose }) => {
  const [text, setText] = useState("");
  const { setHosts, setGroups } = useContext(TermisContext);

  const handleAddGroup = async () => {
    try {
      if (!text.trim()) {
        alert("Group label cannot be empty");
        return;
      }

      const response = await ipcRenderer.invoke("create-group", text);

      if (response === 1) {
        const data = await ipcRenderer.invoke("get-system-data");

        if (data.hosts) setHosts(data.hosts);
        if (data.groups) setGroups(data.groups);

        setText("");
        onClose();
      } else if (response === -1) {
        console.error("Failed to create group");
        alert("Failed to create group. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] max-w-[90%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add New Group</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div>
          <div className="mb-4">
            <label
              htmlFor="group-label"
              className="block text-sm font-medium text-gray-700"
            >
              Group Label
            </label>
            <input
              id="group-label"
              type="text"
              placeholder="Enter Name"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddGroup}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGroupModal;
