import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import UserNotFound from '../components/UserNotFound';
import UserReactions from '../components/UserReactions';
import defaultAvatar from '../assets/images/default-avatar.png';

const UserProfile = () => {
    const { username: profileUsername } = useParams();
    const [profileUser, setProfileUser] = useState(null);
    const [error, setError] = useState(null);
    const { user: authenticatedUser, loading: authLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileUser = async () => {
            if (authLoading) return;

            setIsLoading(true);
            if (authenticatedUser && profileUsername === authenticatedUser.username) {
                setProfileUser(authenticatedUser);
                setIsLoading(false);
                return;
            }

            try {
                const res = await axios.get(`http://localhost:8080/api/v1/users/${profileUsername}`);
                setProfileUser(res.data);
                setError(null);
            } catch (err) {
                if (err.response?.status === 404) {
                    setError("not_found");
                } else {
                    setError("unexpected");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileUser();
    }, [profileUsername, authenticatedUser, authLoading]);

    if (authLoading || isLoading) return <div>Loading...</div>;
    if (error === "not_found") return <UserNotFound />;
    if (error) return <div>{error}</div>;
    if (!profileUser) return <div>Loading...</div>;

    const isOwnProfile = authenticatedUser?.username === profileUsername;

    return (
        <div className="w-screen bg-gray-100 min-h-screen">
            <div className="bg-black h-32 w-full" />

            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow -mt-16 p-6 relative text-center">
                    <img
                        src={profileUser.avatarUrl || defaultAvatar}
                        alt="avatar"
                        className="w-28 h-28 rounded-full border-4 border-white mx-auto"
                    />
                    <h2 className="text-2xl font-bold text-gray-700 mt-2 m-4">
                        {profileUser.displayName}
                    </h2>
                    <p className="text-gray-600">
                        {profileUser.description || "404 bio not found"}
                    </p>
                    <p className="text-sm text-gray-500 mt-6">
                        🎂 Joined on {new Date(profileUser.registrationDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </p>

                    {profileUser.publicId && (
                        <div className="mt-4">
                            <UserReactions
                                targetPublicId={profileUser.publicId}
                                readOnly={isOwnProfile}
                            />
                        </div>
                    )}

                    {isOwnProfile && (
                        <div className="absolute top-6 right-6">
                            <Link 
                                to="/settings" 
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Edit profile
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-white rounded-lg shadow p-4 flex justify-around text-gray-700 text-sm">
                    <div className="flex items-center space-x-2">
                        <span>📰</span>
                        <span>Posts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>💬</span>
                        <span>Comments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>#️⃣</span>
                        <span>Followed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>💾</span>
                        <span>Saved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>❤️</span>
                        <span>Liked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>👎</span>
                        <span>Disliked</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;