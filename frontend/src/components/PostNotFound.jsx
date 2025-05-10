import { Link } from "react-router-dom";

const PostNotFound = ({ accessDenied = false }) => {
    const title = accessDenied ? "🚫 Access Denied" : "😕 Post Not Found";
    const message = accessDenied
        ? "You do not have permission to view this post."
        : "The post you are looking for does not exist or has been removed.";

    return (
        <div className="h-[calc(100vh-5.6rem)] bg-background-light-gray flex flex-col">
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-700 mb-4">{title}</h1>
                    <p className="text-gray-500">{message}</p>
                    <Link to="/" className="text-blue-600 underline mt-4 block">
                        Go back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostNotFound;