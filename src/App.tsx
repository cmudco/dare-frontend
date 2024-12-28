import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData } from './redux/aynscThunks/user';
import { AppDispatch, RootState } from './redux/store';
import AppRoutes from './routes/AppRoutes';
import Loader from './components/Loader';
import { useEffect } from 'react';


function App() {
  const dispatch = useDispatch<AppDispatch>();

  const { userLoading, user } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    console.log(userLoading, user)
    if (!user) {
      dispatch(fetchUserData());
    }
  }, []);

  if (userLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader />
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