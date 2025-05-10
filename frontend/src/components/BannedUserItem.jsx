import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isFuture, isPast } from 'date-fns';
import { MoreHorizontal } from 'lucide-react'; // Import MoreHorizontal icon

// Helper function to get avatar color class (can be reused)
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

// Helper function to get initials (can be reused)
const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Use forwardRef to allow the parent component to attach a ref for infinite scrolling
const BannedUserItem = forwardRef(({ banData, onUnbanClick, onUpdateClick }, ref) => { // Added onUnbanClick and onUpdateClick props
    const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
    const dropdownRef = useRef(null); // Ref for the dropdown menu
    const dropdownButtonRef = useRef(null); // Ref for the dropdown button


    if (!banData || !banData.bannedUser || !banData.moderator) {
        // Handle cases where ban data or related user data is missing
        console.error("Invalid ban data:", banData);
        return null;
    }

    const { bannedUser, moderator, reason, bannedAt, unbanAt, isPermanentBan } = banData;

    // Determine ban status based on unbanAt and isPermanentBan
    const isCurrentlyBanned = isPermanentBan || (unbanAt && isFuture(new Date(unbanAt)));
    const banStatusText = isPermanentBan
        ? 'Permanent'
        : isCurrentlyBanned
            ? `Until ${format(new Date(unbanAt), 'MMM dd, yyyy HH:mm')}`
            : `Expired on ${format(new Date(unbanAt), 'MMM dd, yyyy HH:mm')}`;

    const bannedAtFormatted = format(new Date(bannedAt), 'MMM dd, yyyy HH:mm');

    // Effect to close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Toggle dropdown visibility
    const toggleDropdown = (e) => {
        e.preventDefault(); // Prevent default link behavior if wrapped in Link
        e.stopPropagation(); // Prevent click from bubbling up
        setShowDropdown(prev => !prev);
    };

    // Handle Update button click
    const handleUpdateClickInternal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDropdown(false);
        if (onUpdateClick) {
            onUpdateClick(banData); // Call the parent's update handler, passing the ban data
        }
    };

    // Handle Unban button click
    const handleUnbanClickInternal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDropdown(false);
        if (onUnbanClick) {
            onUnbanClick(banData.bannedUser.publicId); // Call the parent's unban handler, passing the banned user's public ID
        }
    };


    return (
        // Attach the ref to the root list item element
        <li ref={ref} className="p-4 hover:bg-gray-100 rounded-2xl flex items-start space-x-4 relative"> {/* Added relative for absolute positioning of dropdown */}
            {/* Banned User Avatar/Initials */}
            <Link to={`/users/${bannedUser.username}`} className="flex-shrink-0">
                {bannedUser.avatarUrl ? (
                    <img
                        src={bannedUser.avatarUrl}
                        alt={`${bannedUser.displayName}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold ${getAvatarColorClass(bannedUser.username)}`}>
                        {getInitials(bannedUser.displayName || bannedUser.username)}
                    </div>
                )}
            </Link>

            <div className="flex-grow flex flex-col">
                {/* Banned User Info */}
                <div className="flex items-center mb-2">
                    <Link to={`/users/${bannedUser.username}`} className="text-lg font-semibold text-black hover:underline mr-2">
                        {bannedUser.displayName || bannedUser.username}
                    </Link>
                    <span className="text-gray-600 text-sm">@{bannedUser.username}</span>
                </div>

                {/* Ban Details */}
                <div className="text-sm text-gray-800 mb-2">
                    <p><span className="font-medium">Status:</span> <span className={`${isCurrentlyBanned ? 'text-red-600' : 'text-green-600'}`}>{banStatusText}</span></p>
                    <p><span className="font-medium">Banned At:</span> {bannedAtFormatted}</p>
                    <p><span className="font-medium">Reason:</span> {reason}</p>
                </div>

                {/* Moderator Info */}
                <div className="text-xs text-gray-600">
                    Banned by{' '}
                    <Link to={`/users/${moderator.username}`} className="font-medium text-blue-600 hover:underline">
                        {moderator.displayName || moderator.username}
                    </Link>
                    {' '}@{moderator.username}
                </div>
            </div>

            {/* Three-dots menu */}
            <div className="absolute top-2 right-2">
                <button
                    ref={dropdownButtonRef}
                    className="text-gray-600 hover:bg-gray-200 hover:text-black p-1 rounded-full transition-colors"
                    onClick={toggleDropdown}
                    aria-label="Ban options"
                >
                    <MoreHorizontal size={20} />
                </button>
                {showDropdown && (
                    <div
                        ref={dropdownRef}
                        className="absolute top-full mt-2 right-0 w-40 bg-white rounded-md shadow-lg border border-border overflow-hidden z-10"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dropdown
                    >
                        {/* Update button */}
                        <button
                            onClick={handleUpdateClickInternal}
                            className="block w-full text-left px-4 py-2 text-gray-darker hover:bg-gray-lighter"
                        >
                            Update
                        </button>
                        {/* Unban button */}
                        <button
                            onClick={handleUnbanClickInternal}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                        >
                            Unban
                        </button>
                    </div>
                )}
            </div>
        </li>
    );
});

export default BannedUserItem;