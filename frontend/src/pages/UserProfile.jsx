import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getUsernameFromToken } from '../utils/Auth.js';
import UserNotFound from '../components/UserNotFound.jsx';
import defaultAvatar from '../assets/images/default-avatar.png'

const UserProfile = () => {
    const { username: profileUsername } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [authenticatedUser, setAuthenticatedUser] = useState(null);

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            const username = getUsernameFromToken(token);
            setAuthenticatedUser(username);
        }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/users/${profileUsername}`);
                setUser(res.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    setError("not_found");
                } else {
                    setError("unexpected");
                }
            }
        };
        fetchUser();
    }, [profileUsername]);

    if (error === "not_found") return <UserNotFound />;
    if (error) return <div>{error}</div>;
    if (!user) return <div>Loading...</div>;

    return (
        <div className="w-screen bg-gray-100 min-h-screen">
            <div className="bg-black h-32 w-full" />

            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow -mt-16 p-6 relative text-center  ">
                    <img
                        src={user.avatarUrl || defaultAvatar}
                        alt="avatar"
                        className="w-28 h-28 rounded-full border-4 border-white mx-auto "
                    />
                    <h2 className="text-2xl font-bold text-gray-700 mt-2 m-4">{user.displayName}</h2>
                    <p className="text-gray-600">{user.description || "404 bio not found"}</p>
                    <p className="text-sm text-gray-500 mt-6">
                        🎂 Joined on {new Date(user.registrationDate).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                    })}
                    </p>

                    {authenticatedUser === profileUsername && (
                        <div className="absolute top-6 right-6">
                            <Link to="/settings" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
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
                        <span>💾</span> {/* Using the floppy disk emoji for "Saved" */}
                        <span>Saved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>❤️</span> {/* Using the heart emoji for "Liked" */}
                        <span>Liked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>👎</span> {/* Using the thumbs down emoji for "Disliked" */}
                        <span>Disliked</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;