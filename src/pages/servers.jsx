import React, { useContext, useState } from "react";
import { FiFolder, FiMoreVertical } from "react-icons/fi";
import { TermisContext } from "../context/context";
import Hosts from "../component/Host/hosts";
import Search from "../component/Search/search";
import ExportCollectionModal from "../component/Modal/ExportCollectionModal";
const { ipcRenderer } = window.require("electron");

const ServersTab = () => {
  const { groups, setCurrentDisplay, addToView } = useContext(TermisContext);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName , setGroupName] = useState("")
  const [groupId ,setGroupId] = useState("")
  
  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleDelete = (groupIndex) => {
    console.log("Deleting group:", groups[groupIndex].name);
    setActiveDropdown(null);
  };

  const handleExport = (groupIndex) => {
    setIsModalOpen(true);
    console.log("Exporting group:", groups[groupIndex].name);
    setActiveDropdown(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Search />

      <ExportCollectionModal isOpen={isModalOpen} onClose={closeModal} name={groupName} id={groupId} />

      <h3 className="text-lg font-semibold mb-2">Groups</h3>
      <div className="mb-4 mt-[2%] grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((value, index) => {
          return (
            <div key={index}>
              <div
                className="bg-white rounded-md shadow-sm p-4 flex items-center justify-between"
                onClick={() => {
                  setCurrentDisplay({
                    page: "group",
                    identifier: value.name,
                    parentId: value.id,
                  });
                  addToView(value.name);
                }}
              >
                <div className="flex items-center space-x-4">
                  <FiFolder size={20} className="mr-2 text-blue-500" />
                  <div>
                    <p className="font-bold text-gray-800">{value.name}</p>
                    <span className="text-sm text-gray-500">
                      {value.hostsCount} Hosts
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <FiMoreVertical
                    size={20}
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(index);
                    }}
                  />

                  {activeDropdown === index && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10">
                      <ul className="py-1">
                        <li
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);

                          }}
                        >
                          Delete
                        </li>
                        <li
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(index);
                            setGroupName(value.name)
                            setGroupId(value.id)
                          }}
                        >
                          Export
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Hosts />
    </div>
  );
};

export default ServersTab;
