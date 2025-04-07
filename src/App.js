import { useState, useContext, useEffect } from 'react'
import { TermisProvider, TermisContext } from './context/context'
import { FaUbuntu, FaWindows } from 'react-icons/fa'
import Sidebar from './component/Layout/sidebar'

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
        host: '9.141.20.46',
        username: 'azureadmin',
        privateKey: '/home/abenezer121/Downloads/sshkeys/gebeta_key_test_1.pem',
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

  return <Sidebar />
}



export default App