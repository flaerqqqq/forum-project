import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import AvatarUpload from '../components/AvatarUpload';
import {getUsernameFromToken} from "../utils/Auth.js";
import UserNotFound from "../components/UserNotFound.jsx";

const UserProfile = () => {
    const { username: profileUsername } = useParams();  // Get the username from the URL
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
                    setError("not_found")
                } else {
                    setError("unexpected")
                }
            }
        };
        fetchUser();
    }, [profileUsername]);

    if (error === "not_found") return <UserNotFound />
    if (error) return <div>{error}</div>;
    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h2>{user.displayName}</h2>
            <img
                src={user.avatarUrl || '/default-avatar.png'}
                alt="avatar"
                width="120"
                style={{ borderRadius: '50%' }}
            />
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Description: {user.description}</p>

            {/* Show the AvatarUpload component only if the authenticated user is viewing their own profile */}
            {authenticatedUser && authenticatedUser === profileUsername && (
                <AvatarUpload username={profileUsername} />
            )}
        </div>
    );
};

export default UserProfile;