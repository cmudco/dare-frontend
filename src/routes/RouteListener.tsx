import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { resetError } from "../redux/userSlice";


import { ReactNode } from "react";

interface RouteListenerProps {
  children: ReactNode;
}

const RouteListener: React.FC<RouteListenerProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(resetError());
  }, [location, dispatch]);

  return <>{children}</>;
};

export default RouteListener;