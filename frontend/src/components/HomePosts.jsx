import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const POSTS_PER_PAGE = 10;
const HOME_CACHE_KEY = 'home_feed_cache';

const HomePosts = ({ saveHomePostsCache, getHomePostsCache, clearHomePostsCache }) => {
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

    const initialMountHandled = useRef(false);
    const isRestoringScroll = useRef(false);
    const isRestoringFromCache = useRef(false);

    const fetchPosts = useCallback(async (pageNumber = 0, size = POSTS_PER_PAGE, currentSortBy = sortBy, append = true) => {
        if (isRestoringFromCache.current) {
            return [];
        }

        if (!isRestoringFromCache.current && !isRestoringScroll.current) {
            setLoading(true);
        }
        setError(null);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/posts`, {
                params: {
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
            console.error('Error fetching home feed posts:', err);
            setError('Failed to load home feed posts.');
            toast.error('Failed to load home feed posts.');
            setHasMore(false);
            return [];
        } finally {
            if (!isRestoringFromCache.current && !isRestoringScroll.current) {
                setLoading(false);
            }
        }
    }, [sortBy, posts]);

    useEffect(() => {
        if (!initialMountHandled.current) {
            initialMountHandled.current = true;

            const cachedDataDesc = getHomePostsCache(HOME_CACHE_KEY, 'createdAt,desc');
            const cachedDataAsc = getHomePostsCache(HOME_CACHE_KEY, 'createdAt,asc');

            let cachedDataToUse = null;

            if (cachedDataDesc && cachedDataDesc.posts && cachedDataDesc.posts.length > 0) {
                cachedDataToUse = cachedDataDesc;
            } else if (cachedDataAsc && cachedDataAsc.posts && cachedDataAsc.posts.length > 0) {
                cachedDataToUse = cachedDataAsc;
            }

            if (cachedDataToUse) {
                isRestoringFromCache.current = true;

                if (cachedDataToUse.sortBy !== undefined) {
                    setSortBy(cachedDataToUse.sortBy);
                }

                setPosts(cachedDataToUse.posts);
                setLoadedPostCount(cachedDataToUse.loadedCount);

                const restoredPages = Math.ceil(cachedDataToUse.posts.length / POSTS_PER_PAGE) - 1;
                setPage(Math.max(restoredPages, 0));

                setHasMore(cachedDataToUse.hasMore);
                setLoading(false);

                if (cachedDataToUse.scrollY !== undefined) {
                    isRestoringScroll.current = true;

                    setTimeout(() => {
                        window.scrollTo(0, cachedDataToUse.scrollY);
                        isRestoringScroll.current = false;

                        if (cachedDataToUse.hasMore) {
                            const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
                            const viewportHeight = window.innerHeight;

                            if (containerHeight <= viewportHeight ||
                                (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500)) {
                                loadMore();
                            }
                        }

                        setTimeout(() => {
                            isRestoringFromCache.current = false;
                        }, 500);
                    }, 100);
                } else {
                    setTimeout(() => {
                        if (cachedDataToUse.hasMore) {
                            const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
                            const viewportHeight = window.innerHeight;

                            if (containerHeight <= viewportHeight) {
                                loadMore();
                            }
                        }

                        setTimeout(() => {
                            isRestoringFromCache.current = false;
                        }, 500);
                    }, 100);
                }

                clearHomePostsCache(HOME_CACHE_KEY, cachedDataToUse.sortBy);
            } else {
                setPage(0);
                setPosts([]);
                setHasMore(true);
                setLoadedPostCount(0);
                fetchPosts(0, POSTS_PER_PAGE, sortBy, false);
            }
        }
    }, [sortBy, fetchPosts, getHomePostsCache, clearHomePostsCache]);

    const prevSortRef = useRef(sortBy);

    useEffect(() => {
        if (initialMountHandled.current &&
            prevSortRef.current !== sortBy &&
            !isRestoringFromCache.current) {

            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);
            fetchPosts(0, POSTS_PER_PAGE, sortBy, false);
        }

        prevSortRef.current = sortBy;
    }, [sortBy]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        if (!loading && hasMore && !isRestoringScroll.current && !isRestoringFromCache.current) {
            fetchPosts(nextPage, POSTS_PER_PAGE, sortBy, true);
            setPage(nextPage);
        }
    }, [loading, hasMore, page, sortBy, fetchPosts]);

    const handleScroll = useCallback(() => {
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

    const saveCurrentStateToCache = useCallback(() => {
        if (posts.length > 0) {
            saveHomePostsCache(
                HOME_CACHE_KEY,
                sortBy,
                posts,
                posts.length,
                window.scrollY,
                page,
                hasMore
            );
        }
    }, [sortBy, posts, page, hasMore, saveHomePostsCache]);

    const handleSortChange = (newSortBy) => {
        if (newSortBy !== sortBy) {
            setSortBy(newSortBy);
            clearHomePostsCache(HOME_CACHE_KEY, newSortBy);
            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);
            fetchPosts(0, POSTS_PER_PAGE, newSortBy, false);
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

export default HomePosts;