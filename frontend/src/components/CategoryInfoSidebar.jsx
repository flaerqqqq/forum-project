import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useUser } from "../contexts/UserContext.jsx";

const popularCategoriesCache = {};
const CACHE_KEY = 'popular_categories';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const CategoryInfoSidebar = ({ category }) => {
    const { user: currentUser } = useUser();
    const [creator, setCreator] = useState(null);
    const [moderators, setModerators] = useState([]);
    const [loadingModerators, setLoadingModerators] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!sidebarRef.current) return;

            const sidebar = sidebarRef.current;
            const sidebarRect = sidebar.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Check if the sidebar top is above or near the fixed header (assuming header height is around 80px)
            if (sidebarRect.top <= 80) {
                // If sidebar content is taller than the available space below the header
                if (sidebar.scrollHeight > viewportHeight - 80) {
                    sidebar.style.height = `${viewportHeight - 80}px`;
                    sidebar.style.overflowY = 'auto';
                    sidebar.classList.add('scrollbar-thin-light'); // Add scrollbar class
                } else {
                    // If content fits, remove fixed height and scrolling
                    sidebar.style.height = '';
                    sidebar.style.overflowY = '';
                    sidebar.classList.remove('scrollbar-thin-light'); // Remove scrollbar class
                }
            } else {
                // If sidebar top is below the fixed header, remove fixed height and scrolling
                sidebar.style.height = '';
                sidebar.style.overflowY = '';
                sidebar.classList.remove('scrollbar-thin-light'); // Remove scrollbar class
            }
        };

        // Add scroll listener and call initially
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Call on mount to set initial state

        // Clean up listener on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [category, moderators]); // Re-run if category or moderators change (content height might change)


    const getAvatarColorClass = (username) => {
        if (!username) return 'bg-gray-medium';
        const firstLetter = username.charAt(0).toUpperCase();
        const asciiCode = firstLetter.charCodeAt(0);
        const colorIndex = asciiCode % 10;
        const avatarColors = [
            'bg-accent-green', 'bg-gray-darker', 'bg-indigo-600', 'bg-blue-600', 'bg-purple-600',
            'bg-pink-600', 'bg-teal-600', 'bg-orange-600', 'bg-red-600', 'bg-gray-medium',
        ];
        return avatarColors[colorIndex];
    };

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.split(' ');
        return parts.length === 1
            ? parts[0].charAt(0).toUpperCase()
            : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

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
            <div className="flex items-center justify-center min-h-[300px] bg-white border border-border rounded-md shadow-sm p-6">
                <Oval height={50} width={50} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible={true} />
            </div>
        );
    }

    if (!category && !initialLoading) {
        return (
            <div className="p-6 bg-white border border-border rounded-md shadow-sm text-center text-red-600">
                Error loading category information.
            </div>
        );
    }

    return (
        <div className="sticky top-16" style={{ marginBottom: '16px' }}>
            <div
                ref={sidebarRef}
                className="bg-gray-50 border border-border rounded-xl overflow-hidden"
            >
                {category.bannerUrl && (
                    <img
                        src={category.bannerUrl}
                        alt={`${category.name} Banner`}
                        className="w-full h-24 object-cover"
                    />
                )}

                <div className="p-6 flex flex-col gap-4">
                    <div>
                        {/* Updated className for "About Category" header */}
                        <h2 className="text-sm font-sans font-bold uppercase text-black mb-2">About Category</h2>
                        <p className="text-sm text-gray-darker">{category.description || "No description provided."}</p>
                    </div>

                    <hr className="my-2 border-border" />

                    <div className="flex items-center justify-between text-sm text-gray-darker">
                        <span>Members</span>
                        <span className="font-semibold text-black">{category.followersCount}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-darker">
                        <span>Created</span>
                        <span className="font-semibold text-black">
                            {new Date(category.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-darker">
                        <span>Visibility</span>
                        <span className="capitalize font-semibold text-black">{category.visibility.toLowerCase().replace('_', ' ')}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-darker">
                        <span>Who can post</span>
                        <span className="capitalize font-semibold text-black">{category.postPermission.toLowerCase().replace('_', ' ')}</span>
                    </div>

                    {creator && (
                        <div className="text-sm text-gray-darker">
                            Created by{" "}
                            <Link
                                to={`/users/${creator.username}`}
                                className="text-accent-green hover:underline"
                            >
                                {creator.displayName || creator.username}
                            </Link>
                        </div>
                    )}

                    <hr className="mt-2 border-border" />

                    <div>
                        {/* Updated className for "Moderators" header */}
                        <h3 className="text-sm font-sans font-bold uppercase text-black mb-2">Moderators</h3>

                        {loadingModerators ? (
                            <div className="flex justify-center py-4">
                                <Oval height={30} width={30} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible={true} />
                            </div>
                        ) : (
                            <ul className="space-y-2 mt-4">
                                {moderators.length > 0 ? (
                                    moderators.map((moderator) => (
                                        <li key={moderator.id}>
                                            <Link
                                                to={`/users/${moderator.userDto?.username}`}
                                                className="flex items-center space-x-2 py-0.5 rounded-md hover:bg-gray-lighter transition-colors"
                                            >
                                                {moderator.userDto?.avatarUrl ? (
                                                    <img
                                                        src={moderator.userDto.avatarUrl}
                                                        alt={`${moderator.userDto?.username}'s Avatar`}
                                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full ${getAvatarColorClass(moderator.userDto?.username)} flex items-center justify-center text-sm text-white font-semibold flex-shrink-0`}>
                                                        {getInitials(moderator.userDto?.displayName || moderator.userDto?.username)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-black text-sm">
                                                        {moderator.userDto?.displayName}
                                                    </div>
                                                    <div className="text-gray-medium text-[13px]">@{moderator.userDto?.username}</div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-medium text-center">No additional moderators found.</li>
                                )}
                            </ul>
                        )}

                        {category?.slug && (
                            <div className="mt-4 text-center space-y-2">
                                <Link
                                    to={`/categories/${category.slug}/moderators`}
                                    className="inline-block px-4 py-2 text-sm text-white bg-accent-green rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
                                >
                                    View all moderators
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-4"></div>
            </div>
        </div>
    );
};

export default CategoryInfoSidebar;