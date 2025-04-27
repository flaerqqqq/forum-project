import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';  // Import the context hook
import { Oval } from 'react-loader-spinner';  // Import the spinner
import Cookies from 'js-cookie';

const CategoryHeader = ({ category }) => {
    const { user, loading: userLoading } = useUser();  // Get user data and loading state from context
    const [isFollowed, setIsFollowed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (userLoading) return;  // Wait for user data to load

        if (!user) {
            setLoading(false);
            return;
        }

        const checkFollowStatus = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/v1/categories/${category.id}/follows/${user.publicId}`
                );
                setIsFollowed(true);  // Category is followed by the user
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setIsFollowed(false);  // Category is not followed by the user
                } else {
                    setError("Failed to fetch follow status.");
                }
            } finally {
                setLoading(false);
            }
        };

        checkFollowStatus();
    }, [category.id, user, userLoading]);

    const handleFollowClick = async () => {
        if (!user) {
            // Redirect to login if the user is not authenticated
            navigate('/login');
            return;
        }

        const token = Cookies.get('token');  // Retrieve the JWT token from cookies

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,  // Add JWT token to the Authorization header
                },
            };

            if (isFollowed) {
                // Unfollow the category
                await axios.delete(`http://localhost:8080/api/v1/categories/${category.id}/follows`, config);
            } else {
                // Follow the category
                await axios.post(`http://localhost:8080/api/v1/categories/${category.id}/follows`, {}, config);
            }

            setIsFollowed(!isFollowed);  // Toggle follow status
        } catch (err) {
            setError("Failed to follow/unfollow category.");
        }
    };

    if (loading || userLoading) {
        return (
            <div className="flex justify-center items-center w-full h-32">
                <Oval
                    height={40}
                    width={40}
                    color="#3b82f6"
                    secondaryColor="#dbeafe"
                    strokeWidth={4}
                    visible={true}
                />
            </div>
        );
    }

    return (
        <div className="relative mb-6 overflow-hidden">
            {/* Banner */}
            {category.bannerUrl ? (
                <img
                    src={category.bannerUrl}
                    alt="Category Banner"
                    className="w-full h-32 object-cover rounded-lg"
                />
            ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded-t-lg">
                    No Banner
                </div>
            )}

            {/* White background block under the banner */}
            <div className="relative p-4 flex items-center">
                {/* Icon */}
                <div className="absolute -top-8 left-4 bg-gray-100 p-1 rounded-full">
                    {category.iconUrl ? (
                        <img
                            src={category.iconUrl}
                            alt="Category Icon"
                            className="w-20 h-20 rounded-full border-1 border-white object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full border-1 border-white bg-gray-200 flex items-center justify-center text-gray-400">
                            No Icon
                        </div>
                    )}
                </div>

                {/* Name and followers */}
                <div className="ml-24">
                    <h1 className="text-2xl pl-2 font-semibold text-gray-900 tracking-tight">
                        {category.name}
                    </h1>
                </div>

                {/* Follow button */}
                <div className="ml-auto">
                    <button
                        onClick={handleFollowClick}
                        className={`${
                            isFollowed ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white text-sm font-semibold py-2 px-4 rounded-full transition duration-300`}
                    >
                        {isFollowed ? 'Following' : 'Follow'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryHeader;