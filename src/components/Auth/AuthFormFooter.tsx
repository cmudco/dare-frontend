import React from "react";
import { Link } from "react-router-dom";

interface AuthFormFooterProps {
  text: string;
  route?: string;
  routeText: string;
  onClick?: () => void;
}

const AuthFormFooter: React.FC<AuthFormFooterProps> = ({ text, route, routeText, onClick }) => {
  return (
    <p className="text-center text-sm text-gray-500 mt-4">
      {text}{" "}
      {route ? (
        <Link to={route} className="text-primary font-body font-bold">
          {routeText}
        </Link>
      ) : (
        <button onClick={onClick} className="text-primary font-body font-bold">
          {routeText}
        </button>
      )}
    </p>
  );
};

export default AuthFormFooter;
