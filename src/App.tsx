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
    <div className='fixed top-0 left-0 w-full h-full z-[-1] overflow-hidden pointer-events-none backdrop-blur'>
      <img
        src='/shapes/BgCircle.svg'
        alt='Background Circle'
        className='absolute top-0 left-0 w-full h-auto object-cover'
      />
    </div>
  )

  if (userLoading) {
    return (
      <div className='fixed inset-0 flex items-center justify-center'>
        <BackgroundCircle />
        <div className='flex items-center justify-center h-full'>
          <Loader className='w-16 h-16 text-red-500' />
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
