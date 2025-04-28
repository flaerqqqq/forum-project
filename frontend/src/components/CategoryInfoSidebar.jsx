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
                        `http://localhost:8080/api/v1/categories/${category.id}/moderators?page=0&size=20&sort=assignedAt,desc`
                    );
                    const moderatorsData = res.data.content;

                    const nonOwnerModerators = moderatorsData.filter(mod => mod.role !== 'OWNER');

                    setModerators(nonOwnerModerators);

                } catch (error) {
                    console.error('Failed to fetch moderators:', error);
                    toast.error('Failed to load moderators.');
                    setModerators([]);
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

    if (initialLoading && !category) {
        return (
            <div className="flex items-center justify-center min-h-[300px] bg-white border border-gray-200 rounded-md p-6">
                <Oval height={50} width={50} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={4} visible={true} />
            </div>
        );
    }

    if (!category && !initialLoading) {
        return <div>Error loading category information.</div>;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-md">
            {category.bannerUrl && (
                <img
                    src={category.bannerUrl}
                    alt={`${category.name} Banner`}
                    className="w-full h-20 object-cover"
                />
            )}

            <div className="p-4 flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-gray-800">About Category</h2>

                <p className="text-sm text-gray-700">{category.description || "No description provided."}</p>

                <hr className="my-2 border-gray-200" />

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Members</span>
                    <span className="font-semibold text-gray-900">{category.followersCount}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created</span>
                    <span>{new Date(category.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Visibility</span>
                    <span className="capitalize">{category.visibility.toLowerCase().replace('_', ' ')}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Who can post</span>
                    <span className="capitalize">{category.postPermission.toLowerCase().replace('_', ' ')}</span>
                </div>

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
                                            alt={`${moderator.userDto?.username}'s Avatar`}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            {/* Changed Link to a tag with target="_blank" */}
                                            <a
                                                href={`/users/${moderator.userDto?.username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline font-semibold"
                                            >
                                                {moderator.userDto?.displayName} ({moderator.userDto?.username})
                                            </a>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500 text-center">No additional moderators found.</li>
                            )}
                        </ul>
                    )}

                    {category?.slug && (
                        <div className="mt-4 text-center">
                            <Link
                                to={`/categories/${category.slug}/moderators`}
                                className="inline-block px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                View all moderators
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryInfoSidebar;