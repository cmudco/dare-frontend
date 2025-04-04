import { useDispatch, useSelector } from 'react-redux'
import { getUserData } from './redux/aynscThunks/user'
import { AppDispatch, RootState } from './redux/store'
import AppRoutes from './routes/AppRoutes'
import Loader from './components/Loader'
import { useEffect } from 'react'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { userLoading, user } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    if (!user) {
      dispatch(getUserData())
    }
  }, [])

  const BackgroundCircle = () => (
    <div className='pointer-events-none fixed left-0 top-0 z-[-1] h-full w-full overflow-hidden backdrop-blur'>
      <img
        src='/shapes/BgCircle.svg'
        alt='Background Circle'
        className='absolute left-0 top-0 h-auto w-full object-cover'
      />
    </div>
  )

  if (userLoading) {
    return (
      <div className='fixed inset-0 flex items-center justify-center'>
        <BackgroundCircle />
        <div className='flex h-full items-center justify-center'>
          <Loader className='h-16 w-16 text-red-500' />
        </div>
      </div>
    )
  }

  return (
    <>
      <BackgroundCircle />
      <AppRoutes />
    </>
  )
}

export default App
