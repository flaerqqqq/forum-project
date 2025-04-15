// components/AvatarMenu.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode} from "jwt-decode";
import axios from "axios";

const AvatarMenu =  () => {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState(null)

    const token = Cookies.get("token");
    const username = token ? jwtDecode(token).sub : null;

    useEffect( () => {
    const fetchAvatarUrl = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/users/${username}`);
            setUser(res.data)
        } catch (err) {
            setError(err);
        }


    }
    fetchAvatarUrl();
    })
    const toggleDropdown = () => {
        setOpen((prev) => !prev);
    };

    const handleLogout = () => {
        Cookies.remove("token");
        navigate("/login");
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

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <img
                src={user.avatarUrl}
                alt="avatar"
                width="40"
                style={{ borderRadius: '50%' }}
                onClick={toggleDropdown}
            />

            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-10">
                    <button
                        className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                        onClick={() => navigate(`/users/${user.username}`)}
                    >
                        My Profile
                    </button>
                    <button
                        className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
};

export default AvatarMenu;