import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import defaultAvatar from '../assets/images/default-avatar.png';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';

const CategoryInfoSidebar = ({ category }) => {
    const [creator, setCreator] = useState(null);
    const [moderators, setModerators] = useState([]);
    const [loadingModerators, setLoadingModerators] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchCreator = async () => {
            if (category?.creatorId) {
                try {
                    const res = await axios.get(`http://localhost:8080/api/v1/users/${category.creatorId}`);
                    setCreator(res.data);
                } catch (error) {
                    console.error('Failed to fetch creator info:', error);
                    toast.error('Failed to load category creator.');
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
                    setModerators(moderatorsData.slice(1)); // Skipping first if needed
                } catch (error) {
                    console.error('Failed to fetch moderators:', error);
                    toast.error('Failed to load moderators.');
                } finally {
                    setLoadingModerators(false);
                    setInitialLoading(false);
                }
            } else {
                setInitialLoading(false);
            }
        };

        fetchModerators();
    }, [category?.id]);

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px] bg-white border border-gray-200 rounded-md p-6">
                <Oval height={50} width={50} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={4} visible={true} />
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex items-center justify-center min-h-[300px] bg-white border border-gray-200 rounded-md p-6">
                <Oval height={50} width={50} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={4} visible={true} />
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

            {/* Content */}
            <div className="p-4 flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-gray-800">About Category</h2>

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

                {/* Moderators */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800">Moderators</h3>

                    {loadingModerators ? (
                        <div className="flex justify-center py-4">
                            <Oval height={30} width={30} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={4} visible={true} />
                        </div>
                    ) : (
                        <ul className="space-y-4 mt-4">
                            {moderators.length > 0 ? (
                                moderators.map((moderator) => (
                                    <li key={moderator.id} className="flex items-center space-x-3 p-3 rounded-md border border-gray-200 hover:bg-gray-100">
                                        <img
                                            src={moderator.userDto?.avatarUrl || defaultAvatar}
                                            alt="Moderator Avatar"
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <a
                                                href={`/users/${moderator.userDto?.username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline font-semibold"
                                            >
                                                {moderator.userDto?.username}
                                            </a>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500 text-center">No moderators found.</li>
                            )}
                        </ul>
                    )}

                    {/* View All Moderators */}
                    <div className="mt-4 text-center">
                        <a
                            href={`/categories/${category.slug}/moderators`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            View all moderators
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryInfoSidebar;