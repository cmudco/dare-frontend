import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchProjects } from '@/redux/asyncThunks/project'
import { selectProjects, selectProjectsStatus } from '@/redux/projectSlice'

/** The user's projects, loaded once per session by whichever view needs them first. */
export function useProjects() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(selectProjects)
  const status = useAppSelector(selectProjectsStatus)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProjects())
    }
  }, [status, dispatch])

  return { projects, status }
}
