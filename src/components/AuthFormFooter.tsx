import React from "react";
import { Link } from "react-router-dom";

interface AuthFormFooterProps {
  text: string;
  route: string;
  routeText: string;
}

const AuthFormFooter: React.FC<AuthFormFooterProps> = ({ text, route, routeText }) => {
  return (
    <p className="text-center text-sm text-gray-500 mt-4">
      {text}{" "}
      <Link to={route} className="text-primary font-body font-bold">
        {routeText}
      </Link>
    </p>
  );
};

export default AuthFormFooter;