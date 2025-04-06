import { useState, useContext, useEffect } from 'react'
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
import ServersTab from './pages/servers'
import SFTPTab from './pages/sftp'
import SCPTab from './pages/scp'
import IdentitiesTab from './pages/identities'
import { TermisProvider, TermisContext } from './context'
import GroupPage from './pages/groups'
import XtermTerminal from './pages/terminal'

import { FaUbuntu, FaWindows } from 'react-icons/fa'

function App() {
  const { setHosts, setGroups } = useContext(TermisContext)
  useEffect(() => {
    setHosts([
      {
        id: 1,
        name: 'gtest1',
        icon: <FaUbuntu size={20} className="text-orange-500" />,
        connectionDetails: 'ssh, azureadmin',
        parentId: 'f3gda',
        host: '9.141.19.175',
        username: 'azureadmin',
        privateKey: '/home/abenezer121/Downloads/sshkeys/gebeta_key_prod_1.pem',
        port: 22
      },
      {
        id: 2,
        name: 'prod1',
        icon: <FaWindows size={20} className="text-red-500" />,
        connectionDetails: 'ssh, azureadmin',
        parentId: 'f3gda',
        host: '9.141.19.175',
        username: 'azureadmin',
        privateKey: '/home/abenezer121/Downloads/sshkeys/gebeta_key_prod_1.pem',
        port: 22
      },
      {
        id: 3,
        name: 'postoffice',
        icon: <FaWindows size={20} className="text-pink-500" />,
        connectionDetails: 'ssh, azureadmin',
        parentId: 'f3gde',
        host: '9.141.19.175',
        username: 'azureadmin',
        privateKey: '/home/abenezer121/Downloads/sshkeys/gebeta_key_prod_1.pem',
        port: 22
      },
    ])

    setGroups([
      {
        id: 'f3gda',
        name: 'Gebeta',
        hostsCount: 2,
      },
      {
        id: 'f3gde',
        name: 'Postoffice',
        hostsCount: 1,
      },
    ])
  }, [])

  return <MainSideSection />
}

const MainSideSection = () => {
  const { currentDisplay, setCurrentDisplay } = useContext(TermisContext)

  return (
    <div className="flex h-screen text-gray-800 overflow-hidden">
      <div className="w-64 flex flex-col border-r border-gray-300 bg-gray-100">
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-blue-500">Termis</h1>
        </div>

        <div className="mt-4 overflow-y-auto">
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              currentDisplay === 'servers' ? 'bg-gray-200' : ''
            }`}
            onClick={() =>
              setCurrentDisplay({ page: 'servers', identifier: 'servers' })
            }
          >
            <div className="flex items-center">
              <FiServer size={16} className="mr-2" />
              <span className="font-medium">Servers</span>
            </div>
          </div>
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              currentDisplay === 'sftp' ? 'bg-gray-200' : ''
            }`}
            onClick={() =>
              setCurrentDisplay({ page: 'sftp', identifier: 'sftp' })
            }
          >
            <div className="flex items-center">
              <FiServer size={16} className="mr-2" />
              <span className="font-medium">SFTP</span>
            </div>
          </div>
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              currentDisplay === 'scp' ? 'bg-gray-200' : ''
            }`}
            onClick={() =>
              setCurrentDisplay({ page: 'scp', identifier: 'scp' })
            }
          >
            <div className="flex items-center">
              <FiServer size={16} className="mr-2" />
              <span className="font-medium">SCP</span>
            </div>
          </div>
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              currentDisplay === 'identities' ? 'bg-gray-200' : ''
            }`}
            onClick={() =>
              setCurrentDisplay({
                page: 'identifier',
                identifier: 'identities',
              })
            }
          >
            <div className="flex items-center">
              <FiKey size={16} className="mr-2" />
              <span className="font-medium">Identities</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        <ChromeTabs />
        <MainContentSection />
      </div>
    </div>
  )
}

const MainContentSection = () => {
  const { currentDisplay, setCurrentDisplay } = useContext(TermisContext)

  const renderTabContent = () => {
    switch (currentDisplay.page) {
      case 'servers':
        return <ServersTab />
      case 'sftp':
        return <SFTPTab />
      case 'scp':
        return <SCPTab />
      case 'identities':
        return <IdentitiesTab />
      case 'group':
        return <GroupPage />
      case 'terminal':
        return <XtermTerminal />
      default:
        return <div>Select a tab</div>
    }
  }

  return <div className="flex-1 p-4">{renderTabContent()}</div>
}

export const ChromeTabs = () => {
  const { tabs, setTabs, setActiveTab, activeTabId, closeTab, addNewTab } =
    useContext(TermisContext)

  return (
    <div className="">
      <div className="bg-gray-200 px-3 pt-2 rounded-t-lg">
        <div className="flex overflow-x-auto">
          <div className="flex flex-nowrap">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-t-lg mr-1 cursor-pointer ${
                  tab.id === activeTabId
                    ? 'bg-white border-b-2 border-blue-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                <span className="truncate max-w-[180px]">{tab.title}</span>
                <span
                  onClick={(e) => closeTab(tab.id, e)}
                  className="ml-2 w-5 h-5 flex items-center justify-center hover:bg-gray-500 rounded-full"
                >
                  ×
                </span>
              </div>
            ))}
          </div>

          {/* <div
            onClick={addNewTab}
            className="flex items-center justify-center bg-gray-300 px-3 py-2 rounded-t-lg ml-1 cursor-pointer hover:bg-gray-400"
          >
            +
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default App
