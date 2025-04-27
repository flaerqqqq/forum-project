import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isAuthenticated } from "../utils/Auth.js";

const CategoryView = ({ category }) => {
    const [isFollowing, setIsFollowing] = useState(category.isFollowing || false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFollow = async (event) => {
        event.stopPropagation(); // Prevent the click from triggering the navigation
        setLoading(true);
        const token = Cookies.get('token');
        try {
            let response;

            // Call the appropriate API based on the current state
            if (isFollowing) {
                // Unfollow the category
                response = await axios.delete(
                    `http://localhost:8080/api/v1/categories/${category.id}/follows`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setIsFollowing(false);
                toast.success('You unfollowed this category');
            } else {
                // Follow the category
                response = await axios.post(
                    `http://localhost:8080/api/v1/categories/${category.id}/follows`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setIsFollowing(true);
                toast.success('You are now following this category');
            }
        } catch (error) {
            toast.error('Failed to update follow status');
        } finally {
            setLoading(false);
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

                    {/* Conditional space for follow button */}
                    {isAuthenticated() && (
                        <div className={`mt-4 transition-all duration-300 ${isFollowing ? 'h-12' : 'h-16'}`}>
                            <button
                                onClick={handleFollow}
                                disabled={loading}
                                className={`${
                                    isFollowing ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
                                } text-white font-medium px-6 py-2 rounded-full focus:outline-none transition-colors duration-300`}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryView;