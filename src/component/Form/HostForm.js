import React, { useState , useContext } from "react";

import { TermisContext } from "../../context/context";
const { ipcRenderer } = window.require("electron");
const AddHostForm = () => {
    const { setHosts, setGroups , currentDisplay } = useContext(TermisContext);
  const [formData, setFormData] = useState({
    address: "",
    label: "",
    parentGroup: currentDisplay.page == "group" ? currentDisplay.identifier : "",
    privateKey: "",
    port: 22,
    username: "",
    password: "",
    parentId : currentDisplay.page == "group" ? currentDisplay.parentId : ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  console.log(currentDisplay)
  const handleFilePicker = async () => {
    try {
      const filePath = await ipcRenderer.invoke("open-file-dialog");
      if (filePath) {
        setFormData((prevData) => ({
          ...prevData,
          privateKey: filePath, // Update the state with the selected file path
        }));
      }
    } catch (error) {
      console.error("Error opening file picker:", error);
    }
  };


  const handleAddHost = async () => {
    try {
      if (formData.address.trim() == "" && formData.username.trim()) {
        alert("Fields can not be empty");
        return;
      }

      const response = await ipcRenderer.invoke("create-host", formData);

      if (response === 1) {
        const data = await ipcRenderer.invoke("get-system-data");

        if (data.hosts) setHosts(data.hosts);
        if (data.groups) setGroups(data.groups);

        setFormData({
            address: "",
            label: "",
            parentGroup: "",
            privateKey: "",
            port: 22,
            username: "",
            password: "",
          });
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
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-full max-w-xl">
        {/* Address Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900">Address</h3>
          <div className="mt-2 flex items-center space-x-4">
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="IP"
              className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* General Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900">General</h3>
          <div className="mt-2">
            <div className="mb-2">
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder="Label"
                className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-2">
              <input
                type="text"
                id="parentGroup"
                name="parentGroup"
                value={formData.parentGroup}
                onChange={handleChange}
                placeholder="Parent Group"
                className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900">SSH on</h3>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="number"
              id="port"
              name="port"
              value={formData.port}
              onChange={handleChange}
              className="w-20 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <span className="text-gray-500">port</span>
          </div>
          <div className="mt-4 pt-4 rounded-md">
            <p className="text-sm font-medium text-gray-900">
              Credentials from Personal vault
            </p>
            <div className="mt-2">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full mt-2 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={handleFilePicker}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                <span>Private Key</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
              </button>

              {/* Display Selected File Name */}
              <span className="text-sm text-gray-500">
                {formData.privateKey ? formData.privateKey : "No file selected"}
              </span>
            </div>
          </div>
        </div>

        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => { handleAddHost()}}
        >
          Add Host
        </button>
      </div>
    </div>
  );
};

export default AddHostForm;