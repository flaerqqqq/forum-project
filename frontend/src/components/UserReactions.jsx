import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const UserReactions = ({ targetPublicId, readOnly = false }) => {
    const [reaction, setReaction] = useState(null);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [error, setError] = useState(null);
    const { user: authenticatedUser } = useUser();

    const headers = authenticatedUser ? {
        Authorization: `Bearer ${authenticatedUser.token}`
    } : {};

    if (error) {
        throw error;
    }

    const fetchInitialReaction = async () => {
        try {
            const userRes = await axios.get(`http://localhost:8080/api/v1/users/${targetPublicId}`, {
                headers
            });
            setLikes(userRes.data.receivedLikesCount);
            setDislikes(userRes.data.receivedDislikesCount);

            if (authenticatedUser && !readOnly) {
                const res = await axios.get(
                    `http://localhost:8080/api/v1/users/${targetPublicId}/reactions`,
                    { headers }
                );
                setReaction(res.data.type);
            }
        } catch (err) {
            if (err.response && err.response.status !== 404) {
                setError(new Error(err.response?.data?.body.detail.split(':')[1] || 'Failed to fetch reactions'));
            }
        }
    };

    const sendReaction = async (type) => {
        if (!authenticatedUser) return;

        try {
            const res = await axios.post(
                `http://localhost:8080/api/v1/users/${targetPublicId}/reactions`,
                { type },
                { headers }
            );
            setReaction(res.data.type);
            setLikes(res.data.likesCount);
            setDislikes(res.data.dislikesCount);
        } catch (err) {
            setError(new Error(err.response?.data?.body.detail.split(':')[1] || 'Failed to send reaction'));
        }
    };

    useEffect(() => {
        if (targetPublicId) {
            fetchInitialReaction();
        }
    }, [targetPublicId, authenticatedUser]);

    return (
        <div className="flex items-center justify-center gap-4 ">
            {readOnly ? (
                <>
                    <button
                        onClick={() => sendReaction('LIKE')}
                        className={`flex items-center space-x-1 px-3 py-1 border rounded-full text-sm transition-colors ${reaction === 'LIKE' ? 'border-accent-green text-accent-green' : 'border-gray-medium text-gray-darker hover:border-black hover:text-black'}`}
                        disabled={authenticatedUser.publicId === targetPublicId}
                    >
                        <span>👍</span>
                        <span>{likes}</span>
                    </button>
                    <button
                        onClick={() => sendReaction('DISLIKE')}
                        className={`flex items-center space-x-1 px-3 py-1 border rounded-full text-sm transition-colors ${reaction === 'DISLIKE' ? 'border-red-600 text-red-600' : 'border-gray-medium text-gray-darker hover:border-black hover:text-black'}`}
                        disabled={authenticatedUser.publicId === targetPublicId}
                    >
                        <span>👎</span>
                        <span>{dislikes}</span>
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => sendReaction('LIKE')}
                        className={`flex items-center space-x-1 px-3 py-1 border rounded-full text-sm transition-colors ${reaction === 'LIKE' ? 'border-accent-green text-accent-green' : 'border-gray-medium text-gray-darker hover:border-black hover:text-black'}`}
                        disabled={!authenticatedUser}
                    >
                        <span>👍</span>
                        <span>{likes}</span>
                    </button>
                    <button
                        onClick={() => sendReaction('DISLIKE')}
                        className={`flex items-center space-x-1 px-3 py-1 border rounded-full text-sm transition-colors ${reaction === 'DISLIKE' ? 'border-red-600 text-red-600' : 'border-gray-medium text-gray-darker hover:border-black hover:text-black'}`}
                        disabled={!authenticatedUser}
                    >
                        <span>👎</span>
                        <span>{dislikes}</span>
                    </button>
                </>
            )}
        </div>
    );
};

export default UserReactions;