import React, { useContext, useState } from 'react'
import { TermisContext } from '../../context/context'

const Search = () => {
  const { searchQuery, setSearchQuery } = useContext(TermisContext)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div className="flex items-center gap-2 mb-4">
  
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 pl-8 border rounded-md   "
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

      <div className="relative">
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
          <div 
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
            onClick={() => setIsDropdownOpen(false)}
          >
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Group</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Host</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">AWS Integration</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Azure Integration</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Import Configuration</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search