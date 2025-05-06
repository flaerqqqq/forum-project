import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { MessageCircle, ChevronLeft, ChevronRight, X, MoreHorizontal } from 'lucide-react';
import CategoryInfoSidebar from "../components/CategoryInfoSidebar.jsx";
import { useUser } from '../contexts/UserContext';
import Cookies from "js-cookie";

const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} yr. ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} mo. ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} d. ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hr. ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} min. ago`;

    return seconds < 10 ? 'just now' : `${Math.floor(seconds)} sec. ago`;
};


const PostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Use useLocation here as well if needed for future state
    const { user: authenticatedUser, loading: authLoading } = useUser();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const previewImageRef = useRef(null);

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownButtonRef = useRef(null);

    // State for the delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchPost = async () => {
        setLoading(true);
        setError(null);
        setPost(null);
        setCurrentImageIndex(0);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/posts/${postId}`);
            setPost(res.data);
        } catch (err) {
            console.error('Error fetching post:', err);
            if (err.response && err.response.status === 404) {
                setError('Post not found.');
                toast.error('Post not found.');
            } else {
                setError('Failed to load post.');
                toast.error('Failed to load post.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]); // Add postId as a dependency

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
        if (post?.images && currentImageIndex < post.images.length - 1) {
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

    // Handle Escape key for modals
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                // Close both preview and delete modal if open
                closePreview();
                setShowDeleteModal(false);
            }
        };

        // Add/remove listener based on whether preview OR modal is open
        if (showPreview || showDeleteModal) {
            document.addEventListener('keydown', handleEscapeKey);
        } else {
            document.removeEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showPreview, showDeleteModal]); // Add showDeleteModal to dependency array


    const showPrevButton = post?.images?.length > 1 && currentImageIndex > 0;
    const showNextButton = post?.images?.length > 1 && currentImageIndex < post.images.length - 1;

    const currentImageUrl = post?.images?.[currentImageIndex]?.url;

    const isPostOwner = authenticatedUser && post?.creator && authenticatedUser.publicId === post.creator.publicId;

    const isModerator = authenticatedUser?.roles?.some(role => role.name === 'ROLE_MODERATOR');

    const canUpdatePost = !authLoading && (isPostOwner || isModerator);

    const canDeletePost = !authLoading && (isPostOwner || isModerator);

    const handleUpdatePostClick = () => {
        if (post?.category?.slug && post?.id) {
            navigate(`/categories/${post.category.slug}/posts/${post.id}/edit`);
            setShowDropdown(false);
        }
    };

    // Function to request delete confirmation (opens the modal)
    const requestDeleteConfirmation = () => {
        setShowDropdown(false); // Close dropdown
        setShowDeleteModal(true); // Open modal
    };

    // Function to actually perform the deletion
    const confirmDeletePost = async () => {
        setShowDeleteModal(false); // Close modal immediately

        try {
            const token = Cookies.get('token'); // Get token from cookie as requested for this component
            if (!token) {
                toast.error("Authentication token not found. Please log in.");
                // Optionally redirect to login
                // navigate('/login');
                return;
            }

            // Ensure post and post.id exist before making the request
            if (!post?.id) {
                toast.error("Post ID is missing.");
                return;
            }

            const response = await axios.delete(`http://localhost:8080/api/v1/posts/${post.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Use token from cookie in header
                },
            });

            // Backend returns 204 No Content on successful delete
            if (response.status === 204) {
                console.log(`Post with ID ${post.id} deleted successfully.`);
                toast.success("Post deleted successfully!"); // Show success toast

                // Navigate back to the previous page AND pass state (deleted post ID)
                // Safely access post?.id
                navigate(-1, { state: { deletedPostId: post?.id } });


            } else {
                // This block might not be reached if axios throws on non-2xx, but good for safety
                console.error('Error deleting post: Unexpected status', response.status);
                toast.error(`Failed to delete post: Unexpected server response.`);
            }


        } catch (error) {
            console.error('Error deleting post:', error);

            let errorMessage = "An error occurred while trying to delete the post.";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error("Response data:", error.response.data);
                    console.error("Response status:", error.response.status);

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

            toast.error(errorMessage); // Show error toast
        }
    };

    // --- Render Logic ---
    // Show loader or error message if loading, authLoading, or post is null and no error
    if (loading || authLoading || (!post && !error)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="flex flex-col items-center gap-4">
                    {loading || authLoading ? (
                        <>
                            <Oval height={50} width={50} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} visible={true} />
                            <p className="text-gray-medium">Loading post...</p>
                        </>
                    ) : (
                        // This case might show briefly if loading finishes but post is null and no error
                        <p className="text-gray-medium">Preparing post...</p>
                    )
                    }
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="p-6 bg-white rounded-md shadow-md text-center text-red-600">
                    <p>{error}</p>
                </div>
            </div>
        );
    }


    // Only render the post content if post is successfully loaded and not null/error
    return (
        <div className="bg-background-light-gray text-black min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-grow">
                        {/* Metadata and Dropdown - Ensure post data is available */}
                        {post && (
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-xs text-gray-600">
                                    {/* Safely access category name */}
                                    {post.category?.name && (
                                        <Link to={`/categories/${post.category.slug}`} className="text-gray-800 font-medium hover:underline font-semibold">
                                            {post.category.name}
                                        </Link>
                                    )}
                                    {/* Add separator only if category name was rendered and creator exists */}
                                    {post.category?.name && post.creator?.username && ' • '}
                                    {/* Safely access creator username */}
                                    {post.creator?.username && (
                                        <Link to={`/users/${post.creator.username}`} className="hover:underline text-gray-600">
                                            {post.creator.username}
                                        </Link>
                                    )}
                                    {/* Add separator only if category/creator was rendered and date exists */}
                                    {(post.category?.name || post.creator?.username) && post.createdAt && ' • '}
                                    {/* Safely access creation date */}
                                    {post.createdAt && (
                                        formatRelativeTime(post.createdAt)
                                    )}
                                </div>

                                {/* Dropdown Button and Menu - Only show if post is loaded */}
                                <div className="relative">
                                    <button
                                        ref={dropdownButtonRef}
                                        className="text-gray-600 hover:bg-gray-200 hover:text-black p-1 rounded-full transition-colors"
                                        onClick={() => setShowDropdown(prev => !prev)}
                                        aria-label="Post options"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                    {showDropdown && (
                                        <div
                                            ref={dropdownRef}
                                            className="absolute top-full mt-2 right-0 w-40 bg-white rounded-md shadow-lg border border-border overflow-hidden z-10"
                                            onClick={(e) => e.stopPropagation()} // Prevent clicks inside dropdown from closing it via global listener
                                        >
                                            {/* Update Post option (visible to owner OR moderator) */}
                                            {canUpdatePost && (
                                                <button
                                                    onClick={handleUpdatePostClick}
                                                    className="block w-full text-left px-4 py-2 text-gray-darker hover:bg-gray-lighter"
                                                >
                                                    Update post
                                                </button>
                                            )}
                                            {/* Delete Post option (visible to owner or moderator) */}
                                            {canDeletePost && (
                                                <button
                                                    onClick={requestDeleteConfirmation} // Call the function to open the modal
                                                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100" // Styling for delete button
                                                >
                                                    Delete post
                                                </button>
                                            )}
                                            {/* Add other post options here if needed */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                        {/* Post Title - Ensure post data is available */}
                        {post?.title && (
                            <h1
                                className="text-black font-sans font-bold text-2xl mb-4 "
                                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                            >
                                {post.title}
                            </h1>
                        )}

                        {post?.body && (
                            <div
                                className="text-gray-700 text-base mb-6 prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: post.body }}
                                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                            ></div>
                        )}


                        {/* Images Section - Already checks post.images.length > 0, added optional chaining for safety */}
                        {post?.images && post.images.length > 0 && (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden group mb-6">
                                <div
                                    className="flex h-full transition-transform ease-in-out duration-300 relative z-10"
                                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                                >
                                    {post.images.map((image, index) => (
                                        <div key={index} className="w-full h-full flex-shrink-0 flex justify-center items-center relative">
                                            {image?.url && (
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center filter blur-lg transform scale-125"
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

                                {/* Prev/Next Buttons */}
                                {showPrevButton && (
                                    <button
                                        onClick={showPrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-20"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                )}
                                {showNextButton && (
                                    <button
                                        onClick={showNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-20"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                )}


                                {post.images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20 bg-black/30 rounded-full px-3 py-1">
                                        {post.images.map((_, index) => (
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

                        {/* Comments Count - Uses optional chaining for safety */}
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                            <MessageCircle size={16} className="mr-1" />
                            <span>{post?.commentsCount || 0} comments</span> {/* Use post?.commentsCount */}
                        </div>

                        <hr className="my-6 border-gray-300" />

                        {/* Comment Section (Placeholder) */}
                        <div className="mt-6 text-gray-600 text-center py-4">
                            No commentaries found.
                        </div>

                    </div>

                    {/* Category Sidebar - Ensure post.category exists */}
                    {post?.category && (
                        <div className="w-80 flex-shrink-0 sticky top-16 self-start">
                            <CategoryInfoSidebar category={post.category} />
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {showPreview && currentImageUrl && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[999] overflow-hidden"
                    onClick={closePreview} // Click outside to close
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center filter blur-xl transform scale-125"
                        style={{ backgroundImage: `url(${currentImageUrl})` }}
                    ></div>
                    <div className="absolute inset-0 bg-black opacity-40"></div>

                    <img
                        ref={previewImageRef}
                        src={currentImageUrl}
                        alt="Image Preview"
                        className="max-w-[90%] max-h-[90%] object-contain relative z-10 cursor-pointer"
                        onClick={closePreview} // Click on image to close
                    />

                    <button
                        className="absolute top-4 right-4 text-white z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 transition"
                        onClick={closePreview}
                        aria-label="Close Image Preview"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 overflow-hidden"
                    onClick={() => setShowDeleteModal(false)} // Click outside to close modal
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-sm mx-4"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
                    >
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                                onClick={() => setShowDeleteModal(false)} // Cancel button action
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                onClick={confirmDeletePost} // Confirm button action
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

export default PostPage;