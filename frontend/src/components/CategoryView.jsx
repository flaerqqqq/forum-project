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
    const { followedCategorySlugs, loadingFollowedCategories, addFollowedCategory, removeFollowedCategory } = useFollowedCategories();

    const isFollowed = followedCategorySlugs.includes(category?.slug);

    const [isFollowActionLoading, setIsFollowActionLoading] = useState(false);


    const handleFollowClick = async (event) => {
        event.stopPropagation();

        if (userLoading || !user) {
            navigate('/login');
            return;
        }

        if (isFollowActionLoading) {
            return;
        }

        setIsFollowActionLoading(true);

        const token = Cookies.get('token');
        if (!token) {
            console.error('No JWT token found.');
            navigate('/login');
            setIsFollowActionLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            console.log('isFollowed', isFollowed);
            if (isFollowed) {
                await axios.delete(`http://localhost:8080/api/v1/categories/${category.id}/follows`, config);
                removeFollowedCategory(category.slug);
                toast.success(`Unfollowed ${category.name}`);
            } else {
                await axios.post(`http://localhost:8080/api/v1/categories/${category.id}/follows`, {}, config);
                addFollowedCategory(category.slug);
                toast.success(`Followed ${category.name}`);
            }
        } catch (err) {
            console.error('Failed to follow/unfollow category.', err);
            const errorMessage = err.response?.data?.message || 'Failed to update follow status.';
            toast.error(errorMessage);
        } finally {
            setIsFollowActionLoading(false);
        }
    };

    const navigateToCategoryPage = () => {
        navigate(`/categories/${category.slug}`);
    };

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
                            🏷️
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

                    {!userLoading && (
                        <div className={`mt-4 transition-all duration-300`}>
                            <button
                                onClick={handleFollowClick}
                                disabled={isButtonDisabled}
                                className={`font-medium px-6 py-1 rounded-full focus:outline-none transition-colors duration-300
                                ${
                                    isFollowed 
                                        ? 'bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black'
                                        : 'bg-accent-green hover:bg-green-700 text-white'
                                }
                                ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''} // Add disabled styles
                                `}
                            >
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