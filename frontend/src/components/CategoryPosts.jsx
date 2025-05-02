import React, { useEffect, useState } from 'react';
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

    const fetchPosts = async (pageNumber = 0) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/posts`, {
                params: {
                    categorySlug,
                    page: pageNumber,
                    size: 10,
                    sort: 'createdAt,desc'
                }
            });

            if (res.status === 204 || res.data.content.length === 0) {
                if (pageNumber === 0) setPosts([]);
                setHasMore(false);
                return;
            }

            if (pageNumber === 0) {
                setPosts(res.data.content);
            } else {
                setPosts(prev => [...prev, ...res.data.content]);
            }

            setHasMore(!res.data.last);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts.');
            toast.error('Failed to load posts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
        fetchPosts(0);
    }, [categorySlug]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
    };

    return (
        <div className="space-y-4">
            {loading && posts.length === 0 && (
                <div className="p-6 bg-white rounded-md border border-border text-center text-gray-medium">
                    <Oval height={24} width={24} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} />
                    <p>Loading posts...</p>
                </div>
            )}

            {!loading && error && (
                <div className="p-6 bg-white rounded-md border border-red-300 text-center text-red-600">
                    {error}
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="p-6 bg-white rounded-md border border-border text-center text-gray-medium">
                    No posts found.
                </div>
            )}

            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}

            {hasMore && !loading && (
                <div className="flex justify-center">
                    <button
                        onClick={loadMore}
                        className="bg-accent-green hover:bg-green-700 text-white font-medium px-4 py-2 rounded-full transition duration-300"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default CategoryPosts;