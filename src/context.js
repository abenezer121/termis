import { createContext } from 'react'
import { useState } from 'react'

export const TermisContext = createContext({
  view: ['servers'],
  activeTabs: [],
  hosts: [],
  groups: [],
  currentDisplay: { page: 'servers', identifier: 'servers' },
  terminalFontFamily: '"Fira Mono", monospace',
  terminalFontSize: 14,
  tabs: [],
  terminalTheme: {
    background: '#1e1e1e',
    foreground: '#f8f8f8',
    cursor: '#f8f8f8',
  },
  activeTabId: 0,
  searchQuery: '',

  setActiveTabId: () => {},
  setCurrentDisplay: () => {},
  addToView: (text) => {},
  removeFromView: (text) => {},
  removeLastIndexFromView: () => {},
  setActiveTabs: () => {},
  setHosts: () => {},
  setGroups: () => {},
  setTabs: () => {},
  addToTabs: () => {},
  setActiveTab: (id) => {},
  closeTab: (id, e) => {},
  addNewTab: (name, identifier, page) => {},
  setSearchQuery: () => {},
})

export const TermisProvider = ({ children }) => {
  const [terminalFontFamily, setTerminalFontFamily] = useState(
    '"Fira Mono", monospace'
  )
  const [terminalFontSize, setTerminalFontSize] = useState(14)
  const [terminalTheme, setTerminalTheme] = useState({
    background: '#1e1e1e',
    foreground: '#f8f8f8',
    cursor: '#f8f8f8',
  })
  const [activeTabs, setActiveTabs] = useState([0])
  const [currentDisplay, setCurrentDisplay] = useState({
    page: 'servers',
    identifier: 'servers',
    parentId: '',
  })
  const [view, setView] = useState(['servers'])
  const [hosts, setHosts] = useState([])
  const [groups, setGroups] = useState([])
  const [tabs, setTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState('0')
  const [searchQuery, setSearchQuery] = useState('')

  const closeTab = (id, e) => {
    e.stopPropagation()
    if (tabs.length <= 1) {
      setActiveTab(0)
      setTabs([])
      setCurrentDisplay({ page: 'servers' })
      return
    }

    const newTabs = tabs.filter((tab) => tab.id !== id)
    setTabs(newTabs)

    if (id === activeTabId) {
      const remainingTab = newTabs[newTabs.length - 1]
      setActiveTabId(remainingTab.id)
    }
  }

  const setActiveTab = (id) => {
    setActiveTabId(id)
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].id == id) {
        setCurrentDisplay({ page: 'terminal', identifier: tabs[i].identifier })
      }
    }
  }

  const addNewTab = (name, identifier, page) => {
    const newTabId = Date.now().toString()
    setTabs([
      ...tabs,
      {
        id: newTabId,
        title: name,
        identifier: identifier,
        page: page,
        content: (
          <div className="p-4">Content for New Tab {tabs.length + 1}</div>
        ),
      },
    ])
    setActiveTabId(newTabId)
  }

  const addToView = (text) => {
    if (view.length != 1) setView([view[0], text])
    else setView((prevView) => [...prevView, text])
  }

  const removeFromView = (text) => {
    setView((prevView) =>
      prevView.reduce((acc, item) => {
        if (item !== text) {
          acc.push(item)
        }
        return acc
      }, [])
    )
  }

  const removeLastIndexFromView = () => {
    if (view.length > 1) {
      const newView = view.slice(0, -1)
      setView(newView)
    }
  }

  return (
    <TermisContext.Provider
      value={{
        activeTabs,
        setActiveTabs,
        view,
        currentDisplay,
        setCurrentDisplay,
        addToView,
        removeFromView,
        removeLastIndexFromView,
        terminalFontFamily,
        terminalFontSize,
        terminalTheme,
        setTerminalFontFamily,
        setTerminalFontSize,
        setTerminalTheme,
        hosts,
        setHosts,
        groups,
        setGroups,
        addNewTab,
        tabs,
        setTabs,
        activeTabId,
        setActiveTabId,
        closeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </TermisContext.Provider>
  )
}
