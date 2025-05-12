import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDeletedPosts } from '../contexts/DeletedPostsContext';
import Cookies from "js-cookie";

const POSTS_PER_PAGE = 10;
const SCROLL_THRESHOLD = 800;
const MIN_LOADING_TIME = 300;

const CategoryPosts = ({ categorySlug, saveCategoryPostsCache, getCategoryPostsCache, clearCategoryPostsCache }) => {
    const { deletedPostIds, addDeletedPostId } = useDeletedPosts();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState('createdAt,desc');
    const [loadedPostCount, setLoadedPostCount] = useState(0);
    const [minContainerHeight, setMinContainerHeight] = useState('auto');


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
        const authToken = Cookies.get('token')
        const startTime = Date.now();

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/posts`, {
                params: {
                    categorySlug,
                    page: pageNumber,
                    size: size,
                    sort: currentSortBy
                },
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            });

            const fetchedPosts = res.data.content || [];
            const isLast = res.data.last;

            const newPosts = fetchedPosts.filter(post => !deletedPostIds.includes(post.id));

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                if (res.status === 204 || fetchedPosts.length === 0) {
                    if (pageNumber === 0 && !append) {
                        setPosts([]);
                        setLoadedPostCount(0);
                    }
                    setHasMore(false);
                } else {
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
                    setHasMore(!isLast);
                }
                if (!isRestoringFromCache.current && !isRestoringScroll.current) {
                    setLoading(false);
                }
                setMinContainerHeight('auto');
            }, remainingTime);

            return newPosts;

        } catch (err) {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts.');
                toast.error('Failed to load posts.');
                setHasMore(false);
                if (!isRestoringFromCache.current && !isRestoringScroll.current) {
                    setLoading(false);
                }
                setMinContainerHeight('auto');
            }, remainingTime);

            return [];
        }
    }, [categorySlug, sortBy, deletedPostIds]);

    useEffect(() => {
        if (!initialMountHandled.current) {
            initialMountHandled.current = true;

            const cachedDataDesc = getCategoryPostsCache(categorySlug, 'createdAt,desc');
            const cachedDataAsc = getCategoryPostsCache(categorySlug, 'createdAt,asc');

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

                const filteredCachedPosts = cachedDataToUse.posts.filter(post => !deletedPostIds.includes(post.id));

                setPosts(filteredCachedPosts);
                setLoadedPostCount(filteredCachedPosts.length);

                const restoredPages = Math.ceil(filteredCachedPosts.length / POSTS_PER_PAGE) - 1;
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
                        }, 0);
                    }, 0);
                } else {
                    setTimeout(() => {
                        if (cachedDataToUse.hasMore) {
                            const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
                            const viewportHeight = window.innerHeight;

                            if (containerHeight <= viewportHeight) {
                                loadMore();
                            }
                        }
                        isRestoringFromCache.current = false;
                    }, 0);
                }


                clearCategoryPostsCache(categorySlug, cachedDataToUse.sortBy);
            } else {
                setPage(0);
                setPosts([]);
                setHasMore(true);
                setLoadedPostCount(0);
                fetchPosts(0, POSTS_PER_PAGE, sortBy, false);
            }
        }
    }, [categorySlug, sortBy, fetchPosts, getCategoryPostsCache, clearCategoryPostsCache, deletedPostIds]);

    const prevCategoryRef = useRef(categorySlug);
    const prevSortRef = useRef(sortBy);

    useEffect(() => {
        if (initialMountHandled.current &&
            (prevCategoryRef.current !== categorySlug || prevSortRef.current !== sortBy) &&
            !isRestoringFromCache.current) {

            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);

            if (postsContainerRef.current) {
                setMinContainerHeight(`${postsContainerRef.current.scrollHeight}px`);
            }

            fetchPosts(0, POSTS_PER_PAGE, sortBy, false);
        }

        prevCategoryRef.current = categorySlug;
        prevSortRef.current = sortBy;
    }, [categorySlug, sortBy, fetchPosts]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        if (!loading && hasMore && !isRestoringScroll.current && !isRestoringFromCache.current) {
            fetchPosts(nextPage, POSTS_PER_PAGE, sortBy, true);
            setPage(nextPage);
        }
    }, [loading, hasMore, page, sortBy, fetchPosts]);

    const handleScroll = useCallback(() => {
        if (isRestoringScroll.current || isRestoringFromCache.current || loading) {
            return;
        }

        const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - SCROLL_THRESHOLD; // Use SCROLL_THRESHOLD

        const containerHeight = postsContainerRef.current ? postsContainerRef.current.scrollHeight : 0;
        const viewportHeight = window.innerHeight;
        const isContentScrollable = containerHeight > viewportHeight;

        if (isAtBottom && hasMore && !loading && isContentScrollable) {
            loadMore();
        }
        else if (!isContentScrollable && hasMore && posts.length > 0) {
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
        if (categorySlug && postsToCache.length > 0) {
            saveCategoryPostsCache(
                categorySlug,
                sortBy,
                postsToCache,
                postsToCache.length,
                window.scrollY,
                page,
                hasMore
            );
        } else if (categorySlug) {
            clearCategoryPostsCache(categorySlug, sortBy);
        }
    }, [categorySlug, sortBy, posts, page, hasMore, saveCategoryPostsCache, deletedPostIds, clearCategoryPostsCache]);

    const handleSortChange = (newSortBy) => {
        if (newSortBy !== sortBy) {
            if (postsContainerRef.current) {
                setMinContainerHeight(`${postsContainerRef.current.scrollHeight}px`);
            }

            setSortBy(newSortBy);
            clearCategoryPostsCache(categorySlug, newSortBy);
            clearCategoryPostsCache(categorySlug, sortBy);

            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);

            fetchPosts(0, POSTS_PER_PAGE, newSortBy, false);
        }
    };

    const handleDeletePost = useCallback((deletedPostId) => {
        setPosts(currentPosts => Array.isArray(currentPosts) ? currentPosts.filter(post => post.id !== deletedPostId) : []);
        setLoadedPostCount(prevCount => Math.max(0, prevCount - 1));
        addDeletedPostId(deletedPostId);
    }, [addDeletedPostId]);

    useEffect(() => {
        setPosts(currentPosts => Array.isArray(currentPosts) ? currentPosts.filter(post => !deletedPostIds.includes(post.id)) : []);
        setLoadedPostCount(currentPosts => Array.isArray(currentPosts) ? currentPosts.filter(post => !deletedPostIds.includes(post.id)).length : 0);
    }, [deletedPostIds]);

    const showInitialLoading = loading && posts.length === 0 && !error;
    const showLoadingMore = loading && posts.length > 0 && hasMore;

    return (
        <div className="space-y-1" ref={postsContainerRef} style={{ minHeight: minContainerHeight }}>
            <div className="flex justify-end items-center mb-4 space-x-1">
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

            {(posts.length > 0 || showInitialLoading || showLoadingMore) && !error && (
                <hr className="border-gray-300 my-2" />
            )}


            {error && (
                <div className="p-6 bg-red-100 rounded-md border border-red-400 text-center text-red-700">
                    Failed to load posts.
                </div>
            )}

            {showInitialLoading && (
                <div className="w-full h-full flex items-center justify-center py-8">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} />
                </div>
            )}

            {!loading && posts.length === 0 && !error && (
                <div className=" border-border text-center text-gray-medium py-4">
                    No posts found.
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
                <div className="w-full flex items-center justify-center py-6">
                    <Oval height={28} width={28} color="#6B7280" secondaryColor="#E5E7EB" strokeWidth={3} />
                </div>
            )}
        </div>
    );
};

export default CategoryPosts;