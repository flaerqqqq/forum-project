import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AvatarMenu = () => {
    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get("token");
        const username = token ? jwtDecode(token).sub : null;

        if (username) {
            const fetchAvatarUrl = async () => {
                try {
                    const res = await axios.get(`http://localhost:8080/api/v1/users/${username}`);
                    setUser(res.data); // Set user data in context
                } catch (err) {
                    setError("Failed to load user data.");
                }
            };
            fetchAvatarUrl();
        }
    }, [Cookies.get("token")]); // 👈 token is now watched reactively


    const toggleDropdown = () => {
        setOpen((prev) => !prev);
    };

    const handleLogout = () => {
        Cookies.remove("token");
        navigate("/login");
        window.navigation.reload();
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

    // Close the dropdown when navigating
    useEffect(() => {
        setOpen(false); // Close dropdown on navigation
    }, [navigate]);

    if (!user) return null; // Prevent rendering if user data is not available

    return (
        <div className="relative" ref={dropdownRef}>
            <img
                src={user.avatarUrl || '/path/to/default/avatar.png'} // Use a default avatar if none is set
                alt="avatar"
                className={`w-9 h-9 rounded-full cursor-pointer ring-4 transition ${open ? 'ring-gray-200' : 'ring-transparent hover:ring-gray-200'}`}
                onClick={toggleDropdown}
            />

            <div
                className={`absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-sm transform transition-all duration-200 ease-out
                ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
                <div className="p-4 px-6 border-b border-gray-200">
                    <div className="font-semibold text-gray-900">{user.displayName || user.username}</div>
                    <div className="text-gray-500">@{user.username}</div>
                </div>
                <div className="flex justify-center py-1">
                    <button
                        className="w-[95%] text-left px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-blue-200 hover:outline-none hover:underline transition"
                        onClick={() => {
                            setOpen(false); // Close the dropdown on navigation
                            navigate(`/users/${user.username}`);
                        }}
                    >
                        Profile
                    </button>
                </div>
                <div className="flex justify-center">
                    <button
                        className="w-[95%] text-left px-4 rounded-md bg-white text-gray-700 hover:bg-blue-200 hover:outline-none hover:underline transition"
                        onClick={() => {
                            setOpen(false);
                            navigate("/settings");
                        }}
                    >
                        Settings
                    </button>
                </div>
                <hr className="my-1" />
                <div className="flex justify-center p-0.5 pb-1">
                    <button
                        className="w-[95%] text-left px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-blue-200 outline-none hover:underline transition"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarMenu;