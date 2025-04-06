import React, { useContext, useState } from 'react'
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
import { TermisContext } from '../context'
import Search from './search'

const GroupPage = () => {
  const {
    searchQuery,
    setSearchQuery,
    hosts,
    groups,
    view,
    removeLastIndexFromView,
    setCurrentDisplay,
    currentDisplay,
    addNewTab,
  } = useContext(TermisContext)

  const filteredHosts = hosts.filter(
    (host) =>
      host.parentId &&
      host.parentId.includes(currentDisplay.parentId) &&
      host.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // remove from the end to the index - 1
  // at this stage i only work it for length 2 array
  let removeFromViewsArray = (index) => {
    if (index != view.length - 1) {
      removeLastIndexFromView()
      setCurrentDisplay({
        page: view[0],
        identifier: view[0],
      })
    }
  }

  return (
    <div>
      {view.map((item, index) => (
        <React.Fragment key={index}>
          <span
            onClick={() => removeFromViewsArray(index)}
            style={{ cursor: 'pointer', margin: '0 5px' }}
          >
            {item}
          </span>
          {index < view.length - 1 && (
            <span style={{ margin: '0 5px' }}>→</span>
          )}
        </React.Fragment>
      ))}

      <Search />

      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-[2%]">
          {filteredHosts.map((host) => (
            <div
              key={host.id}
              className="bg-white rounded-md shadow-sm p-4 flex items-center space-x-4"
              onClick={() => {
                setCurrentDisplay({ page: 'terminal', identifier: host.id })
                addNewTab(host.name, host.id, 'terminal')
              }}
            >
              {host.icon}
              <div>
                <p className="font-bold text-gray-800">{host.name}</p>
                <span className="text-sm text-gray-500">
                  {host.connectionDetails}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GroupPage
