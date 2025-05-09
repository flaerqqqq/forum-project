import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import { useFollowedCategories } from '../contexts/FollowedCategoriesContext';

const CategoryCard = ({ category, profilePublicId }) => {
    const { followedCategorySlugs, removeFollowedCategory } = useFollowedCategories();

    const [loading, setLoading] = useState(false);

    const isFollowed = Array.isArray(followedCategorySlugs) && followedCategorySlugs.includes(category?.slug);


    const handleUnfollow = async (e) => {
        e.stopPropagation();
        setLoading(true);

        try {
            const token = Cookies.get('token');
            if (!token) {
                toast.error('Please login to unfollow.');
                setLoading(false);
                return;
            }

            await axios.delete(
                `http://localhost:8080/api/v1/categories/${category.id}/follows`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            removeFollowedCategory(category.slug);
            toast.success(`Unfollowed ${category.name}`);
        } catch (err) {
            console.error('Failed to unfollow category', err);
            const errorMessage = err.response?.data?.body.detail || 'Failed to unfollow category';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isButtonDisabled = loading;


    return (
        <Link
            to={`/categories/${category.slug}`}
            className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow relative block no-underline text-black"
        >
            <h3 className="text-lg font-semibold mb-2">
                {category.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">Slug: {category.slug}</p>

            {isFollowed && (
                <button
                    onClick={handleUnfollow}
                    disabled={isButtonDisabled}
                    className={`absolute top-2 right-2 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200
                       ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {loading ? '...' : 'Unfollow'}
                </button>
            )}
        </Link>
    );
};

export default CategoryCard;