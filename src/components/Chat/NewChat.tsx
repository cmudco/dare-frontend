import { Typography } from "@material-tailwind/react";

const NewChat: React.FC = () => {

    return (
        <div className="flex justify-center items-center h-full">
            <Typography variant="h3" className="text-center text-gray-900 mb-4">
            What can I help you with?
        </Typography>
        </div>
    );
};

export default NewChat;