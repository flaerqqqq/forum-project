import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';

const CategoryPosts = ({ categorySlug }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState('createdAt,desc');

    const initialFetchDone = useRef(false);

    const fetchPosts = async (pageNumber = 0, currentSortBy = sortBy) => {
        if (!initialFetchDone.current || pageNumber > 0) {
            setLoading(true);
        }
        setError(null);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/posts`, {
                params: {
                    categorySlug,
                    page: pageNumber,
                    size: 10,
                    sort: currentSortBy
                }
            });

            if (res.status === 204 || res.data.content.length === 0) {
                if (pageNumber === 0) setPosts([]);
                setHasMore(false);
            } else {
                if (pageNumber === 0) {
                    setPosts(res.data.content);
                } else {
                    setPosts(prev => [...prev, ...res.data.content]);
                }
                setHasMore(!res.data.last);
            }


        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts.');
            toast.error('Failed to load posts.');
            setHasMore(false);
        } finally {
            setLoading(false);
            initialFetchDone.current = true;
        }
    };

    useEffect(() => {
        setPage(0);
        setPosts([]);
        setHasMore(true);
        initialFetchDone.current = false;
        fetchPosts(0, sortBy);
    }, [categorySlug, sortBy]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage, sortBy);
    };

    const handleScroll = () => {
        const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;

        if (isAtBottom && hasMore && !loading) {
            loadMore();
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore, loading, sortBy, categorySlug]);


    const handleSortChange = (newSortBy) => {
        if (newSortBy !== sortBy) {
            setSortBy(newSortBy);
        }
    };

    const showInitialLoading = loading && posts.length === 0 && !error;
    const showLoadingMore = loading && posts.length > 0;


    return (
        <div className="space-y-1">
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


            {posts.length > 0 && <hr className="border-gray-300 my-2" />}

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
                    <PostCard post={post} />
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