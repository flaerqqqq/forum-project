import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronLeft, ChevronRight, X, MoreHorizontal } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useDeletedPosts } from '../contexts/DeletedPostsContext'; // Import the hook
import Cookies from "js-cookie";
import axios from "axios";
import {toast} from "react-toastify";

const PostCard = ({ post, saveCurrentStateToCache, onDeleteSuccess }) => {
    const {
        id,
        title,
        body,
        images = [],
        createdAt,
        commentsCount,
        creator,
        category,
    } = post;

    const location = useLocation();
    const navigate = useNavigate();
    const { user: authenticatedUser, loading: authLoading } = useUser();
    const { addDeletedPostId } = useDeletedPosts(); // Use the hook

    const getPlainText = (html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    const snippet = getPlainText(body);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownButtonRef = useRef(null);

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

    const showPrevImage = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (currentImageIndex > 0) {
            setCurrentImageIndex((prev) => prev - 1);
        }
    };

    const showNextImage = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex((prev) => prev + 1);
        }
    };

    const handleImageClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                closePreview();
                setShowDeleteModal(false);
            }
        };

        if (showPreview || showDeleteModal) {
            document.addEventListener('keydown', handleEscapeKey);
        } else {
            document.removeEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showPreview, showDeleteModal]);

    const postDetailUrl = `/categories/${category?.slug}/posts/${id}`;

    const showPrevButton = images.length > 1 && currentImageIndex > 0;
    const showNextButton = images.length > 1 && currentImageIndex < images.length - 1;

    const currentImageUrl = images[currentImageIndex]?.url;

    const handleLinkClick = () => {
        if (saveCurrentStateToCache) {
            saveCurrentStateToCache();
        }
    };

    const snippetLineClampClass = images.length > 0 ? 'line-clamp-2' : 'line-clamp-5';

    const isPostOwner = authenticatedUser && creator && authenticatedUser.publicId === creator.publicId;
    const isModerator = authenticatedUser?.roles?.some(role => role.name === 'ROLE_MODERATOR');
    const canDeletePost = !authLoading && (isPostOwner || isModerator);
    const canUpdatePost = !authLoading && (isPostOwner || isModerator);

    const handleUpdatePostClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (category?.slug && id) {
            navigate(`/categories/${category.slug}/posts/${id}/edit`);
            setShowDropdown(false);
        }
    };

    const requestDeleteConfirmation = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDropdown(false);
        setShowDeleteModal(true);
    };

    const confirmDeletePost = async () => {
        setShowDeleteModal(false);

        try {
            const response = await axios.delete(`http://localhost:8080/api/v1/posts/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + Cookies.get('token'),
                }
            });

            console.log(`Post with ID ${id} deleted successfully.`);
            toast.success("Post deleted successfully!");

            // --- Add the deleted post ID to the context ---
            addDeletedPostId(id);
            // --- End of context update ---

            // If onDeleteSuccess prop exists (used in Feed components), call it
            if (onDeleteSuccess) {
                onDeleteSuccess(id);
            }

        } catch (error) {
            console.error('Error deleting post:', error);

            let errorMessage = "An error occurred while trying to delete the post.";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error("Response data:", error.response.data);
                    console.error("Response status:", error.response.status);
                    console.error("Response headers:", error.response.headers);

                    if (error.response.data && error.response.data.message) {
                        errorMessage = `Failed to delete post: ${error.response.data.message}`;
                    } else if (error.response.status === 403) {
                        errorMessage = "You do not have permission to delete this post.";
                    } else if (error.response.status === 404) {
                        errorMessage = "Post not found.";
                    } else {
                        errorMessage = `Failed to delete post: Server responded with status ${error.response.status}`;
                    }
                } else if (error.request) {
                    console.error("No response received:", error.request);
                    errorMessage = "No response received from server. Please try again.";
                } else {
                    console.error("Error setting up request:", error.message);
                    errorMessage = `Error setting up request: ${error.message}`;
                }
            } else {
                errorMessage = `An unexpected error occurred: ${error.message}`;
            }

            toast.error(errorMessage);
        }
    };

    return (
        <div className="transition rounded-2xl p-4 mb-6 hover:bg-gray-100 overflow-hidden">
            {category?.slug && (
                <Link to={postDetailUrl} className="block no-underline text-inherit hover:no-underline focus:no-underline" onClick={handleLinkClick}>
                    <div className="flex justify-between items-center mb-1">
                        <div className="text-xs text-gray-600">
                            {category?.name && (
                                <Link to={`/categories/${category.slug}`} className="text-gray-800 font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                                    {category.name}
                                </Link>
                            )}
                            {' • '}
                            <Link to={`/users/${creator.username}`} className="hover:underline text-gray-600" onClick={(e) => e.stopPropagation()}>
                                {creator.username}
                            </Link>
                            {' • '}
                            {new Date(createdAt).toLocaleDateString()}
                        </div>

                        <div className="relative">
                            <button
                                ref={dropdownButtonRef}
                                className="text-gray-600 hover:bg-gray-200 hover:text-black p-1 rounded-full transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowDropdown(prev => !prev);
                                }}
                                aria-label="Post options"
                            >
                                <MoreHorizontal size={20} />
                            </button>
                            {showDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-full mt-2 right-0 w-40 bg-white rounded-md shadow-lg border border-border overflow-hidden z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {canUpdatePost && (
                                        <button
                                            onClick={handleUpdatePostClick}
                                            className="block w-full text-left px-4 py-2 text-gray-darker hover:bg-gray-lighter"
                                        >
                                            Update post
                                        </button>
                                    )}
                                    {canDeletePost && (
                                        <button
                                            onClick={requestDeleteConfirmation}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                                        >
                                            Delete post
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-black font-semibold text-xl mb-1 no-underline hover:underline break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {title}
                    </div>

                    <p className={`text-gray-700 text-base mb-3 ${snippetLineClampClass} break-words`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {snippet}
                    </p>

                    {images.length > 0 && (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden group mb-3">
                            <div
                                className="flex h-full transition-transform ease-in-out duration-300 relative z-10"
                                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                            >
                                {images.map((image, index) => (
                                    <div key={index} className="w-full h-full flex-shrink-0 flex justify-center items-center relative">
                                        {image?.url && (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center filter blur-lg transform scale-110"
                                                style={{ backgroundImage: `url(${image.url})` }}
                                            ></div>
                                        )}
                                        {image?.url && (
                                            <div className="absolute inset-0 bg-black opacity-20"></div>
                                        )}
                                        {image && (
                                            <img
                                                src={image.url}
                                                alt={`slide-${index}`}
                                                className="max-w-full max-h-full object-contain relative z-10 cursor-pointer"
                                                onClick={handleImageClick}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {showPrevButton && (
                                <button
                                    onClick={showPrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-20"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            {showNextButton && (
                                <button
                                    onClick={showNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-20"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            )}

                            {images.length > 1 && (
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20 bg-black/30 rounded-full px-2 py-1">
                                    {images.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-2 h-2 rounded-full ${
                                                index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Link>
            )}

            <div className="flex items-center text-sm text-gray-600 gap-2 mt-2">
                {category?.slug && (
                    <Link to={`${postDetailUrl}#comments`} className="flex items-center text-gray-600 hover:underline">
                        <MessageCircle size={16} className="mr-1" />
                        <span>{commentsCount || 0} comments</span>
                    </Link>
                )}
            </div>

            {showPreview && images[currentImageIndex] && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 overflow-hidden"
                    onClick={closePreview}
                >
                    {currentImageUrl && (
                        <div
                            className="absolute inset-0 bg-cover bg-center filter blur-xl transform scale-125"
                            style={{ backgroundImage: `url(${currentImageUrl})` }}
                        ></div>
                    )}
                    {currentImageUrl && (
                        <div className="absolute inset-0 bg-black opacity-40"></div>
                    )}

                    {currentImageUrl && (
                        <img
                            src={currentImageUrl}
                            alt="Image Preview"
                            className="max-w-[90%] max-h-[90%] object-contain relative z-10 cursor-pointer"
                            onClick={closePreview}
                        />
                    )}

                    <button
                        className="absolute top-4 right-4 text-white z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 transition"
                        onClick={closePreview}
                        aria-label="Close Image Preview"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}

            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 overflow-hidden"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-sm mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                onClick={confirmDeletePost}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;