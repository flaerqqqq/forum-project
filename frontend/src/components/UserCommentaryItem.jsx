import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import UserHoverCard from './UserHoverCard';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useModeratedCategories } from '../contexts/ModeratedCategoriesContext';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReportContentModal from './ReportContentModal.jsx';


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

const createSafeHTML = (htmlContent) => {
    const contentString = String(htmlContent || '');
    return {
        __html: DOMPurify.sanitize(contentString)
    };
};

const UserCommentaryItem = forwardRef(({ commentary, onCommentDeleted, profileUser }, ref) => {
    const navigate = useNavigate();
    const { user: authenticatedUser, loading: authLoading } = useUser();
    const { moderatedCategorySlugs, loadingModeratedCategories } = useModeratedCategories();

    const [showHoverCard, setShowHoverCard] = useState(false);
    const hoverTimeoutRef = useRef(null);
    const showDelay = 500;
    const hideDelay = 300;

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownButtonRef = useRef(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);


    if (!commentary) return null;

    const isCommentOwner = authenticatedUser && commentary.creatorPublicId && authenticatedUser.publicId === commentary.creatorPublicId;

    const isGlobalModerator = authenticatedUser?.roles?.some(role => role.name === 'ROLE_MODERATOR');

    const isUserCategoryModerator = !loadingModeratedCategories && Array.isArray(moderatedCategorySlugs) && moderatedCategorySlugs.includes(commentary.categorySlug);

    const canEditComment = !authLoading && isCommentOwner;
    const canDeleteComment = !authLoading && (isCommentOwner || isGlobalModerator || isUserCategoryModerator);
    const canReportComment = !authLoading && authenticatedUser && !isCommentOwner;


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


    const toggleDropdown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDropdown(prev => !prev);
    };

    const handleDropdownItemClick = useCallback(async (action) => {
        setShowDropdown(false);
        switch (action) {
            case 'edit':
                if (canEditComment) {
                    toast.info("Update functionality not yet implemented.");
                }
                break;
            case 'delete':
                if (canDeleteComment) {
                    setShowDeleteModal(true);
                }
                break;
            case 'report':
                if (canReportComment) {
                    setShowReportModal(true);
                } else if (!authenticatedUser) {
                    toast.info('You must be logged in to report a comment.');
                }
                break;
            default:
                break;
        }
    }, [canEditComment, canDeleteComment, canReportComment, authenticatedUser]);


    const confirmDeleteComment = async () => {
        setShowDeleteModal(false);

        try {
            const token = Cookies.get('token');
            if (!token) {
                toast.error("Authentication token not found. Please log in.");
                return;
            }

            if (!commentary?.id) {
                toast.error("Comment ID is missing.");
                return;
            }

            const response = await axios.delete(`http://localhost:8080/api/v1/commentaries/${commentary.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 204) {
                console.log(`Comment with ID ${commentary.id} deleted successfully.`);
                toast.success("Comment deleted successfully!");
                if (onCommentDeleted) {
                    onCommentDeleted(commentary.id);
                }
            } else {
                console.error('Error deleting comment: Unexpected status', response.status);
                toast.error(`Failed to delete comment: Unexpected server response.`);
            }

        } catch (err) {
            console.error('Error deleting comment:', err);
            let errorMessage = "An error occurred while trying to delete the comment.";
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    if (err.response.data && err.response.data.message) {
                        errorMessage = `Failed to delete comment: ${err.response.data.message}`;
                    } else if (err.response.status === 403) {
                        errorMessage = "You do not have permission to delete this comment.";
                    } else if (err.response.status === 404) {
                        errorMessage = "Comment not found (possibly already deleted).";
                    } else {
                        errorMessage = `Failed to delete comment: Server responded with status ${err.response.status}`;
                    }
                } else if (err.request) {
                    errorMessage = "No response received from server. Please try again.";
                } else {
                    errorMessage = `Error setting up request: ${err.message}`;
                }
            } else {
                errorMessage = `An unexpected error occurred: ${err.message}`;
            }
            toast.error(errorMessage);
        }
    };

    const handleReportModalClose = useCallback(() => {
        setShowReportModal(false);
    }, []);


    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setShowDeleteModal(false);
                setShowReportModal(false);
            }
        };

        if (showDeleteModal || showReportModal) {
            document.addEventListener('keydown', handleEscapeKey);
        } else {
            document.removeEventListener('keydown', handleEscapeKey);
        }


        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showDeleteModal, showReportModal]);


    const displayName = commentary.userDisplayName || commentary.username || 'User';
    const avatarClass = getAvatarColorClass(commentary.username);
    const initials = getInitials(displayName);


    return (
        <li
            ref={ref}
            className="transition rounded-2xl p-4 hover:bg-gray-100 overflow-visible relative"
        >
            <div className="flex items-start space-x-3">
                {commentary.userAvatarUrl ? (
                    <img
                        src={commentary.userAvatarUrl}
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
                    <div className="text-xs text-gray-600 mb-1 flex items-center flex-wrap gap-x-1">
                        {commentary.username && (
                            <Link
                                to={`/users/${commentary.username}`}
                                className="font-semibold text-gray-800 hover:underline"
                            >
                                {displayName}
                            </Link>
                        )}
                        {commentary.username && <span>•</span>}
                        <span>{formatDistanceToNow(new Date(commentary.createdAt), { addSuffix: true })}</span>

                        {commentary.parentCommentUsername && (
                            <>
                                <span>•</span>
                                <span className="relative">
                                    In reply to{' '}
                                    <Link
                                        to={`/users/${commentary.parentCommentUsername}`}
                                        className="font-semibold hover:underline"
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {commentary.parentCommentDisplayName || commentary.parentCommentUsername}
                                    </Link>
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

                    <div className="text-xs text-gray-500 mb-2 flex flex-wrap items-center gap-2">
                        {commentary.categorySlug && (
                            <Link
                                to={`/categories/${commentary.categorySlug}`}
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
                            </Link>
                        )}
                        {commentary.postId && commentary.postTitle && (
                            <>
                                <span>•</span>
                                <Link
                                    to={`/categories/${commentary.categorySlug}/posts/${commentary.postId}`}
                                    className="hover:underline text-gray-700 font-medium"
                                >
                                    {commentary.postTitle}
                                </Link>
                            </>
                        )}
                    </div>

                    <div
                        className="text-md text-gray-800 prose max-w-full"
                        dangerouslySetInnerHTML={createSafeHTML(commentary.content)}
                    />
                </div>
            </div>

            {(canEditComment || canDeleteComment || canReportComment) && (
                <div className="absolute top-2 right-2">
                    <button
                        ref={dropdownButtonRef}
                        className="text-gray-600 hover:bg-gray-200 hover:text-black p-1 rounded-full transition-colors"
                        onClick={toggleDropdown}
                        aria-label="Comment options"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    {showDropdown && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full mt-2 right-0 w-40 bg-white rounded-md shadow-lg border border-border overflow-hidden z-20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {canEditComment && (
                                <button
                                    onClick={() => handleDropdownItemClick('edit')}
                                    className="block w-full text-left px-4 py-2 text-gray-darker hover:bg-gray-lighter"
                                >
                                    Update
                                </button>
                            )}
                            {canDeleteComment && (
                                <button
                                    onClick={() => handleDropdownItemClick('delete')}
                                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                                >
                                    Delete
                                </button>
                            )}
                            {canReportComment && (
                                <button
                                    onClick={() => handleDropdownItemClick('report')}
                                    className="block w-full text-left px-4 py-2 text-gray-darker hover:bg-gray-lighter"
                                >
                                    Report
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[999] overflow-hidden"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-sm mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                onClick={confirmDeleteComment}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && commentary?.id && (
                <ReportContentModal
                    targetType="COMMENTARY"
                    targetId={commentary.id}
                    onClose={handleReportModalClose}
                />
            )}

        </li>
    );
});

export default UserCommentaryItem;