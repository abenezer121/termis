
import React, { useContext } from 'react'
import { TermisContext } from '../../context/context'

const Search = () => {
  const { searchQuery, setSearchQuery } = useContext(TermisContext)

  return (
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full p-2 border rounded-md mb-4"
    />
  )
}

export default Search