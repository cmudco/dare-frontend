import { Spinner } from "@material-tailwind/react";

const Loader: React.FC = () => {
    return (
        <div className="relative h-screen w-full backdrop-blur">
            <div className="absolute sm:block hidden w-full h-full">
                <img src='/shapes/BgCircle.png' alt='' />
            </div>
            <div className="flex items-center justify-center h-full">
                <Spinner color="red" className="h-16 w-16" />
            </div>
        </div>
    );
};

export default Loader;
