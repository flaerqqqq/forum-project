import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const POSTS_PER_PAGE = 10;

const CategoryPosts = ({ categorySlug, saveCategoryPostsCache, getCategoryPostsCache, clearCategoryPostsCache }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState('createdAt,desc');
    const [loadedPostCount, setLoadedPostCount] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();

    const postsContainerRef = useRef(null);

    // Use a ref to track if the initial mount logic has run
    const initialMountHandled = useRef(false);
    // Ref to track if we are currently restoring scroll position from cache
    const isRestoringScroll = useRef(false);
    // New ref to track if we're rendering cached posts
    const isRestoringFromCache = useRef(false);

    const fetchPosts = useCallback(async (pageNumber = 0, size = POSTS_PER_PAGE, currentSortBy = sortBy, append = true) => {
        // Skip fetching if we're restoring from cache - prevents double loading
        if (isRestoringFromCache.current) {
            console.log('Skipping fetch during cache restoration');
            return [];
        }

        // Only set loading true if we're not restoring from cache or scroll
        if (!isRestoringFromCache.current && !isRestoringScroll.current) {
            setLoading(true);
        }
        setError(null);

        console.log(`Fetching posts from API, page: ${pageNumber}, size: ${size}, append: ${append}`);
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/posts`, {
                params: {
                    categorySlug,
                    page: pageNumber,
                    size: size,
                    sort: currentSortBy
                }
            });

            if (res.status === 204 || res.data.content.length === 0) {
                if (pageNumber === 0 && !append) {
                    setPosts([]);
                    setLoadedPostCount(0);
                }
                setHasMore(false);
                return res.data.content;
            } else {
                if (append) {
                    // Filter duplicates before appending to state
                    setPosts(prev => {
                        const existingPostIds = new Set(prev.map(p => p.id));
                        const uniqueNewPosts = res.data.content.filter(p => !existingPostIds.has(p.id));
                        return [...prev, ...uniqueNewPosts];
                    });
                    setLoadedPostCount(prevCount => prevCount + res.data.content.length);
                } else {
                    const existingPostIds = new Set(posts.map(p => p.id));
                    const uniqueNewPosts = res.data.content.filter(p => !existingPostIds.has(p.id));
                    setPosts(uniqueNewPosts);
                    setLoadedPostCount(uniqueNewPosts.length);
                }
                setHasMore(!res.data.last);
                return res.data.content;
            }

        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts.');
            toast.error('Failed to load posts.');
            setHasMore(false);
            return [];
        } finally {
            // Only update loading state if not restoring from cache
            if (!isRestoringFromCache.current && !isRestoringScroll.current) {
                setLoading(false);
            }
        }
    }, [categorySlug, sortBy, posts]);

    // Effect for initial mount and cache restoration
    useEffect(() => {
        // Only run this effect once on initial mount
        if (!initialMountHandled.current) {
            initialMountHandled.current = true;
            console.log('CategoryPosts initial mount effect triggered.', { categorySlug, sortBy });

            const cachedData = getCategoryPostsCache(categorySlug, sortBy);

            if (cachedData && cachedData.posts && cachedData.posts.length > 0) {
                console.log('Cache hit! Restoring from cache. Posts count:', cachedData.posts.length);

                // Set flag that we're restoring from cache - this will prevent loading indicators
                // and prevent the category/sort change effect from running
                isRestoringFromCache.current = true;

                // Restore state from cache - all posts at once
                setPosts(cachedData.posts);
                setLoadedPostCount(cachedData.loadedCount);

                // Set page to reflect the actual number of pages that would have been loaded
                // This is important for future loadMore calls
                const restoredPages = Math.ceil(cachedData.posts.length / POSTS_PER_PAGE) - 1;
                setPage(Math.max(restoredPages, 0));

                setHasMore(cachedData.hasMore);
                setLoading(false);

                // Restore scroll position after a short delay
                if (cachedData.scrollY !== undefined) {
                    isRestoringScroll.current = true;

                    // Need to wait for the DOM to update with all the cached posts
                    setTimeout(() => {
                        window.scrollTo(0, cachedData.scrollY);
                        console.log('Scrolled to cached Y:', cachedData.scrollY);

                        // Reset scroll restoration flag but keep cache restoration flag a bit longer
                        // to prevent the category/sort change effect from triggering
                        isRestoringScroll.current = false;
                        console.log('Finished restoring scroll.');

                        // Check if more content needs to be loaded
                        if (cachedData.hasMore) {
                            const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
                            const viewportHeight = window.innerHeight;

                            if (containerHeight <= viewportHeight ||
                                (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500)) {
                                console.log('Need more content after restoration, loading more.');
                                loadMore();
                            }
                        }

                        // Finally, after all DOM operations are complete, reset the cache restoration flag
                        setTimeout(() => {
                            console.log('Cache restoration process complete.');
                            isRestoringFromCache.current = false;
                        }, 500);
                    }, 100);
                } else {
                    // If no scrollY was cached
                    setTimeout(() => {
                        if (cachedData.hasMore) {
                            const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
                            const viewportHeight = window.innerHeight;

                            if (containerHeight <= viewportHeight) {
                                console.log('No scrollY cached, content doesn\'t fill viewport, loading more.');
                                loadMore();
                            }
                        }

                        // Reset cache restoration flag after a delay
                        setTimeout(() => {
                            console.log('Cache restoration process complete.');
                            isRestoringFromCache.current = false;
                        }, 500);
                    }, 100);
                }

                // Clear the cache after successful restoration
                clearCategoryPostsCache(categorySlug, sortBy);
                console.log('Cache cleared for', categorySlug, sortBy);
            } else {
                console.log('No cache found, fetching first page normally.');
                setPage(0);
                setPosts([]);
                setHasMore(true);
                setLoadedPostCount(0);
                fetchPosts(0, POSTS_PER_PAGE, sortBy, false);
            }
        }
    }, [categorySlug, sortBy, fetchPosts, getCategoryPostsCache, clearCategoryPostsCache]);

    // Effect to handle categorySlug or sortBy changes (after initial mount)
    // Track the previous values to determine if this is a real change
    const prevCategoryRef = useRef(categorySlug);
    const prevSortRef = useRef(sortBy);

    useEffect(() => {
        // Only run this effect after initial mount and when the values actually change
        // This prevents the effect from running during cache restoration
        if (initialMountHandled.current &&
            (prevCategoryRef.current !== categorySlug || prevSortRef.current !== sortBy) &&
            !isRestoringFromCache.current) {

            console.log('Category/sort actually changed, resetting and fetching new data.');
            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);
            fetchPosts(0, POSTS_PER_PAGE, sortBy, false);
        }

        // Update the refs with current values for next comparison
        prevCategoryRef.current = categorySlug;
        prevSortRef.current = sortBy;
    }, [categorySlug, sortBy]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        if (!loading && hasMore && !isRestoringScroll.current && !isRestoringFromCache.current) {
            console.log('Loading more posts, page:', nextPage);
            fetchPosts(nextPage, POSTS_PER_PAGE, sortBy, true);
            setPage(nextPage);
        }
    }, [loading, hasMore, page, sortBy, fetchPosts]);

    const handleScroll = useCallback(() => {
        // Don't trigger scroll events during restoration
        if (isRestoringScroll.current || isRestoringFromCache.current) {
            return;
        }

        const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
        const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
        const viewportHeight = window.innerHeight;
        const isContentScrollable = containerHeight > viewportHeight;

        if (isAtBottom && hasMore && !loading && isContentScrollable) {
            loadMore();
        }
    }, [hasMore, loading, loadMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    // Function to save state to cache - called by PostCard on link click
    const saveCurrentStateToCache = useCallback(() => {
        console.log('Saving current state to cache, posts count:', posts.length);

        if (categorySlug && posts.length > 0) {
            saveCategoryPostsCache(
                categorySlug,
                sortBy,
                posts,
                posts.length, // Use actual post count
                window.scrollY,
                page,
                hasMore
            );
            console.log('State saved to cache for', categorySlug, sortBy);
        } else {
            console.log('Not saving to cache: no category or posts');
        }
    }, [categorySlug, sortBy, posts, page, hasMore, saveCategoryPostsCache]);

    const handleSortChange = (newSortBy) => {
        if (newSortBy !== sortBy) {
            setSortBy(newSortBy);
            clearCategoryPostsCache(categorySlug, newSortBy);
        }
    };

    const showInitialLoading = loading && posts.length === 0 && !error;
    const showLoadingMore = loading && posts.length > 0 && hasMore;

    return (
        <div className="space-y-1" ref={postsContainerRef}>
            <div className="flex justify-end items-center mb-4 space-x-4">
                <span className="text-sm text-gray-600">Sort By:</span>
                <button
                    className={`text-sm ${sortBy === 'createdAt,desc' ? 'font-bold text-black underline' : 'text-gray-600 hover:underline'}`}
                    onClick={() => handleSortChange('createdAt,desc')}
                >
                    Newest
                </button>
                <button
                    className={`text-sm ${sortBy === 'createdAt,asc' ? 'font-bold text-black underline' : 'text-gray-600 hover:underline'}`}
                    onClick={() => handleSortChange('createdAt,asc')}
                >
                    Oldest
                </button>
            </div>

            {(posts.length > 0 || showLoadingMore) && <hr className="border-gray-300 my-2" />}

            {showInitialLoading && (
                <div className="w-full flex items-center justify-center py-8">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} />
                </div>
            )}

            {!loading && error && (
                <div className="p-6 bg-white rounded-md border border-red-300 text-center text-red-600">
                    {error}
                </div>
            )}

            {!loading && posts.length === 0 && !error && (
                <div className="p-6 bg-white rounded-md border border-border text-center text-gray-medium">
                    No posts found.
                </div>
            )}

            {posts.map((post, index) => (
                <React.Fragment key={post.id}>
                    <PostCard
                        post={post}
                        saveCurrentStateToCache={saveCurrentStateToCache}
                    />
                    {index < posts.length - 1 && (
                        <hr className="border-gray-300 my-2" />
                    )}
                </React.Fragment>
            ))}

            {showLoadingMore && (
                <div className="w-full flex items-center justify-center py-8">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} />
                </div>
            )}
        </div>
    );
};

export default CategoryPosts;