import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import CategoryCard from './CategoryCard';
import { Link } from 'react-router-dom';
import { useFollowedCategories } from '../contexts/FollowedCategoriesContext';
import { useUser } from '../contexts/UserContext';

const PAGE_SIZE = 10;
const MIN_LOADING_TIME = 300;

const UserCategories = ({ userPublicId }) => {
    const { user, loading: userLoading } = useUser();
    const { followedCategorySlugs, loadingFollowedCategories, removeFollowedCategory } = useFollowedCategories();

    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isViewingFollowing, setIsViewingFollowing] = useState(false);
    // New state for Moderated tab view
    const [isViewingModerated, setIsViewingModerated] = useState(false);


    const token = Cookies.get('token');
    const observer = useRef();

    const getAvatarColorClass = (identifier) => {
        if (!identifier) return 'bg-gray-medium';
        const firstLetter = identifier.charAt(0).toUpperCase();
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
        const firstWord = name.split(' ')[0];
        return firstWord.charAt(0).toUpperCase();
    };

    const lastCategoryRef = useCallback(node => {
        // Only observe if not loading (any type), and there is more data, and not searching
        if (loading || initialLoading || isSearching || !hasMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, initialLoading, hasMore, isSearching]);


    // Function to fetch categories based on the active view (Created, Following, Moderated)
    const fetchCategories = useCallback(async () => {
        if (!userPublicId) {
            setInitialLoading(false);
            setLoading(false);
            setHasMore(false);
            setCategories([]); // Clear categories if no userPublicId
            return;
        }

        // Prevent fetching if already searching
        if (isSearching) {
            setInitialLoading(false);
            setLoading(false);
            return;
        }


        if (page === 0) {
            setInitialLoading(true);
            setCategories([]);
            setHasMore(true);
        } else {
            setLoading(true);
        }

        const startTime = Date.now();

        let fetchedCategories = [];
        let isLast = false;

        try {
            if (isViewingFollowing) {
                // --- Fetching Followed Categories using Context ---
                // Get the list of followed slugs from the context (accessed directly)
                const slugsToFetch = followedCategorySlugs;

                // Implement client-side pagination based on the slugs from context
                const startIndex = page * PAGE_SIZE;
                const endIndex = startIndex + PAGE_SIZE;
                const slugsForPage = slugsToFetch.slice(startIndex, endIndex);

                // Fetch full details for the slugs on the current page
                // Use Promise.all for concurrent fetching
                const categoryDetailsPromises = slugsForPage.map(slug =>
                    axios.get(`http://localhost:8080/api/v1/categories/slug/${slug}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }).then(res => res.data).catch(() => null) // Fetch by slug, handle errors per fetch
                );
                const detailedCategories = await Promise.all(categoryDetailsPromises);
                fetchedCategories = detailedCategories.filter(cat => cat !== null); // Filter out failed fetches

                // Determine if there are more pages based on the total count from context
                isLast = endIndex >= followedCategorySlugs.length;


            } else if (isViewingModerated) {
                // --- Fetching Moderated Categories ---
                const url = `http://localhost:8080/api/v1/users/me/moderated-categories`; // Endpoint for moderated categories

                const res = await axios.get(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    params: { page, size: PAGE_SIZE }, // Assuming backend supports pagination
                });

                fetchedCategories = res.data.content || [];
                isLast = res.data.last;

            } else {
                // --- Fetching Created Categories (Default) ---
                const url = `http://localhost:8080/api/v1/users/me/categories`; // Endpoint for created categories

                const res = await axios.get(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    params: { page, size: PAGE_SIZE },
                });

                fetchedCategories = res.data.content || [];
                isLast = res.data.last;
            }

        } catch (err) {
            // Handle errors during fetching
            console.error('Failed to load categories:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to load categories.';
            // Avoid showing toast for 404/500 which might be expected for empty lists or specific states
            // Also avoid toast for 403 on moderated/following if user is not logged in, handled by view logic
            if (err.response?.status !== 404 && err.response?.status !== 500 && !(err.response?.status === 403 && (isViewingFollowing || isViewingModerated))) {
                toast.error(errorMessage);
            }
            fetchedCategories = []; // Clear categories on error
            isLast = true; // Assume no more data on error
        } finally {
            // Ensure minimum loading time
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                // Update categories state, appending for pagination
                setCategories(prev =>
                    page === 0 ? fetchedCategories : [...prev, ...fetchedCategories]
                );
                // Update hasMore state
                setHasMore(!isLast);
                // Set loading states to false
                setInitialLoading(false);
                setLoading(false);
            }, remainingTime);
        }
    }, [page, token, userPublicId, isViewingFollowing, isViewingModerated, isSearching, followedCategorySlugs]);


    // Search functionality (adjusted to potentially handle different views or be disabled)
    const searchCategories = useCallback(async (query) => {
        // Disable search if not in Created view for now, as backend endpoint might not support filtering by moderator/follower status
        if (!query.trim()) {
            setIsSearching(false);
            setSearchQuery('');
            setPage(0);
            return;
        }

        // Only allow search in Created view for now
        if (isViewingFollowing || isViewingModerated) {
            toast.info("Search is currently only available for Created categories.");
            setSearchQuery(''); // Clear search input if not in created view
            setIsSearching(false); // Ensure searching is off
            return;
        }


        setIsSearching(true);
        setInitialLoading(true);

        try {
            // Assuming the search endpoint supports filtering by creatorPublicId
            const res = await axios.get(`http://localhost:8080/api/v1/categories/search`, {
                params: {
                    query,
                    creatorPublicId: userPublicId, // Pass creatorPublicId for created categories search
                },
                headers: token ? { Authorization: `Bearer ${token}` } : {}, // Include token for authenticated search
            });

            setCategories(res.data || []);
            setHasMore(false); // Search results are typically not paginated by scrolling in this way
        } catch (err) {
            console.error('Failed to search categories:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to search categories.';
            if (err.response?.status !== 404 && err.response?.status !== 500) {
                toast.error(errorMessage);
            }
            setCategories([]);
            setHasMore(false);
        } finally {
            setInitialLoading(false);
        }
    }, [userPublicId, isViewingFollowing, isViewingModerated, token]); // Added dependencies


    // Effect to trigger fetching when page, fetchCategories function, or view mode changes
    useEffect(() => {
        // Only fetch if not currently searching
        if (!isSearching) {
            fetchCategories();
        }
    }, [fetchCategories, isSearching]); // Dependencies

    // Effect for search functionality (retained from original, adjusted dependencies)
    useEffect(() => {
        if (searchQuery.trim()) {
            // Debounce search input
            const delayDebounceFn = setTimeout(() => {
                searchCategories(searchQuery);
            }, 300);
            return () => clearTimeout(delayDebounceFn); // Cleanup timeout
        } else if (isSearching) {
            // If search query is cleared while in search mode, exit search mode and refetch based on current view
            setIsSearching(false);
            setPage(0); // Reset page
            setCategories([]); // Clear categories
            setHasMore(true); // Assume more data
            // fetchCategories will be triggered by the isSearching dependency change
        }
    }, [searchQuery, searchCategories, isSearching]); // Dependencies

    // Handle search input change (retained from original)
    const handleSearchChange = (e) => {
        setPage(0); // Reset pagination on search
        setSearchQuery(e.target.value); // Update search query state
    };

    // Toggle between Created, Following, and Moderated views
    const toggleCategoryView = (view) => {
        if (view === 'created' && (isViewingFollowing || isViewingModerated)) {
            setIsViewingFollowing(false);
            setIsViewingModerated(false);
        } else if (view === 'following' && (!isViewingFollowing || isViewingModerated)) {
            setIsViewingFollowing(true);
            setIsViewingModerated(false);
        } else if (view === 'moderated' && (!isViewingModerated || isViewingFollowing)) {
            setIsViewingModerated(true);
            setIsViewingFollowing(false);
        } else {
            return; // Do nothing if already in the selected view
        }

        // Reset states when switching views
        setSearchQuery(''); // Clear search query
        setPage(0); // Reset pagination
        setCategories([]); // Clear categories
        setHasMore(true); // Assume more data in the new view
        setIsSearching(false); // Ensure not in search mode
    };


    // Handle unfollow action using context function (only relevant for Following tab)
    const handleUnfollow = async (categoryId, categorySlug, categoryName) => {
        const token = Cookies.get('token');
        if (!token) {
            toast.error('Please login to unfollow.');
            return;
        }
        try {
            // Call the API to unfollow
            await axios.delete(
                `http://localhost:8080/api/v1/categories/${categoryId}/follows`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success(`${categoryName} unfollowed.`);
            removeFollowedCategory(categorySlug);
            // Remove the category from the current list if in Following view
            if (isViewingFollowing) {
                setCategories(prev => prev.filter(cat => cat.id !== categoryId));
                // Note: Removing an item might affect pagination count for client-side paginated lists (Following).
                // A full refetch of the current page might be needed for perfect accuracy,
                // but filtering from the current list is simpler for now.
            }
        } catch (err) {
            console.error('Failed to unfollow category', err);
            const errorMessage = err.response?.data?.message || 'Failed to unfollow category';
            toast.error(errorMessage);
        }
    };

    // Determine overall loading state including context loading
    const overallLoading = initialLoading || loading || userLoading || loadingFollowedCategories;

    // Determine the message to show when no categories are found
    const noCategoriesMessage = isSearching
        ? `No categories found matching "${searchQuery}".`
        : isViewingFollowing
            ? 'Not following any categories yet.'
            : isViewingModerated
                ? 'Not moderating any categories yet.'
                : 'No categories created yet.'; // Default message for Created view


    return (
        <div className="mt-6 rounded-md text-black font-sans">
            <div className="mb-6">
                <div className="flex items-center justify-center bg-gray-light rounded-full p-1 w-fit mx-auto">
                    {/* Button to switch to Created view */}
                    <button
                        onClick={() => toggleCategoryView('created')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${!isViewingFollowing && !isViewingModerated ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        disabled={overallLoading} // Disable buttons while loading
                    >Created</button>
                    {/* Button to switch to Following view */}
                    <button
                        onClick={() => toggleCategoryView('following')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${isViewingFollowing ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        disabled={overallLoading} // Disable buttons while loading
                    >Following</button>
                    {/* Button to switch to Moderated view */}
                    <button
                        onClick={() => toggleCategoryView('moderated')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${isViewingModerated ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        disabled={overallLoading} // Disable buttons while loading
                    >Moderated</button>
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="categorySearch" className="block text-xs font-normal text-gray-medium mb-1 uppercase tracking-wide">Search Categories</label>
                <input
                    id="categorySearch"
                    type="text"
                    placeholder="Enter category name or slug"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="block w-[186px] bg-transparent border-0 border-b border-border focus:outline-none focus:border-black py-2 text-sm text-gray-darker placeholder-gray-medium"
                    disabled={overallLoading || isViewingFollowing || isViewingModerated} // Disable search in Following/Moderated for now
                />
            </div>

            {/* Loading indicator for initial load or search */}
            {overallLoading && categories.length === 0 ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                </div>
            ) : categories.length === 0 ? (
                // Message when no categories are found based on the active view/search
                <p className="text-gray-medium text-center py-10 text-base">
                    {noCategoriesMessage}
                </p>
            ) : (
                // List of categories
                <ul className="space-y-8">
                    {categories.map((category, idx) => (
                        <li key={category.id}
                            // Attach ref for infinite scrolling only if not searching and it's the last item
                            ref={!isSearching && idx === categories.length - 1 ? lastCategoryRef : null}
                            className="flex items-center justify-between pb-4 border-b border-border last:border-b-0 hover:bg-gray-lighter transition duration-200 rounded-md p-3">
                            <div className="flex items-center gap-3 flex-grow pr-4">
                                {/* Link to category page */}
                                <Link to={`/categories/${category.slug}`} className="flex-shrink-0">
                                    {/* Category icon or initial placeholder */}
                                    {category?.iconUrl ? (
                                        <img src={category.iconUrl} alt={`${category.name} icon`} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className={`${getAvatarColorClass(category?.slug || category.name)} w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold`}>
                                            {getInitials(category?.slug || category.name)}
                                        </div>
                                    )}
                                </Link>
                                <div>
                                    {/* Category name link */}
                                    <Link to={`/categories/${category.slug}`} className="text-base font-semibold text-black hover:underline">
                                        {category.name}
                                    </Link>
                                    {/* Followers count */}
                                    <p className="text-sm text-gray-darker">
                                        {category.followersCount} {category.followersCount === 1 ? 'follower' : 'followers'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Creation date */}
                                <p className="text-xs text-gray-medium whitespace-nowrap">
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </p>
                                {/* Unfollow button (only shown in Following view) */}
                                {isViewingFollowing && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUnfollow(category.id, category.slug, category.name); }} // Pass slug and name to handleUnfollow
                                        className="font-medium px-6 py-1 rounded-full focus:outline-none transition-colors duration-300 bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black"
                                        disabled={overallLoading} // Disable button while loading
                                    >Unfollow</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {loading && page > 0 && !isSearching && (
                <div className="flex justify-center py-6">
                    <Oval height={28} width={28} color="#6B7280" secondaryColor="#E5E7EB" strokeWidth={3} visible />
                </div>
            )}

        </div>
    );
};

export default UserCategories;