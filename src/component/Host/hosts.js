import React, { useContext, useState } from 'react'
import { TermisContext } from '../../context/context'
import XtermTerminal from '../Terminal/terminal'

const Hosts = () => {
  const {
    searchQuery,
    setSearchQuery,
    addNewTab,
    hosts,
    groups,
    setCurrentDisplay,
    addToView,
  } = useContext(TermisContext)

  const filteredHosts = hosts.filter((host) =>
    host.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Hosts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredHosts.map((host) => (
          <div
            onClick={() => {

              addNewTab(host.name, host.id, 'terminal' , host.host , host.username , host.privateKey , host.port , 
              
              <XtermTerminal 
                host={host.host}
                privateKey = {host.privateKey} 
                username = {host.username} 
                port = {host.port}
              />)
              setCurrentDisplay({ page: 'terminal', identifier: host.id })
            }}
            key={host.id}
            className="bg-white rounded-md shadow-sm p-4 flex items-center space-x-4"
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
  )
}

export default Hosts
