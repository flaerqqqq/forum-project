import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // For toasts
import { useUser } from "../contexts/UserContext"; // User context to access authenticated user

const ManageCategoryModeratorsModal = ({ categoryId, onClose }) => {
    const { user } = useUser(); // Get the authenticated user
    const [moderators, setModerators] = useState([]); // List of current moderators
    const [searchQuery, setSearchQuery] = useState(""); // Search query for username
    const [searchResults, setSearchResults] = useState([]); // Search results from API
    const [loading, setLoading] = useState(false); // Loading state for API calls
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        // Fetch the current list of moderators for the category
        const fetchModerators = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/v1/categories/${categoryId}/moderators`
                );
                setModerators(response.data);
            } catch (err) {
                setError("Failed to load moderators");
                toast.error("Failed to load moderators");
            } finally {
                setLoading(false);
            }
        };

        fetchModerators();
    }, [categoryId]);

    // Function to handle search for users by username
    const handleSearch = async () => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8080/api/v1/users/search?username=${searchQuery}`
            );
            setSearchResults(response.data);
        } catch (err) {
            setError("Failed to search users");
            toast.error("Failed to search users");
        } finally {
            setLoading(false);
        }
    };

    // Function to add a new moderator
    const handleAddModerator = async (userId) => {
        setLoading(true);
        try {
            await axios.post(
                `http://localhost:8080/api/v1/categories/${categoryId}/moderators`,
                { userId }
            );
            toast.success("Moderator added successfully");
            // Refresh the list of moderators
            setModerators([...moderators, { userId }]);
        } catch (err) {
            setError("Failed to add moderator");
            toast.error("Failed to add moderator");
        } finally {
            setLoading(false);
        }
    };

    // Function to remove a moderator
    const handleRemoveModerator = async (userId) => {
        setLoading(true);
        try {
            await axios.delete(
                `http://localhost:8080/api/v1/categories/${categoryId}/moderators/${userId}`
            );
            toast.success("Moderator removed successfully");
            // Refresh the list of moderators
            setModerators(moderators.filter((mod) => mod.userId !== userId));
        } catch (err) {
            setError("Failed to remove moderator");
            toast.error("Failed to remove moderator");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-2xl font-semibold mb-4">Manage Moderators</h2>

                {/* List of current moderators */}
                <div className="mb-4">
                    <h3 className="text-xl font-medium">Current Moderators</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <ul>
                            {moderators.map((mod) => (
                                <li key={mod.userId} className="flex justify-between items-center mb-2">
                                    <span>{mod.username}</span>
                                    <button
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => handleRemoveModerator(mod.userId)}
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Search for users to add as moderators */}
                <div className="mb-4">
                    <h3 className="text-xl font-medium">Search Users</h3>
                    <input
                        type="text"
                        placeholder="Search by username"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyUp={handleSearch}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {loading && <p>Searching...</p>}
                    {searchResults.length > 0 && (
                        <ul>
                            {searchResults.map((user) => (
                                <li key={user.id} className="flex justify-between items-center mb-2">
                                    <span>{user.username}</span>
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => handleAddModerator(user.id)}
                                    >
                                        Add as Moderator
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Close button */}
                <div className="flex justify-end mt-4">
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageCategoryModeratorsModal;