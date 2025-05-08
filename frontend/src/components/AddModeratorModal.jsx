import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Oval } from 'react-loader-spinner';

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


const AddModeratorModal = ({ categoryId, onClose, onModeratorAdded }) => {
    const [username, setUsername] = useState("");
    const [userFound, setUserFound] = useState(null);
    const [searching, setSearching] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false);

    const modalRef = useRef(null);

    const handleSearch = async () => {
        if (!username.trim()) return;
        setSearching(true);
        setUserNotFound(false);
        setUserFound(null);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/users/username/${username.trim()}`);
            setUserFound(res.data);
        } catch (err) {
            console.error('User search failed:', err);
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setUserNotFound(true);
            } else {
                toast.error("An error occurred while searching for the user.");
            }
            setUserFound(null);
        } finally {
            setSearching(false);
        }
    };

    const handleAddModerator = async () => {
        const token = Cookies.get("token");
        if (!userFound || !categoryId) {
            toast.error("Cannot add moderator: User not found or category ID missing.");
            return;
        }

        try {
            await axios.post(
                `http://localhost:8080/api/v1/categories/${categoryId}/moderators`,
                { publicId: userFound.publicId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Added ${userFound.username} as moderator!`);
            if (onModeratorAdded) {
                onModeratorAdded();
            }
            onClose();

        } catch (err) {
            console.error('Add moderator failed:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || "Failed to add moderator.";
            toast.error(errorMessage);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !searching) {
            handleSearch();
        }
    };

    useEffect(() => {
        const handleClose = (e) => {
            if (e.key === "Escape") {
                onClose();
            } else if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClose);
        document.addEventListener("keydown", handleClose);

        return () => {
            document.removeEventListener("mousedown", handleClose);
            document.removeEventListener("keydown", handleClose);
        };
    }, [onClose]);


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-hidden"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">Add Moderator</h2>

                <div className="flex mb-4">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter username"
                        className="flex-grow border p-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searching || !username.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {searching ? (
                            <Oval height={20} width={20} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />
                        ) : "Search"}
                    </button>
                </div>

                {userNotFound && !searching && (
                    <div className="text-center text-red-500 mb-4">
                        <h3 className="text-base font-semibold">User Not Found</h3>
                        <p className="text-sm text-gray-600">The user you're looking for doesn't exist.</p>
                    </div>
                )}

                {userFound && (
                    <div className="flex items-center gap-4 mb-4 p-3 bg-gray-100 rounded-md">
                        {/* Avatar Rendering Logic using helpers */}
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            {userFound.avatarUrl ? (
                                <img
                                    src={userFound.avatarUrl}
                                    alt={userFound.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className={`w-full h-full flex items-center justify-center text-white text-base font-bold ${getAvatarColorClass(userFound.username)}`}
                                >
                                    <span>{getInitials(userFound.displayName || userFound.username)}</span>
                                </div>
                            )}
                        </div>
                        {/* End of Avatar Rendering Logic */}

                        <span className="text-base font-medium text-gray-800">{userFound.username}</span>
                    </div>
                )}

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddModerator}
                        disabled={!userFound}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddModeratorModal;