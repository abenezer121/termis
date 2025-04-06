import React, { useContext, useState } from 'react'
import { TermisContext } from '../context'
import { FaUbuntu, FaWindows } from 'react-icons/fa'
import {
  FiServer,
  FiFolder,
  FiSettings,
  FiPlus,
  FiTerminal,
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiKey,
  FiBookmark,
} from 'react-icons/fi'

const Search = () => {
  const {
    searchQuery,
    setSearchQuery,
    addNewTab,
    hosts,
    groups,
    setCurrentDisplay,
    addToView,
  } = useContext(TermisContext)

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-white mt-[2%]">
      <div className="flex items-center space-x-4">
        <button className="flex items-center px-2 py-1 rounded-md hover:bg-gray-200">
          <FiPlus size={16} className="mr-2" /> New Host
        </button>
        <input
          type="text"
          placeholder="Find a host or ssh user@hostname..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-2 py-1 rounded-md focus:outline-none"
        />
      </div>
    </div>
  )
}

export default Search
