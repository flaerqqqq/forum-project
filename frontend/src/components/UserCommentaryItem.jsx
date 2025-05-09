import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import UserHoverCard from './UserHoverCard';

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

const UserCommentaryItem = forwardRef(({ commentary, profileUser }, ref) => {
    const [showHoverCard, setShowHoverCard] = useState(false);
    const hoverTimeoutRef = useRef(null);
    const showDelay = 500;
    const hideDelay = 300;

    if (!commentary) return null;

    const handleMouseEnter = () => {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHoverCard(true);
        }, showDelay);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHoverCard(false);
        }, hideDelay);
    };

    useEffect(() => {
        return () => {
            clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const displayName = profileUser.displayName || profileUser.username || 'User';
    const avatarClass = getAvatarColorClass(displayName);
    const initials = getInitials(displayName);

    return (
        <li
            ref={ref}
            className="transition rounded-2xl p-4 hover:bg-gray-100 overflow-visible relative"
        >
            <div className="flex items-start space-x-3">
                {profileUser.avatarUrl ? (
                    <img
                        src={profileUser.avatarUrl}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                ) : (
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0 ${avatarClass}`}
                    >
                        <span>{initials}</span>
                    </div>
                )}

                <div className="flex-grow">
                    {/* Meta info row */}
                    <div className="text-xs text-gray-600 mb-1 flex items-center flex-wrap gap-x-1">
                        {commentary.username && (
                            <a
                                href={`/users/${commentary.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-gray-800 hover:underline"
                            >
                                {displayName}
                            </a>
                        )}
                        {commentary.username && <span>•</span>}
                        <span>{formatDistanceToNow(new Date(commentary.createdAt), { addSuffix: true })}</span>

                        {commentary.parentCommentUsername && (
                            <>
                                <span>•</span>
                                <span className="relative">
                                    In reply to{' '}
                                    <a
                                        href={`/users/${commentary.parentCommentUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold hover:underline"
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {commentary.parentCommentDisplayName || commentary.parentCommentUsername}
                                    </a>
                                    {showHoverCard && (
                                        <div
                                            className="absolute z-50"
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <UserHoverCard username={commentary.parentCommentUsername} />
                                        </div>
                                    )}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Post and Category Info */}
                    <div className="text-xs text-gray-500 mb-2 flex flex-wrap items-center gap-2">
                        {commentary.categorySlug && (
                            <a
                                href={`/categories/${commentary.categorySlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:underline"
                            >
                                {commentary.categoryIconUrl && (
                                    <img
                                        src={commentary.categoryIconUrl}
                                        alt={commentary.categoryName}
                                        className="w-4 h-4 rounded-full"
                                    />
                                )}
                                <span>{commentary.categoryName}</span>
                            </a>
                        )}
                        {commentary.postId && commentary.postTitle && (
                            <>
                                <span>•</span>
                                <a
                                    href={`/categories/${commentary.categorySlug}/posts/${commentary.postId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline text-gray-700 font-medium"
                                >
                                    {commentary.postTitle}
                                </a>
                            </>
                        )}
                    </div>

                    {/* Comment content */}
                    <div
                        className="text-md text-gray-800 prose max-w-full"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(commentary.content) }}
                    />
                </div>
            </div>
        </li>
    );
});

export default UserCommentaryItem;