import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns'; // Assuming you have date-fns installed
import { Link } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';

// --- Helper Functions (Copying from Commentary, ideally these are shared) ---
// You might want to put these into a separate utility file (e.g., src/utils/avatarUtils.js)
// and import them if you use them in multiple places.
const getAvatarColorClass = (username) => {
    if (!username) return 'bg-gray-medium';
    const firstLetter = username.charAt(0).toUpperCase();
    const asciiCode = firstLetter.charCodeAt(0);
    const colorIndex = asciiCode % 10;

    const avatarColors = [
        'bg-accent-green', // Example custom color (adjust or replace with standard classes)
        'bg-gray-darker',    // Example custom color (adjust or replace with standard classes)
        'bg-indigo-600',
        'bg-blue-600',
        'bg-purple-600',
        'bg-pink-600',
        'bg-teal-600',
        'bg-orange-600',
        'bg-red-600',
        'bg-gray-medium',    // Example custom color (adjust or replace with standard classes)
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
// --- End Helper Functions ---


// Accept onMouseEnter and onMouseLeave handlers from the parent to manage hover state across trigger and card
const UserHoverCard = ({ username, onMouseEnter, onMouseLeave }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/users/username/${username}`);
                setUserData(res.data);
            } catch (err) {
                console.error(`Error fetching user data for ${username}:`, err);
                setError("Failed to load user data.");
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchUserData();
        } else {
            setLoading(false);
            setUserData(null);
        }

    }, [username]);


    if (loading) {
        // Position and style the loading state consistent with the card
        return (
            <div
                className="absolute top-full mt-2 left-0 z-20 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-64 max-w-xs flex justify-center items-center overflow-hidden" // Added overflow-hidden
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <Oval height={20} width={20} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} />
            </div>
        );
    }

    if (error || !userData) {
        // Position and style the error state consistent with the card
        return (
            <div
                className="absolute top-full mt-2 left-0 z-20 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-64 max-w-xs text-red-600 overflow-hidden" // Added overflow-hidden
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {error || "Could not load user data."}
            </div>
        );
    }

    // Format registration date using date-fns
    const formattedRegistrationDate = userData.registrationDate
        ? format(new Date(userData.registrationDate), 'MMM d, yyyy') // Formats like "May 8, 2025"
        : 'N/A';

    return (
        // Main container with absolute positioning, border, shadow, background, and rounded corners
        // top-full mt-2 positions it just below the triggering element
        // left-0 aligns its left edge with the triggering element
        // z-20 ensures it appears above other content
        // overflow-hidden is important for rounded corners with the header
        <div
            className="absolute top-full mt-2 left-0 z-20 bg-white border border-gray-300 rounded-md shadow-lg w-64 max-w-xs text-gray-800 text-sm overflow-hidden"
            onMouseEnter={onMouseEnter} // Keep card visible when mouse is over it
            onMouseLeave={onMouseLeave} // Trigger parent's hide logic when mouse leaves the card
        >
            {/* Header Area (Placeholder for banner background or color) */}
            {/* Replace bg-blue-500 with a dynamic background based on user data if available */}
            <div className="h-12 bg-blue-500 w-full"></div>

            {/* Avatar and Username/Display Name container */}
            {/* Use negative margin-top to position the avatar overlapping the header */}
            <div className="flex items-center px-4 -mt-6">
                {/* Avatar container */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-white flex-shrink-0">
                    {/* Avatar Rendering Logic using helpers */}
                    {userData.avatarUrl ? (
                        <img
                            src={userData.avatarUrl}
                            alt={userData.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className={`w-full h-full flex items-center justify-center text-white text-2xl font-bold ${getAvatarColorClass(userData.username)}`} // text-2xl for 16x16 avatar
                        >
                            <span>{getInitials(userData.displayName || userData.username)}</span> {/* Use display name or username for initials */}
                        </div>
                    )}
                </div>
                {/* Username/Display Name */}
                <div className="ml-3 mt-8"> {/* Adjusted margin-top to align name with avatar */}
                    {/* Link to user's profile page */}
                    <Link to={`/users/${userData.username}`} className="block font-semibold text-gray-900 hover:underline text-base">
                        {userData.displayName || userData.username} {/* Display display name or username */}
                    </Link>
                    {userData.displayName && ( // Show username below display name if a display name exists
                        <span className="block text-gray-600 text-xs">@{userData.username}</span>
                    )}
                </div>
            </div>

            {/* Description (if available) - Add horizontal padding */}
            {userData.description && (
                <p className="px-4 mt-3 text-gray-700 italic">{userData.description}</p>
            )}


            {/* Stats based on the provided fields - Add padding and adjust layout */}
            <div className="px-4 mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-600 border-t pt-3 border-gray-200">
                {/* Display Posts count */}
                <div>
                    <span className="font-bold text-gray-800">Posts:</span> {userData.postsCount ?? 0}
                </div>
                {/* Display Likes received */}
                <div>
                    <span className="font-bold text-gray-800">Likes:</span> {userData.receivedLikesCount ?? 0}
                </div>
                {/* Display Dislikes received if available */}
                {userData.receivedDislikesCount !== undefined && userData.receivedDislikesCount !== null && ( // Check if field exists and is not null
                    <div>
                        <span className="font-bold text-gray-800">Dislikes:</span> {userData.receivedDislikesCount ?? 0}
                    </div>
                )}
                {/* If your backend provides a combined 'karma' field, you might prefer to show that */}
                {/* {userData.karma !== undefined && userData.karma !== null && (
                     <div className="col-span-2 text-sm">
                         <span className="font-bold text-gray-800">Karma:</span> {userData.karma ?? 0}
                     </div>
                  )} */}

                {/* Registration Date */}
                <div>
                    <span className="font-bold text-gray-800">Joined:</span> {formattedRegistrationDate}
                </div>
            </div>

            {/* Link to full profile styled as a button */}
            <div className="mt-4 px-4 pb-3">
                <Link to={`/users/${userData.username}`} className="block w-full text-center py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm font-semibold">
                    View Profile
                </Link>
            </div>
        </div>
    );
};

export default UserHoverCard;