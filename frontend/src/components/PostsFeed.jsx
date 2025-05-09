import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useDeletedPosts } from '../contexts/DeletedPostsContext';

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

        if (!append) {
            setLoading(true);
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
                const newPosts = res.data.content.filter(post => !deletedPostIds.includes(post.id));

                if (append) {
                    setPosts(prev => {
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
                return newPosts;
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
            setLoading(false);
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

                const filteredCachedPosts = specificCachedData.posts.filter(post => !deletedPostIds.includes(post.id));

                setPosts(filteredCachedPosts);
                setLoadedPostCount(filteredCachedPosts.length);

                const restoredPages = Math.ceil(filteredCachedPosts.length / POSTS_PER_PAGE) - 1;
                setPage(Math.max(restoredPages, 0));

                setHasMore(specificCachedData.hasMore);
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

                    const currentScrollY = window.scrollY;
                    const viewportHeight = window.innerHeight;
                    const documentHeight = document.body.offsetHeight;
                    const isContentShorterThanViewport = documentHeight <= viewportHeight;
                    const isNearBottomAfterRestore = (currentScrollY + viewportHeight) >= (documentHeight - SCROLL_THRESHOLD);

                    if (specificCachedData.hasMore && (isContentShorterThanViewport || isNearBottomAfterRestore)) {
                        loadMore();
                    }

                }, specificCachedData.scrollY !== undefined ? 150 : 100);

                clearHomePostsCache(cacheKey, specificCachedData.sortBy);

            } else {
                scrollTo(0, 0)
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
            setLoading(true);
            fetchPosts(nextPage, POSTS_PER_PAGE, sortBy, true, isFollowingFeed, authToken);
            setPage(nextPage);
        }
    }, [loading, hasMore, page, sortBy, fetchPosts, isFollowingFeed, authToken]);

    const handleScroll = useCallback(() => {
        if (isRestoringScroll.current || isRestoringFromCache.current || loading) {
            return;
        }

        const isNearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - SCROLL_THRESHOLD;
        const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
        const viewportHeight = window.innerHeight;
        const isContentScrollable = containerHeight > viewportHeight;


        if (isNearBottom && hasMore && isContentScrollable) {
            loadMore();
        } else if (!isContentScrollable && hasMore && posts.length > 0) {

            loadMore();
        }

    }, [hasMore, loading, loadMore, posts.length]);


    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    useEffect(() => {
        if (!loading && hasMore && posts.length > 0) {
            const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
            const viewportHeight = window.innerHeight;
            const isContentScrollable = containerHeight > viewportHeight;

            if (!isContentScrollable) {

                loadMore();
            }
        }
    }, [posts.length, loading, hasMore, loadMore]);


    const saveCurrentStateToCache = useCallback(() => {
        const postsToCache = posts.filter(post => !deletedPostIds.includes(post.id));
        const cacheKey = getCacheKey(creatorPublicId, isFollowingFeed);
        if (postsToCache.length > 0) {
            saveHomePostsCache(
                cacheKey,
                sortBy,
                postsToCache,
                postsToCache.length,
                window.scrollY,
                page,
                hasMore,
                isFollowingFeed
            );
        } else {
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

    const handleDeletePost = useCallback((deletedPostId) => {
        setPosts(currentPosts => Array.isArray(currentPosts) ? currentPosts.filter(post => post.id !== deletedPostId) : []);
        addDeletedPostId(deletedPostId);
    }, [addDeletedPostId]);

    useEffect(() => {
        setPosts(currentPosts => Array.isArray(currentPosts) ? currentPosts.filter(post => !deletedPostIds.includes(post.id)) : []);
        setLoadedPostCount(currentPosts => Array.isArray(currentPosts) ? currentPosts.filter(post => !deletedPostIds.includes(post.id)).length : 0);
    }, [deletedPostIds]);

    const showInitialLoading = loading && posts.length === 0 && !error;
    const showLoadingMore = loading && posts.length > 0 && hasMore;


    return (
        <div className="space-y-1" ref={postsContainerRef}>
            <div className="flex justify-between items-center mb-4 space-x-4">
                {!creatorPublicId && authToken && (
                    <div className="flex items-center justify-center bg-gray-light rounded-full p-1 w-fit ">
                        <button
                            onClick={handleToggleFollowingFeed}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${!isFollowingFeed ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        >Home</button>
                        <button
                            onClick={handleToggleFollowingFeed}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${isFollowingFeed ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        >Following</button>
                    </div>
                )}

                <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">Sort By:</span>
                    <button
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${sortBy === 'createdAt,desc' ? 'bg-accent-green text-white' : 'bg-gray-light text-gray-darker hover:bg-gray-medium'}`}
                        onClick={() => handleSortChange('createdAt,desc')}
                        disabled={loading}
                    >
                        Newest
                    </button>
                    <button
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${sortBy === 'createdAt,asc' ? 'bg-accent-green text-white' : 'bg-gray-light text-gray-darker hover:bg-gray-medium'}`}
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