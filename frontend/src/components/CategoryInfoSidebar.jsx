import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import defaultAvatar from '../assets/images/default-avatar.png';
import axios from 'axios';

const CategoryInfoSidebar = ({ category }) => {
    const [creator, setCreator] = useState(null);
    const [moderators, setModerators] = useState([]);
    const [loadingModerators, setLoadingModerators] = useState(true);

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

    useEffect(() => {
        const fetchModerators = async () => {
            if (category?.id) {
                setLoadingModerators(true);
                try {
                    const res = await axios.get(
                        `http://localhost:8080/api/v1/categories/${category.id}/moderators?page=0&size=11&sort=assignedAt,desc`
                    );
                    const moderatorsData = res.data.content;

                    const moderatorsWithDetails = await Promise.all(
                        moderatorsData.map(async (moderator) => {
                            try {
                                const userRes = await axios.get(`http://localhost:8080/api/v1/users/${moderator.userId}`);
                                return { ...moderator, user: userRes.data };
                            } catch (error) {
                                console.error('Failed to fetch moderator user info:', error);
                                return moderator;
                            }
                        })
                    );

                    setModerators(moderatorsWithDetails.slice(1));
                } catch (error) {
                    console.error('Failed to fetch moderators:', error);
                } finally {
                    setLoadingModerators(false);
                }
            }
        };

        fetchModerators();
    }, [category?.id]);

    if (!category) {
        return (
            <div className="bg-white border border-gray-200 rounded-md p-4">
                <p>Loading category info...</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-md">
            {/* Banner */}
            {category.bannerUrl && (
                <img
                    src={category.bannerUrl}
                    alt="Category Banner"
                    className="w-full h-20 object-cover"
                />
            )}

            {/* Box content */}
            <div className="p-4 flex flex-col gap-4">
                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-800">About Category</h2>

                {/* Description */}
                <p className="text-sm text-gray-700">{category.description || "No description provided."}</p>

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

                {/* Moderators List */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800">Moderators</h3>
                    <ul className="space-y-4 mt-4">
                        {loadingModerators ? (
                            <li className="text-gray-500">Loading moderators...</li>
                        ) : (
                            moderators.map((moderator) => (
                                <li key={moderator.id} className="flex items-center space-x-3 p-3 rounded-md border border-gray-200 hover:bg-gray-100">
                                    {/* Moderator Avatar */}
                                    <img
                                        src={moderator.user?.avatarUrl || defaultAvatar}
                                        alt="Moderator Avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />

                                    {/* Moderator Username with link opening in new tab */}
                                    <div>
                                        <span className="font-semibold">
                                            <a
                                                href={`/users/${moderator.user?.username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {moderator.user?.username}
                                            </a>
                                        </span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>

                    {/* View all moderators link */}
                    <div className="mt-4 text-center">
                        <Link
                            to={`/categories/${category.slug}/moderators`}
                            className="inline-block px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            View all moderators
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryInfoSidebar;