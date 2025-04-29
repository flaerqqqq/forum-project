import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const CategoryCard = ({ category, isFollowed, onUnfollow }) => {
    const [loading, setLoading] = useState(false);

    const handleUnfollow = async (e) => {
        e.stopPropagation();
        setLoading(true);

        try {
            const token = Cookies.get('token');
            if (!token) {
                toast.error('Please login to unfollow.');
                return;
            }

            await axios.delete(
                `http://localhost:8080/api/v1/categories/${category.id}/follows`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success(`Unfollowed ${category.name}`);
            onUnfollow(category.id); // Trigger parent to remove category from list
        } catch (err) {
            console.error('Failed to unfollow category', err);
            toast.error('Failed to unfollow category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow relative">
            <h3 className="text-lg font-semibold mb-2">
                <a
                    href={`/categories/${category.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    {category.name}
                </a>
            </h3>
            <p className="text-sm text-gray-600 mb-2">Slug: {category.slug}</p>

            {isFollowed && (
                <button
                    onClick={handleUnfollow}
                    disabled={loading}
                    className="absolute top-2 right-2 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                    {loading ? '...' : 'Unfollow'}
                </button>
            )}
        </div>
    );
};

export default CategoryCard;