import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext'; // Assuming useUser hook is available
import { Oval } from 'react-loader-spinner'; // Import the spinner for loading state
import 'react-toastify/dist/ReactToastify.css'; // Toastify styles

const CategoryView = ({ category }) => {
    const navigate = useNavigate();
    const { user, loading: userLoading } = useUser();
    const [isFollowed, setIsFollowed] = useState(false);
    const [loadingFollowStatus, setLoadingFollowStatus] = useState(true); // Loading state for follow/unfollow
    const [followActionError, setFollowActionError] = useState(null); // Error state for follow action

    useEffect(() => {
        // Fetch follow status when category and user are available
        if (userLoading || !category) {
            setLoadingFollowStatus(true);
            return;
        }

        const checkFollowStatus = async () => {
            setLoadingFollowStatus(true);
            setFollowActionError(null);

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/v1/categories/${category.id}/follows/${user.publicId}`
                );
                setIsFollowed(true);
            } catch (err) {
                if (err.response?.status === 400) {
                    setIsFollowed(false); // 404 means not followed
                } else {
                    console.error('Failed to fetch follow status', err);
                    setFollowActionError('Failed to fetch follow status.');
                    toast.error('Failed to fetch follow status.');
                    setIsFollowed(false);
                }
            } finally {
                setLoadingFollowStatus(false);
            }
        };

        checkFollowStatus();
    }, [category?.id, user?.publicId, userLoading, category]);

    const handleFollowClick = async (event) => {
        event.stopPropagation(); // Prevent the card click (redirection) from happening

        if (!user) {
            navigate('/login');
            return;
        }

        setLoadingFollowStatus(true);
        setFollowActionError(null);

        const token = Cookies.get('token');
        if (!token) {
            console.error('No JWT token found.');
            navigate('/login');
            setLoadingFollowStatus(false);
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            if (isFollowed) {
                await axios.delete(`http://localhost:8080/api/v1/categories/${category.id}/follows`, config);
                setIsFollowed(false);
            } else {
                await axios.post(`http://localhost:8080/api/v1/categories/${category.id}/follows`, {}, config);
                setIsFollowed(true);
            }
        } catch (err) {
            console.error('Failed to follow/unfollow category.', err);
            setFollowActionError('Failed to update follow status.');
            toast.error('Failed to update follow status.');
        } finally {
            setLoadingFollowStatus(false);
        }
    };

    const navigateToCategoryPage = () => {
        navigate(`/categories/${category.slug}`);
    };

    return (
        <div
            className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300`}
            onClick={navigateToCategoryPage}
        >
            <div className="flex p-4 space-x-4">
                {/* Icon Section */}
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <img
                        src={category.iconUrl || '/default-icon.png'} // Fallback to a default icon if no icon is provided
                        alt="Category Icon"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex-grow">
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-300">{category.name}</h2>

                        {/* Description with 2-line limit and fixed height */}
                        <p className="text-gray-600 mt-2 line-clamp-2" style={{ height: '3rem' }}>
                            {category.description}
                        </p>

                        {/* Number of followers */}
                        <p className="text-sm text-gray-500 mt-2">
                            {category.followersCount} {category.followersCount === 1 ? 'follower' : 'followers'}
                        </p>
                    </div>

                    {/* Follow button section */}
                    {user && (
                        <div className={`mt-4 transition-all duration-300 ${isFollowed ? 'h-12' : 'h-12'}`}>
                            <button
                                onClick={handleFollowClick}
                                disabled={loadingFollowStatus}
                                className={`${
                                    isFollowed ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                                } text-white font-medium px-6 py-2 rounded-full focus:outline-none transition-colors duration-300`}
                            >
                                {loadingFollowStatus ? (
                                    <Oval height={16} width={16} color="#fff" secondaryColor="#ffffff33" strokeWidth={5} visible={true} />
                                ) : (
                                    isFollowed ? 'Following' : 'Follow'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryView;