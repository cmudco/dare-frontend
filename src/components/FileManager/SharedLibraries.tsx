import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../../redux/store'
import {
  selectLibraries,
  selectLibrariesLoaded,
} from '../../redux/librarySlice'
import {
  getSharedLibraries,
  addLibrary,
  removeLibrary,
} from '../../redux/asyncThunks/library'
import SharedLibraryCard from './SharedLibraryCard'

const SharedLibraries = () => {
  const dispatch = useDispatch<AppDispatch>()
  const libraries = useSelector(selectLibraries)
  const loaded = useSelector(selectLibrariesLoaded)

  useEffect(() => {
    if (!loaded) {
      dispatch(getSharedLibraries())
    }
  }, [dispatch, loaded])

  const handleToggleAdd = (id: number) => {
    const library = libraries.find((l) => l.id === id)
    if (!library) return
    dispatch(library.isAdded ? removeLibrary(id) : addLibrary(id))
  }

  return (
    <div className='flex flex-col gap-4 px-2.5 pt-4'>
      <p className='text-sm text-muted-foreground'>
        Curated, ready-to-search datasets. Add one to query it alongside your
        own documents.
      </p>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {libraries.map((library) => (
          <SharedLibraryCard
            key={library.id}
            library={library}
            onToggleAdd={handleToggleAdd}
          />
        ))}
      </div>
    </div>
  )
}

export default SharedLibraries
