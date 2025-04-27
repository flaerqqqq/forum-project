import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CategoryInfoSidebar = ({ category }) => {
    const [creator, setCreator] = useState(null);

    useEffect(() => {
        const fetchCreator = async () => {
            if (category?.creatorId) {
                try {
                    const res = await axios.get(`http://localhost:8080/api/v1/users/${category.creatorId}`);
                    setCreator(res.data);
                } catch (error) {
                    console.error('Failed to fetch creator info:', error);
                }
            }
        };

        fetchCreator();
    }, [category?.creatorId]);

    if (!category) {
        return (
            <div className="bg-white border border-gray-200 rounded-md p-4">
                <p>Loading category info...</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            {/* Banner */}
            {category.bannerUrl && (
                <img
                    src={category.bannerUrl}
                    alt="Category Banner"
                    className="w-full h-20 object-cover"
                />
            )}

            {/* Box content */}
            <div className="p-4 flex flex-col gap-3">
                {/* Title */}
                <h2 className="text-base font-semibold">About Category</h2>

                {/* Description */}
                <p className="text-sm text-gray-700">
                    {category.description || "No description provided."}
                </p>

                <hr className="my-2 border-gray-200" />

                {/* Followers */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Members</span>
                    <span className="font-semibold text-gray-900">{category.followersCount}</span>
                </div>

                {/* Created At */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created</span>
                    <span>{new Date(category.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}</span>
                </div>

                {/* Visibility */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Visibility</span>
                    <span className="capitalize">{category.visibility.toLowerCase()}</span>
                </div>

                {/* Post Permission */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Who can post</span>
                    <span className="capitalize">{category.postPermission.toLowerCase()}</span>
                </div>

                {/* Creator */}
                {creator && (
                    <div className="text-sm text-gray-500">
                        Created by{" "}
                        <Link
                            to={`/users/${creator.username}`}
                            className="text-blue-600 hover:underline"
                        >
                            {creator.displayName || creator.username}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryInfoSidebar;