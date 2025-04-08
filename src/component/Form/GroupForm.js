import React, { useContext, useState, useRef, useEffect } from "react";
import { TermisContext } from "../../context/context";
import Modal from "../Modal/modal";
const { ipcRenderer } = window.require("electron");


const AddGroupForm = () => {
  const [text, setText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        setIsModalOpen(false);
      } else if (response === -1) {
        console.error("Failed to create group");
        alert("Failed to create group. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className=" rounded-lg  max-w-md ml-[5%]">
 
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Group</h2>

   
      <div className="mb-4">
      
        <input
          id="group-label"
          type="text"
          placeholder="Enter Name"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

   
      <div className="flex justify-end space-x-3">
       
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
          onClick={handleAddGroup}
        >
          Add Group
        </button>
      </div>
    </div>
  );
};

export default AddGroupForm