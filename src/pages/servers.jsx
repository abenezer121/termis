import React, { useContext, useState } from 'react'
import {FiFolder} from 'react-icons/fi'
import { TermisContext } from '../context/context'
import Hosts from '../component/Host/hosts'
import Search from '../component/Search/search'

const ServersTab = () => {
  const { groups, setCurrentDisplay, addToView,} = useContext(TermisContext)

  return (
    <div>
      <Search />

      {/* Groups */}
      <h3 className="text-lg font-semibold mb-2">Groups</h3>
      <div className="mb-4 mt-[3%] grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((value, index) => {
          return (
            <div
              className=""
              onClick={() => {
                setCurrentDisplay({
                  page: 'group',
                  identifier: value.name,
                  parentId: value.id,
                })
                addToView(value.name)
              }}
            >
              <div className="bg-white rounded-md shadow-sm p-4 flex items-center space-x-4">
                <FiFolder size={20} className="mr-2 text-blue-500" />
                <div>
                  <p className="font-bold text-gray-800">{value.name}</p>
                  <span className="text-sm text-gray-500">
                    {value.hostsCount} Hosts
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
   
      <Hosts />
    </div>
  )
}

export default ServersTab
