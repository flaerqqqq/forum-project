import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useDeletedPosts } from '../contexts/DeletedPostsContext';
import Cookies from "js-cookie";

const POSTS_PER_PAGE = 10;
const getCacheKey = (searchQuery) => `search_results_cache_${searchQuery}`;

const SearchResultsFeed = ({ saveSearchResultsPostsCache, getSearchResultsPostsCache, clearSearchResultsPostsCache, searchQuery }) => {
    const { deletedPostIds, addDeletedPostId } = useDeletedPosts();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState('created_at,desc');
    const [loadedPostCount, setLoadedPostCount] = useState(0);

    const postsContainerRef = useRef(null);

    const initialMountHandled = useRef(false);
    const isRestoringScroll = useRef(false);
    const isRestoringFromCache = useRef(false);

    const fetchSearchResults = useCallback(async (pageNumber = 0, size = POSTS_PER_PAGE, currentSortBy = sortBy, append = true) => {
        if (isRestoringFromCache.current) {
            return [];
        }

        if (!isRestoringFromCache.current && !isRestoringScroll.current) {
            setLoading(true);
        }
        setError(null);

        const params = {
            page: pageNumber,
            size: size,
            query: searchQuery
        };

        const token = Cookies.get('token')
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/posts/search`, {
                params: params,
                headers: token ? { Authorization: `Bearer ${token}` } : {}
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
            console.error('Error fetching search results:', err);
            setError('Failed to load search results.');
            toast.error('Failed to load search results.');
            setHasMore(false);
            return [];
        } finally {
            if (!isRestoringFromCache.current && !isRestoringScroll.current) {
                scrollTo(0, 0);
                setLoading(false);
            }
        }
    }, [sortBy, searchQuery, deletedPostIds]);

    useEffect(() => {
        if (!initialMountHandled.current) {
            initialMountHandled.current = true;

            const cacheKey = getCacheKey(searchQuery);

            const cachedDataDesc = getSearchResultsPostsCache(searchQuery, 'created_at,desc');
            const cachedDataAsc = getSearchResultsPostsCache(searchQuery, 'created_at,asc');

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

                clearSearchResultsPostsCache(searchQuery, cachedDataToUse.sortBy);
            } else {
                setPage(0);
                setPosts([]);
                setHasMore(true);
                setLoadedPostCount(0);
                fetchSearchResults(0, POSTS_PER_PAGE, sortBy, false);
            }
        }
    }, [searchQuery, sortBy, fetchSearchResults, getSearchResultsPostsCache, clearSearchResultsPostsCache, deletedPostIds]); // Add deletedPostIds to dependencies

    const prevSortRef = useRef(sortBy);
    const prevSearchQueryRef = useRef(searchQuery);

    useEffect(() => {
        if (initialMountHandled.current &&
            (prevSortRef.current !== sortBy || prevSearchQueryRef.current !== searchQuery) &&
            !isRestoringFromCache.current) {

            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);
            fetchSearchResults(0, POSTS_PER_PAGE, sortBy, false);
        }

        prevSortRef.current = sortBy;
        prevSearchQueryRef.current = searchQuery;
    }, [sortBy, searchQuery, fetchSearchResults]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        if (!loading && hasMore && !isRestoringScroll.current && !isRestoringFromCache.current) {
            fetchSearchResults(nextPage, POSTS_PER_PAGE, sortBy, true);
            setPage(nextPage);
        }
    }, [loading, hasMore, page, sortBy, fetchSearchResults]);

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
        const postsToCache = posts.filter(post => !deletedPostIds.includes(post.id));
        if (postsToCache.length > 0) {
            saveSearchResultsPostsCache(
                searchQuery,
                sortBy,
                postsToCache,
                postsToCache.length,
                window.scrollY,
                page,
                hasMore
            );
        } else {
            clearSearchResultsPostsCache(searchQuery, sortBy);
        }
    }, [sortBy, posts, page, hasMore, saveSearchResultsPostsCache, searchQuery, deletedPostIds, clearSearchResultsPostsCache]); // Add deletedPostIds and clearSearchResultsPostsCache to dependencies

    const handleSortChange = (newSortBy) => {
        if (newSortBy !== sortBy) {
            setSortBy(newSortBy);
            clearSearchResultsPostsCache(searchQuery, newSortBy);
            setPage(0);
            setPosts([]);
            setHasMore(true);
            setLoadedPostCount(0);
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
        <div className="space-y-1" ref={postsContainerRef}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Search Results for: "{searchQuery}"</h1>
            </div>

            {(posts.length > 0 || showLoadingMore) && <hr className="border-gray-300 my-2" />}

            {showInitialLoading && (
                <div className="w-full flex items-center justify-center py-8">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} />
                </div>
            )}

            {!loading && posts.length === 0 && !error && (
                <div className="text-center text-gray-medium">
                    <hr className="border-gray-300 my-2 w-full" />
                    No results found for "{searchQuery}". Try different keywords or check your spelling.
                </div>
            )}

            {error && (
                <hr className="border-gray-300 my-2 w-full" />
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

export default SearchResultsFeed;