import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import UserCommentaryItem from './UserCommentaryItem.jsx';

const PAGE_SIZE = 10;
const MIN_LOADING_TIME = 300;

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
    const parts = name.split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const UserCommentaries = ({ userPublicId, profileUser }) => {
    const [commentaries, setCommentaries] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('newest');

    const observer = useRef();

    const lastCommentaryRef = useCallback(node => {
        if (loading || initialLoading || !hasMore) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, initialLoading, hasMore]);

    const fetchCommentaries = useCallback(async () => {
        if (!userPublicId) {
            setInitialLoading(false);
            setHasMore(false);
            return;
        }

        if (page === 0) {
            setInitialLoading(true);
            setCommentaries([]);
            setHasMore(true);
        } else {
            setLoading(true);
        }

        setError(null);
        const startTime = Date.now();
        const token = Cookies.get('token');
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/users/me/comments`, {
                params: {
                    page,
                    size: PAGE_SIZE,
                    publicId: userPublicId,
                    sort: sortBy === 'newest' ? 'createdAt,desc' : 'createdAt,asc'
                }, headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            const fetchedCommentaries = res.data.content || [];
            const isLast = res.data.last;

            setCommentaries(prev => (page === 0 ? fetchedCommentaries : [...prev, ...fetchedCommentaries]));

            let morePages = !isLast;

            if (fetchedCommentaries.length === 0 && page > 0) {
                morePages = false;
            }

            setHasMore(morePages);
        } catch (err) {
            console.error('Failed to load user commentaries:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to load commentaries.';
            toast.error(errorMessage);
            setError(errorMessage);
            setHasMore(false);
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                setInitialLoading(false);
                setLoading(false);
            }, remainingTime);
        }
    }, [page, userPublicId, sortBy]);

    useEffect(() => {
        fetchCommentaries();
    }, [fetchCommentaries]);

    const handleSortChange = (newSortBy) => {
        if (newSortBy !== sortBy) {
            setSortBy(newSortBy);
            setPage(0);
            setCommentaries([]);
            setHasMore(true);
        }
    };

    // Function to handle comment deletion from the list
    const handleCommentDeleted = useCallback((deletedCommentId) => {
        setCommentaries(prevCommentaries =>
            prevCommentaries.filter(comment => comment.id !== deletedCommentId)
        );
        // Note: This doesn't update the total count displayed, only removes from the list.
        // If you need to update the total count, you might need a separate state or refetch.
    }, []);


    const overallLoading = initialLoading || loading;

    return (
        <div className="mt-6 rounded-md text-black font-sans overflow-visible">
            <div className="flex items-center gap-1 mb-4">
                <span className="text-sm text-gray-darker font-medium">Sort By:</span>
                <button
                    onClick={() => handleSortChange('newest')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${sortBy === 'newest' ? 'bg-accent-green text-white' : 'bg-gray-light text-gray-darker hover:bg-gray-medium'}`}
                    disabled={overallLoading}
                >
                    Newest
                </button>
                <button
                    onClick={() => handleSortChange('oldest')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${sortBy === 'oldest' ? 'bg-accent-green text-white' : 'bg-gray-light text-gray-darker hover:bg-gray-medium'}`}
                    disabled={overallLoading}
                >
                    Oldest
                </button>
            </div>
            <hr className="border-gray-300 my-1" />
            {overallLoading && commentaries.length === 0 ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                </div>
            ) : error ? (
                <div className="text-red-600 text-center py-10">
                    <p>{error}</p>
                </div>
            ) : commentaries.length === 0 ? (
                <p className="text-gray-medium text-center py-4 text-base">
                    No commentaries found for this user.
                </p>
            ) : (
                <ul className="overflow-visible">
                    {commentaries.map((commentary, idx) => (
                        <React.Fragment key={commentary.id}>
                            {idx !== 0 && <hr className="border-gray-300 my-1" />}
                            <UserCommentaryItem
                                commentary={commentary}
                                publicId={profileUser?.publicId}
                                displayName={profileUser?.displayName}
                                avatarUrl={profileUser?.avatarUrl}
                                ref={idx === commentaries.length - 1 ? lastCommentaryRef : null}
                                onCommentDeleted={handleCommentDeleted} // Pass the handler down
                            />
                        </React.Fragment>
                    ))}
                </ul>
            )}

            {loading && page > 0 && (
                <div className="flex justify-center py-6">
                    <Oval height={28} width={28} color="#6B7280" secondaryColor="#E5E7EB" strokeWidth={3} visible />
                </div>
            )}
        </div>
    );
};

export default UserCommentaries;