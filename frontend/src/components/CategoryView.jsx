import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { Oval } from 'react-loader-spinner';
import 'react-toastify/dist/ReactToastify.css';

// Import the useFollowedCategories hook
import { useFollowedCategories } from '../contexts/FollowedCategoriesContext';

const CategoryView = ({ category }) => {
    const navigate = useNavigate();
    const { user, loading: userLoading } = useUser();
    // Use the hook to get followed categories state and update functions
    const { followedCategorySlugs, loadingFollowedCategories, addFollowedCategory, removeFollowedCategory } = useFollowedCategories();

    // Determine if the current category is followed based on the context state
    // Added a check to ensure followedCategorySlugs is an array before calling .includes()
    const isFollowed = followedCategorySlugs.includes(category?.slug);

    // Local state to manage the loading state specifically for the follow/unfollow action
    const [isFollowActionLoading, setIsFollowActionLoading] = useState(false);


    const handleFollowClick = async (event) => {
        event.stopPropagation(); // Prevent navigating to the category page

        // If user is still loading or not logged in, redirect to login
        if (userLoading || !user) {
            navigate('/login');
            return;
        }

        // Prevent multiple clicks while an action is in progress
        if (isFollowActionLoading) {
            return;
        }

        setIsFollowActionLoading(true); // Start local loading state

        const token = Cookies.get('token');
        if (!token) {
            console.error('No JWT token found.');
            navigate('/login');
            setIsFollowActionLoading(false); // Ensure loading state is reset
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            console.log('isFollowed', isFollowed);
            // Use the current `isFollowed` state to determine the action
            if (isFollowed) {
                // If currently followed, attempt to unfollow
                await axios.delete(`http://localhost:8080/api/v1/categories/${category.id}/follows`, config);
                // Update the context state immediately on success
                removeFollowedCategory(category.slug);
                toast.success(`Unfollowed ${category.name}`);
            } else {
                // If not currently followed, attempt to follow
                await axios.post(`http://localhost:8080/api/v1/categories/${category.id}/follows`, {}, config);
                // Update the context state immediately on success
                addFollowedCategory(category.slug);
                toast.success(`Followed ${category.name}`);
            }
        } catch (err) {
            console.error('Failed to follow/unfollow category.', err);
            const errorMessage = err.response?.data?.message || 'Failed to update follow status.';
            toast.error(errorMessage);
            // If the API call fails, the context state might be out of sync.
            // A refresh might be needed here, but for simplicity, we'll just rely on
            // the next time the context fetches data (e.g., page reload or other triggers).
            // If you need immediate consistency on error, you might call refreshFollowedCategories() here.
        } finally {
            setIsFollowActionLoading(false); // Reset local loading state
        }
    };

    const navigateToCategoryPage = () => {
        navigate(`/categories/${category.slug}`);
    };

    // Disable the button if user is loading, context is loading, or a follow/unfollow action is in progress
    const isButtonDisabled = userLoading || loadingFollowedCategories || isFollowActionLoading;


    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300`}
            onClick={navigateToCategoryPage}
        >
            <div className="flex p-4 space-x-4 items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {category.iconUrl ? (
                        <img
                            src={category.iconUrl || '/default-icon.png'}
                            alt="Category Icon"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-light flex items-center justify-center text-lg">
                            🏷️ {/* Using an emoji as a placeholder icon */}
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex-grow">
                        <h2 className="text-xl font-heading text-black hover:text-gray-darker transition-colors duration-300">{category.name}</h2>

                        <p className="text-gray-medium mt-1 line-clamp-2 h-12 overflow-hidden">
                            {category.description}
                        </p>

                        <p className="text-sm text-gray-medium mt-1">
                            {category.followersCount} {category.followersCount === 1 ? 'follower' : 'followers'}
                        </p>
                    </div>

                    {/* Only show the follow button if user loading is complete */}
                    {!userLoading && (
                        <div className={`mt-4 transition-all duration-300`}>
                            <button
                                onClick={handleFollowClick}
                                disabled={isButtonDisabled} // Use the derived disabled state
                                className={`font-medium px-6 py-1 rounded-full focus:outline-none transition-colors duration-300
                                ${
                                    isFollowed // Button style depends on context state
                                        ? 'bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black'
                                        : 'bg-accent-green hover:bg-green-700 text-white'
                                }
                                ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''} // Add disabled styles
                                `}
                            >
                                {/* Show spinner if the follow/unfollow action is loading */}
                                {isFollowActionLoading ? (
                                    <Oval height={16} width={16} color={isFollowed ? "#4A5568" : "#fff"} secondaryColor={isFollowed ? "#E2E8F0" : "#EAEAEA"} strokeWidth={5} />
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