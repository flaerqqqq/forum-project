import { Link } from "react-router-dom";

const UserNotFound = () => {
    return (
        <div className="h-[calc(100vh-5.6rem)] bg-background-light-gray flex flex-col">
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-700 mb-4">😕 User Not Found</h1>
                    <p className="text-gray-500">The user you're looking for doesn't exist.</p>
                    <Link to="/" className="text-blue-600 underline mt-4 block">
                        Go back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserNotFound;