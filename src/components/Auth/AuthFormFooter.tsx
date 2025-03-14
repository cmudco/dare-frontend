import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

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
        <Link to={route} className="text-[#023572] font-body font-bold">
          {routeText}
        </Link>
      ) : (
        <Button onClick={onClick} className="font-body font-bold">
          {routeText}
        </Button>
      )}
    </p>
  );
};

export default AuthFormFooter;
