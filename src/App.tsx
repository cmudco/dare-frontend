import { useDispatch, useSelector } from 'react-redux';
import { getUserData } from './redux/aynscThunks/user';
import { AppDispatch, RootState } from './redux/store';
import AppRoutes from './routes/AppRoutes';
import Loader from './components/Loader';
import { useEffect } from 'react';


function App() {
  const dispatch = useDispatch<AppDispatch>();

  const { userLoading, user } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    if (!user) {
      dispatch(getUserData());
    }
  }, []);

  if (userLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="relative h-screen w-full backdrop-blur">
          <div className="absolute sm:block hidden w-full h-full">
            <img src="/shapes/BgCircle.svg" alt="" />
          </div>
          <div className="flex items-center justify-center h-full">
            <Loader className='w-16 h-16 text-red-500' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;