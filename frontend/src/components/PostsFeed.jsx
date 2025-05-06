import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useDeletedPosts } from '../contexts/DeletedPostsContext'; // Import the hook

const POSTS_PER_PAGE = 10;
const SCROLL_THRESHOLD = 800;

const getCacheKey = (creatorPublicId, isFollowingFeed) => {
    if (creatorPublicId) {
        return `user_posts_cache_${creatorPublicId}`;
    } else if (isFollowingFeed) {
        return 'following_feed_cache';
    } else {
        return 'home_feed_cache';
    }
};

const getInitialStateFromCache = (getHomePostsCache, creatorPublicId) => {
    const cacheKeyGeneralDesc = getCacheKey(creatorPublicId, false);
    const cachedDataGeneralDesc = getHomePostsCache(cacheKeyGeneralDesc, 'createdAt,desc');

    const cacheKeyGeneralAsc = getCacheKey(creatorPublicId, false);
    const cachedDataGeneralAsc = getHomePostsCache(cacheKeyGeneralAsc, 'createdAt,asc');

    const cacheKeyFollowingDesc = getCacheKey(creatorPublicId, true);
    const cachedDataFollowingDesc = getHomePostsCache(cacheKeyFollowingDesc, 'createdAt,desc');

    const cacheKeyFollowingAsc = getCacheKey(creatorPublicId, true);
    const cachedDataFollowingAsc = getHomePostsCache(cacheKeyFollowingAsc, 'createdAt,asc');

    let restoredSortBy = 'createdAt,desc';
    let restoredIsFollowingFeed = false;
    let cachedDataToUse = null;

    if (cachedDataFollowingAsc && cachedDataFollowingAsc.posts && cachedDataFollowingAsc.posts.length > 0) {
        cachedDataToUse = cachedDataFollowingAsc;
        restoredSortBy = 'createdAt,asc';
        restoredIsFollowingFeed = true;
    } else if (cachedDataFollowingDesc && cachedDataFollowingDesc.posts && cachedDataFollowingDesc.posts.length > 0) {
        cachedDataToUse = cachedDataFollowingDesc;
        restoredSortBy = 'createdAt,desc';
        restoredIsFollowingFeed = true;
    } else if (cachedDataGeneralAsc && cachedDataGeneralAsc.posts && cachedDataGeneralAsc.posts.length > 0) {
        cachedDataToUse = cachedDataGeneralAsc;
        restoredSortBy = 'createdAt,asc';
        restoredIsFollowingFeed = false;
    } else if (cachedDataGeneralDesc && cachedDataGeneralDesc.posts && cachedDataGeneralDesc.posts.length > 0) {
        cachedDataToUse = cachedDataGeneralDesc;
        restoredSortBy = 'createdAt,desc';
        restoredIsFollowingFeed = false;
    }

    if (cachedDataToUse) {
        if (cachedDataToUse.sortBy !== undefined) {
            restoredSortBy = cachedDataToUse.sortBy;
        }
        if (cachedDataToUse.isFollowingFeed !== undefined) {
            restoredIsFollowingFeed = cachedDataToUse.isFollowingFeed;
        }
    } else {
        if (cachedDataFollowingAsc && cachedDataFollowingAsc.sortBy !== undefined) {
            restoredSortBy = cachedDataFollowingAsc.sortBy;
            restoredIsFollowingFeed = true;
        } else if (cachedDataFollowingDesc && cachedDataFollowingDesc.sortBy !== undefined) {
            restoredSortBy = cachedDataFollowingDesc.sortBy;
            restoredIsFollowingFeed = true;
        } else if (cachedDataGeneralAsc && cachedDataGeneralAsc.sortBy !== undefined) {
            restoredSortBy = cachedDataGeneralAsc.sortBy;
            restoredIsFollowingFeed = false;
        } else if (cachedDataGeneralDesc && cachedDataGeneralDesc.sortBy !== undefined) {
            restoredSortBy = cachedDataGeneralDesc.sortBy;
            restoredIsFollowingFeed = false;
        }
    }

    return { initialSortBy: restoredSortBy, initialIsFollowingFeed: restoredIsFollowingFeed };
};

const PostsFeed = ({ saveHomePostsCache, getHomePostsCache, clearHomePostsCache, creatorPublicId }) => {
    const { initialSortBy, initialIsFollowingFeed } = getInitialStateFromCache(getHomePostsCache, creatorPublicId);
    const { deletedPostIds, addDeletedPostId } = useDeletedPosts();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [isFollowingFeed, setIsFollowingFeed] = useState(initialIsFollowingFeed);
    const [loadedPostCount, setLoadedPostCount] = useState(0);

    const authToken = Cookies.get('token');

    const location = useLocation();
    const navigate = useNavigate();

    const postsContainerRef = useRef(null);

    const isRestoringScroll = useRef(false);
    const isRestoringFromCache = useRef(false);
    const initialMountDataLoaded = useRef(false);

    const fetchPosts = useCallback(async (pageNumber = 0, size = POSTS_PER_PAGE, currentSortBy = sortBy, append = true, currentIsFollowingFeed = isFollowingFeed, currentAuthToken = authToken) => {
        if (isRestoringFromCache.current || isRestoringScroll.current) {
            return [];
        }

        if (currentIsFollowingFeed && !currentAuthToken) {
            console.warn("Cannot fetch following feed without authentication token.");
            setError("Authentication required for following feed.");
            setLoading(false);
            setHasMore(false);
            setPosts([]);
            setLoadedPostCount(0);
            return [];
        }

        if (!append) {
            setLoading(true);
        }

        setError(null);

        const params = {
            page: pageNumber,
            size: size,
            sort: currentSortBy
        };

        let url = `http://localhost:8080/api/v1/posts`;

        if (creatorPublicId) {
            params.creatorPublicId = creatorPublicId;
            url = `http://localhost:8080/api/v1/posts`;
        } else if (currentIsFollowingFeed) {
            url = `http://localhost:8080/api/v1/users/me/follows/posts`;
        }

        const headers = {};
        if (currentIsFollowingFeed && currentAuthToken) {
            headers['Authorization'] = `Bearer ${currentAuthToken}`;
        }

        try {
            const res = await axios.get(url, {
                params: params,
                headers: headers,
            });

            if (res.status === 204 || res.data.content.length === 0) {
                if (pageNumber === 0 && !append) {
                    setPosts([]);
                    setLoadedPostCount(0);
                }
                setHasMore(false);
                return res.data.content;
            } else {
                // Filter out deleted posts from the fetched data
                const newPosts = res.data.content.filter(post => !deletedPostIds.includes(post.id));

                if (append) {
                    setPosts(prev => {
                        // Ensure prev is an array before concatenating
                        const prevArray = Array.isArray(prev) ? prev : [];
                        const existingPostIds = new Set(prevArray.map(p => p.id));
                        const uniqueNewPosts = newPosts.filter(p => !existingPostIds.has(p.id));
                        return [...prevArray, ...uniqueNewPosts];
                    });
                    setLoadedPostCount(prevCount => prevCount + newPosts.length);
                } else {
                    const uniqueNewPosts = newPosts;
                    setPosts(uniqueNewPosts);
                    setLoadedPostCount(uniqueNewPosts.length);
                }
                setHasMore(!res.data.last);
                return newPosts; // Return filtered posts
            }

        } catch (err) {
            console.error('Error fetching posts:', err);
            if (err.response && err.response.status === 401 && currentIsFollowingFeed) {
                setError('Authentication required or invalid token for following feed.');
                toast.error('Authentication required or invalid token.');
            } else {
                setError('Failed to load posts.');
                toast.error('Failed to load posts.');
            }
            setHasMore(false);
            return [];
        } finally {
            if (!append) {
                setLoading(false);
            }
        }
    }, [sortBy, creatorPublicId, isFollowingFeed, authToken, deletedPostIds]);

    const prevSortRef = useRef(sortBy);
    const prevCreatorRef = useRef(creatorPublicId);
    const prevIsFollowingFeedRef = useRef(isFollowingFeed);
    const prevAuthTokenRef = useRef(authToken);

    useEffect(() => {
        const cacheKey = getCacheKey(creatorPublicId, isFollowingFeed);
        const specificCachedData = getHomePostsCache(cacheKey, sortBy);

        if (initialMountDataLoaded.current &&
            (prevSortRef.current !== sortBy ||
                prevCreatorRef.current !== creatorPublicId ||
                prevIsFollowingFeedRef.current !== isFollowingFeed ||
                prevAuthTokenRef.current !== authToken)) {

            if (prevIsFollowingFeedRef.current !== isFollowingFeed && !creatorPublicId) {
                clearHomePostsCache(getCacheKey(creatorPublicId, prevIsFollowingFeedRef.current), sortBy);
                clearHomePostsCache(getCacheKey(creatorPublicId, isFollowingFeed), sortBy);
            } else if (prevSortRef.current !== sortBy || prevCreatorRef.current !== creatorPublicId || prevAuthTokenRef.current !== authToken) {
                clearHomePostsCache(getCacheKey(creatorPublicId, isFollowingFeed), sortBy);
            }

            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);
            fetchPosts(0, POSTS_PER_PAGE, sortBy, false, isFollowingFeed, authToken);

        } else if (!initialMountDataLoaded.current) {
            initialMountDataLoaded.current = true;

            if (specificCachedData && specificCachedData.posts && specificCachedData.posts.length > 0) {
                isRestoringFromCache.current = true;

                // Filter out deleted posts from cache data
                const filteredCachedPosts = specificCachedData.posts.filter(post => !deletedPostIds.includes(post.id));

                setPosts(filteredCachedPosts);
                setLoadedPostCount(filteredCachedPosts.length); // Update count based on filtered posts

                const restoredPages = Math.ceil(filteredCachedPosts.length / POSTS_PER_PAGE) - 1;
                setPage(Math.max(restoredPages, 0));

                setHasMore(specificCachedData.hasMore); // Keep original hasMore for now
                setLoading(false);

                if (specificCachedData.scrollY !== undefined) {
                    isRestoringScroll.current = true;
                    setTimeout(() => {
                        window.scrollTo(0, specificCachedData.scrollY);
                    }, 50);
                }

                setTimeout(() => {
                    isRestoringFromCache.current = false;
                    isRestoringScroll.current = false;

                    // Re-evaluate if more content is needed after filtering cache
                    const currentScrollY = window.scrollY;
                    const viewportHeight = window.innerHeight;
                    const documentHeight = document.body.offsetHeight;
                    const isContentShorterThanViewport = documentHeight <= viewportHeight;
                    const isNearBottomAfterRestore = (currentScrollY + viewportHeight) >= (documentHeight - SCROLL_THRESHOLD);

                    if (specificCachedData.hasMore && (isContentShorterThanViewport || isNearBottomAfterRestore)) {
                        // If content is short or near bottom after filtering, load more
                        loadMore();
                    }

                }, specificCachedData.scrollY !== undefined ? 150 : 100);

                clearHomePostsCache(cacheKey, specificCachedData.sortBy);

            } else {
                setPage(0);
                setPosts([]);
                setHasMore(true);
                setLoadedPostCount(0);
                fetchPosts(0, POSTS_PER_PAGE, sortBy, false, isFollowingFeed, authToken);
            }
        }

        prevSortRef.current = sortBy;
        prevCreatorRef.current = creatorPublicId;
        prevIsFollowingFeedRef.current = isFollowingFeed;
        prevAuthTokenRef.current = authToken;

    }, [sortBy, creatorPublicId, isFollowingFeed, authToken, fetchPosts, getHomePostsCache, clearHomePostsCache, deletedPostIds]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        if (!loading && hasMore && !isRestoringScroll.current && !isRestoringFromCache.current) {
            fetchPosts(nextPage, POSTS_PER_PAGE, sortBy, true, isFollowingFeed, authToken);
            setPage(nextPage);
        }
    }, [loading, hasMore, page, sortBy, fetchPosts, isFollowingFeed, authToken]);

    const handleScroll = useCallback(() => {
        if (isRestoringScroll.current || isRestoringFromCache.current) {
            return;
        }

        const isNearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - SCROLL_THRESHOLD;
        const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
        const viewportHeight = window.innerHeight;
        const isContentScrollable = containerHeight > viewportHeight;

        if (isNearBottom && hasMore && !loading && isContentScrollable) {
            loadMore();
        }
    }, [hasMore, loading, loadMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const saveCurrentStateToCache = useCallback(() => {
        // When saving to cache, filter out deleted posts first
        const postsToCache = posts.filter(post => !deletedPostIds.includes(post.id));
        const cacheKey = getCacheKey(creatorPublicId, isFollowingFeed);
        if (postsToCache.length > 0) {
            saveHomePostsCache(
                cacheKey,
                sortBy,
                postsToCache, // Save filtered posts
                postsToCache.length, // Save filtered count
                window.scrollY,
                page,
                hasMore,
                isFollowingFeed
            );
        } else {
            // If all posts are filtered out, clear the cache for this key/sort
            clearHomePostsCache(cacheKey, sortBy);
        }
    }, [sortBy, posts, page, hasMore, saveHomePostsCache, creatorPublicId, isFollowingFeed, deletedPostIds, clearHomePostsCache]);

    const handleSortChange = (newSortBy) => {
        if (newSortBy !== sortBy) {
            setSortBy(newSortBy);
            const cacheKey = getCacheKey(creatorPublicId, isFollowingFeed);
            clearHomePostsCache(cacheKey, sortBy);
            clearHomePostsCache(cacheKey, newSortBy);

            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);
            fetchPosts(0, POSTS_PER_PAGE, newSortBy, false, isFollowingFeed, authToken);
        }
    };

    const handleToggleFollowingFeed = () => {
        if (!creatorPublicId) {
            const newIsFollowingFeed = !isFollowingFeed;
            setIsFollowingFeed(newIsFollowingFeed);
            clearHomePostsCache(getCacheKey(creatorPublicId, isFollowingFeed), sortBy);
            clearHomePostsCache(getCacheKey(creatorPublicId, newIsFollowingFeed), sortBy);
            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);
            fetchPosts(0, POSTS_PER_PAGE, sortBy, false, newIsFollowingFeed, authToken);
        } else {
            toast.info("Following feed is not available on a user's profile page.");
        }
    };

    // This function is still needed for deletions initiated *within* this feed component
    const handleDeletePost = useCallback((deletedPostId) => {
        // Ensure currentPosts is an array before filtering
        setPosts(currentPosts => Array.isArray(currentPosts) ? currentPosts.filter(post => post.id !== deletedPostId) : []);
        // When a post is deleted from here, also add it to the global context
        addDeletedPostId(deletedPostId);
    }, [addDeletedPostId]);

    // Effect to filter posts whenever deletedPostIds changes
    useEffect(() => {
        // This effect runs when deletedPostIds changes (e.g., after returning from post detail page)
        // Filter the currently displayed posts
        // Ensure currentPosts is an array before filtering
        setPosts(currentPosts => Array.isArray(currentPosts) ? currentPosts.filter(post => !deletedPostIds.includes(post.id)) : []);
        // Recalculate loadedPostCount based on filtered posts
        setLoadedPostCount(currentPosts => Array.isArray(currentPosts) ? currentPosts.filter(post => !deletedPostIds.includes(post.id)).length : 0);

    }, [deletedPostIds]); // Dependency on deletedPostIds

    const showInitialLoading = loading && posts.length === 0 && !error;
    const showLoadingMore = loading && posts.length > 0 && hasMore;

    return (
        <div className="space-y-1" ref={postsContainerRef}>
            <div className="flex justify-between items-center mb-4 space-x-4">
                {!creatorPublicId && authToken && (
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                            isFollowingFeed
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                        onClick={handleToggleFollowingFeed}
                        disabled={loading}
                    >
                        {isFollowingFeed ? 'Showing Following Feed' : 'Show Following Feed'}
                    </button>
                )}

                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Sort By:</span>
                    <button
                        className={`text-sm ${sortBy === 'createdAt,desc' ? 'font-bold text-black underline' : 'text-gray-600 hover:underline'}`}
                        onClick={() => handleSortChange('createdAt,desc')}
                        disabled={loading}
                    >
                        Newest
                    </button>
                    <button
                        className={`text-sm ${sortBy === 'createdAt,asc' ? 'font-bold text-black underline' : 'text-gray-600 hover:underline'}`}
                        onClick={() => handleSortChange('createdAt,asc')}
                        disabled={loading}
                    >
                        Oldest
                    </button>
                </div>
            </div>

            {(posts.length > 0 || showLoadingMore) && <hr className="border-gray-300 my-2" />}

            {error && (
                <div className="p-6 bg-red-100 rounded-md border border-red-400 text-center text-red-700">
                    {error}
                </div>
            )}

            {showInitialLoading && (
                <div className="w-full flex items-center justify-center py-8">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} />
                </div>
            )}

            {!loading && posts.length === 0 && !error && (
                <div className=" border-border text-center text-gray-medium">
                    <hr className="w-full my-4 border-gray-300" />
                    {isFollowingFeed ? "You are not following any categories yet, or they do not have any posts." : "No posts found."}
                </div>
            )}

            {posts.map((post, index) => (
                <React.Fragment key={post.id}>
                    <PostCard
                        post={post}
                        saveCurrentStateToCache={saveCurrentStateToCache}
                        onDeleteSuccess={handleDeletePost}
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

export default PostsFeed;