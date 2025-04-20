import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const UserReactions = ({ targetPublicId, readOnly = false }) => {
    const [reaction, setReaction] = useState(null);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const { user: authenticatedUser } = useUser();

    const headers = authenticatedUser ? {
        Authorization: `Bearer ${authenticatedUser.token}`
    } : {};

    const fetchInitialReaction = async () => {
        try {
            const userRes = await axios.get(`http://localhost:8080/api/v1/users/${targetPublicId}`);
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
                console.error("An error occurred:", err);
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
            console.error("Failed to send reaction", err);
        }
    };

    useEffect(() => {
        if (targetPublicId) {
            fetchInitialReaction();
        }
    }, [targetPublicId, authenticatedUser]);

    return (
        <div className="flex items-center justify-center gap-4 mt-6">
            {readOnly ? (
                <>
                    <div className="px-4 py-2 rounded-full bg-gray-300 text-black">
                        👍 {likes}
                    </div>
                    <div className="px-4 py-2 rounded-full bg-gray-300 text-black">
                        👎 {dislikes}
                    </div>
                </>
            ) : (
                <>
                    <button
                        onClick={() => sendReaction('LIKE')}
                        className={`px-4 py-2 rounded-full text-white ${reaction === 'LIKE' ? 'bg-green-600' : 'bg-gray-400'}`}
                        disabled={!authenticatedUser}
                    >
                        👍 {likes}
                    </button>
                    <button
                        onClick={() => sendReaction('DISLIKE')}
                        className={`px-4 py-2 rounded-full text-white ${reaction === 'DISLIKE' ? 'bg-red-600' : 'bg-gray-400'}`}
                        disabled={!authenticatedUser}
                    >
                        👎 {dislikes}
                    </button>
                </>
            )}
        </div>
    );
};

export default UserReactions;