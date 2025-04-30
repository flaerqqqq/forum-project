import React, { useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import defaultAvatar from "../assets/images/default-avatar.png";

const AddModeratorModal = ({ categoryId, onClose, onModeratorAdded }) => {
    const [username, setUsername] = useState("");
    const [userFound, setUserFound] = useState(null);
    const [searching, setSearching] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false); // Added state for user not found

    const modalRef = useRef(null); // Reference to the modal container

    const handleSearch = async () => {
        if (!username.trim()) return;
        setSearching(true);
        setUserNotFound(false); // Reset the error state on a new search

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/users/username/${username.trim()}`);
            setUserFound(res.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                // User not found, set the error state
                setUserNotFound(true);
                setUserFound(null); // Ensure no user data is displayed
            } else {
                toast.error("An error occurred while searching for the user.");
                setUserFound(null);
            }
        } finally {
            setSearching(false);
        }
    };

    const handleAddModerator = async () => {
        const token = Cookies.get("token");
        if (!userFound) return;

        try {
            await axios.post(
                `http://localhost:8080/api/v1/categories/${categoryId}/moderators`,
                { publicId: userFound.publicId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Added ${userFound.username} as moderator!`);
            onModeratorAdded();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.body?.detail || "Failed to add moderator.");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch(); // Trigger search on Enter key press
        }
    };

    // Close modal if clicked outside
    const handleCloseOnClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose(); // Close the modal
        }
    };

    // Attach click event listener to detect outside clicks
    React.useEffect(() => {
        document.addEventListener("mousedown", handleCloseOnClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleCloseOnClickOutside);
        };
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
                ref={modalRef}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md transition-transform transform scale-95 hover:scale-100"
            >
                {/* Exit button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-4 text-gray-700">Add Moderator</h2>

                {/* Search input container */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress} // Handle Enter key press
                        placeholder="Enter username"
                        className="w-full border p-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* Search button inside the input container */}
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="absolute right-0 top-0 bottom-0 bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 disabled:opacity-50 transition duration-300"
                    >
                        {searching ? "Searching..." : "Search"}
                    </button>
                </div>

                {/* Display 'User Not Found' message if userNotFound is true */}
                {userNotFound && !searching && (
                    <div className="text-center text-red-500 mb-4">
                        <h3 className="text-lg font-semibold">User Not Found</h3>
                        <p>The user you're looking for doesn't exist.</p>
                    </div>
                )}

                {/* If user is found, display their details */}
                {userFound && (
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={userFound.avatarUrl || defaultAvatar}
                            alt={userFound.username}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <span className="text-lg font-medium text-gray-800">{userFound.username}</span>
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md hover:bg-gray-100 text-gray-700 transition duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddModerator}
                        disabled={!userFound}
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition duration-300"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddModeratorModal;