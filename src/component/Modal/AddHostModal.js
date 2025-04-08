import React, { useContext, useState } from "react";
import { FiFolder, FiMoreVertical } from "react-icons/fi";
import { TermisContext } from "../../context/context";

const { ipcRenderer } = window.require("electron");

const AddHostModal = ({ isOpen, onClose }) => {
  const { setHosts, setGroups, currentDisplay } = useContext(TermisContext);


  const [formData, setFormData] = useState({
    address: "",
    label: "",
    parentGroup:
      currentDisplay.page === "group" ? currentDisplay.identifier : "",
    privateKey: "",
    port: 22,
    username: "",
    password: "",
    parentId: currentDisplay.page === "group" ? currentDisplay.parentId : "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFilePicker = async () => {
    try {
      const filePath = await ipcRenderer.invoke("open-file-dialog");
      if (filePath) {
        setFormData((prevData) => ({
          ...prevData,
          privateKey: filePath,
        }));
      }
    } catch (error) {
      console.error("Error opening file picker:", error);
    }
  };

  const handleAddHost = async () => {
    try {
      if (formData.address.trim() === "" || formData.username.trim() === "") {
        alert("Fields cannot be empty");
        return;
      }

      const response = await ipcRenderer.invoke("create-host", formData);

      if (response) {
        setHosts((prev) => [...prev, response]);
       
        setFormData({
          address: "",
          label: "",
          parentGroup: currentDisplay.parentId,
          privateKey: "",
          port: 22,
          username: "",
          password: "",
        });

        onClose();
      } else {
        throw new Error("Unexpected response format");
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
          <h2 className="text-lg font-semibold">Add Host</h2>
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
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="IP"
              className="p-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="label"
              className="block text-sm font-medium text-gray-700"
            >
              Label
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder="Label"
              className="p-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="parentGroup"
              className="block text-sm font-medium text-gray-700"
            >
              Parent Group
            </label>
            <input
              type="text"
              id="parentGroup"
              name="parentGroup"
              value={currentDisplay.identifier}
              readOnly
              placeholder="Parent Group"
              className="p-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm block"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="port"
              className="block text-sm font-medium text-gray-700"
            >
              SSH Port
            </label>
            <input
              type="number"
              id="port"
              name="port"
              value={formData.port}
              onChange={handleChange}
              placeholder="Port"
              className="p-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
         
            <div className="mt-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="p-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                // onChange={handleChange}
                readOnly
                placeholder="Currently not supported"
                className="p-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm "
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2">
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
              <span className="text-sm text-gray-500">
                {formData.privateKey ? formData.privateKey : "No file selected"}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium mr-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddHost}
              className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-600 focus:outline-none"
            >
              Add Host
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHostModal;
