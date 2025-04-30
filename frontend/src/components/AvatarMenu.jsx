import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useUser } from '../contexts/UserContext';
import defaultAvatar from '../assets/images/default-avatar.png';
import { isModerator } from "../utils/Auth.js";

const AvatarMenu = () => {
    const [open, setOpen] = useState(false);
    const [logoutTriggered, setLogoutTriggered] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useUser();

    const toggleDropdown = () => setOpen(prev => !prev);

    const handleLogout = () => {
        setLogoutTriggered(true);
        Cookies.remove("token");
        navigate("/login");
        window.location.reload();
    };

    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [location]);


    const getAvatarColorClass = (username) => {
        if (!username) return 'bg-gray-medium';
        const firstLetter = username.charAt(0).toUpperCase();
        const asciiCode = firstLetter.charCodeAt(0);
        const colorIndex = asciiCode % 10;

        const avatarColors = [
            'bg-accent-green',
            'bg-gray-darker',
            'bg-indigo-600',
            'bg-blue-600',
            'bg-purple-600',
            'bg-pink-600',
            'bg-teal-600',
            'bg-orange-600',
            'bg-red-600',
            'bg-gray-medium',
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


    if (loading || !user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {user.avatarUrl ? (
                <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className={`w-8 h-8 rounded-full cursor-pointer transition object-cover
                    ${open ? 'ring-1 ring-border' : 'hover:ring-1 hover:ring-gray-darker'}`}
                    onClick={toggleDropdown}
                />
            ) : (
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-base font-bold cursor-pointer transition overflow-hidden
                    ${getAvatarColorClass(user.username)}
                    ${open ? 'ring-1 ring-border' : 'hover:ring-1 hover:ring-gray-darker'}`}
                    onClick={toggleDropdown}
                >
                    <span>{getInitials(user.displayName || user.username)}</span>
                </div>
            )}

            {!logoutTriggered && (
                <div
                    className={`absolute right-0 mt-2 w-64 bg-white border border-border rounded-md shadow-md z-50 text-sm transform transition-all duration-200 ease-out origin-top-right
                    ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                    <div className="p-4 border-b border-border">
                        <div className="font-semibold text-black flex items-center gap-2">
                            {user.displayName || user.username}
                            {isModerator() ? (
                                <span className="text-xs bg-purple-100 text-gray-darker font-semibold px-1 py-0.5 rounded">
                                    MOD
                                </span>
                            ) : (
                                <span className="text-xs bg-green-100 text-gray-darker font-semibold px-1 py-0.5 rounded">
                                    USER
                                </span>
                            )}
                        </div>
                        <div className="text-gray-darker">@{user.username}</div>
                    </div>
                    <button
                        onClick={() => {
                            setOpen(false);
                            navigate(`/users/${user.username}`);
                        }}
                        className={`block w-full text-left px-4 py-2 font-medium text-gray-darker hover:bg-gray-lighter transition-colors ${location.pathname === `/users/${user.username}` ? 'text-black' : ''}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => {
                            setOpen(false);
                            navigate("/settings");
                        }}
                        className={`block w-full text-left px-4 py-2 font-medium text-gray-darker hover:bg-gray-lighter transition-colors ${location.pathname === '/settings' ? 'text-black' : ''}`}
                    >
                        Settings
                    </button>
                    {isModerator() && (
                        <button
                            className={`block w-full text-left px-4 py-2 font-medium text-gray-darker hover:bg-gray-lighter transition-colors ${location.pathname === '/moderator' ? 'text-black' : ''}`}
                            onClick={() => {
                                setOpen(false);
                                navigate("/moderator");
                            }}
                        >
                            Moderator Panel
                        </button>
                    )}
                    <hr className="my-1 border-border" />
                    <button
                        className="block w-full text-left px-4 py-2 font-medium text-gray-darker hover:bg-gray-lighter transition-colors"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default AvatarMenu;