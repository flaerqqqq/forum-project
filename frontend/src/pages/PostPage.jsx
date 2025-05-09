import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { MessageCircle, ChevronLeft, ChevronRight, X, MoreHorizontal } from 'lucide-react';
import CategoryInfoSidebar from "../components/CategoryInfoSidebar.jsx";
import { useUser } from '../contexts/UserContext';
import { useDeletedPosts } from '../contexts/DeletedPostsContext';
import Cookies from "js-cookie";
import PostNotFound from '../components/PostNotFound.jsx'; // Import the new component
import PostCommentaries from '../components/PostCommentaries.jsx'; // Corrected import path to .jsx

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
    const location = useLocation();
    const { user: authenticatedUser, loading: authLoading } = useUser();
    const { addDeletedPostId } = useDeletedPosts();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State to store the error object

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const previewImageRef = useRef(null);

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownButtonRef = useRef(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // State for category moderator check
    const [isUserCategoryModerator, setIsUserCategoryModerator] = useState(false);
    const [checkingCategoryModerator, setCheckingCategoryModerator] = useState(false);


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
            setError(err); // Store the error object
            if (err.response && err.response.status !== 404) {
                toast.error('Failed to load post.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]);

    // Effect to check if the authenticated user is a moderator for the post's category
    useEffect(() => {
        const checkCategoryModeratorStatus = async () => {
            // Only check if user is authenticated, auth loading is done,
            // user publicId is available, post data is loaded, and category slug is available
            if (!authenticatedUser || authLoading || !authenticatedUser.publicId || !post?.category?.slug) {
                setIsUserCategoryModerator(false); // Ensure it's false if conditions change
                return;
            }

            // Avoid re-checking if already determined to be a moderator for this category
            // If you need to handle dynamic changes in moderator status, remove this check
            if (isUserCategoryModerator) {
                return;
            }

            setCheckingCategoryModerator(true);
            try {
                const token = Cookies.get('token'); // Get token if needed by the API
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                // Make the API call to check moderator status by category slug and user public ID
                const res = await axios.get(`http://localhost:8080/api/v1/categories/${post.category.slug}/moderators/${authenticatedUser.publicId}`, {
                    headers: headers
                });

                // The API returns a list. If the list is not empty, the user is a moderator.
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setIsUserCategoryModerator(true);
                } else {
                    setIsUserCategoryModerator(false);
                }

            } catch (err) {
                console.error('Error checking category moderator status:', err);
                // On error, assume the user is not a category moderator for safety.
                setIsUserCategoryModerator(false);
                // Decide if you want to show a toast for this specific error,
                // or just handle it silently as it's a permission check.
                // toast.error('Failed to verify category moderator status.');
            } finally {
                setCheckingCategoryModerator(false);
            }
        };

        // Trigger the check when authenticatedUser, authLoading, or post changes
        checkCategoryModeratorStatus();

    }, [authenticatedUser, authLoading, post, post?.category?.slug]); // Dependencies for the effect

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


    const showPrevButton = post?.images?.length > 1 && currentImageIndex > 0;
    const showNextButton = post?.images?.length > 1 && currentImageIndex < post.images.length - 1;

    const currentImageUrl = post?.images?.[currentImageIndex]?.url;

    const isPostOwner = authenticatedUser && post?.creator && authenticatedUser.publicId === post.creator.publicId;
    const isGlobalModerator = authenticatedUser?.roles?.some(role => role.name === 'ROLE_MODERATOR');

    // Updated canDeletePost condition to include category moderator status
    const canDeletePost = !authLoading && !checkingCategoryModerator && (isPostOwner || isGlobalModerator || isUserCategoryModerator);
    // Keep canUpdatePost as owner or global moderator as per previous logic
    const canUpdatePost = !authLoading && (isPostOwner);


    const handleUpdatePostClick = () => {
        if (post?.category?.slug && post?.id) {
            navigate(`/categories/${post.category.slug}/posts/${post.id}/edit`);
            setShowDropdown(false);
        }
    };

    const requestDeleteConfirmation = () => {
        setShowDropdown(false);
        setShowDeleteModal(true);
    };

    const confirmDeletePost = async () => {
        setShowDeleteModal(false);

        try {
            const token = Cookies.get('token');
            if (!token) {
                toast.error("Authentication token not found. Please log in.");
                return;
            }

            if (!post?.id) {
                toast.error("Post ID is missing.");
                return;
            }

            const response = await axios.delete(`http://localhost:8080/api/v1/posts/${post.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 204) {
                console.log(`Post with ID ${post.id} deleted successfully.`);
                toast.success("Post deleted successfully!");

                addDeletedPostId(post.id);

                if (window.history.length <= 1) {
                    navigate('/');
                } else {
                    navigate(-1); // Navigate back to the previous page (e.g., category page)
                }
            } else {
                console.error('Error deleting post: Unexpected status', response.status);
                toast.error(`Failed to delete post: Unexpected server response.`);
            }


        } catch (err) {
            console.error('Error deleting post:', err);

            let errorMessage = "An error occurred while trying to delete the post.";

            if (axios.isAxiosError(err)) {
                if (err.response) {
                    console.error("Response data:", err.response.data);
                    console.error("Response status:", err.response.status);

                    if (err.response.data && err.response.data.message) {
                        errorMessage = `Failed to delete post: ${err.response.data.message}`;
                    } else if (err.response.status === 403) {
                        errorMessage = "You do not have permission to delete this post.";
                    } else if (err.response.status === 404) {
                        errorMessage = "Post not found (possibly already deleted).";
                    } else {
                        errorMessage = `Failed to delete post: Server responded with status ${err.response.status}`;
                    }
                } else if (err.request) {
                    console.error("No response received:", err.request);
                    errorMessage = "No response received from server. Please try again.";
                } else {
                    console.error("Error setting up request:", err.message);
                    errorMessage = `Error setting up request: ${err.message}`;
                }
            } else {
                errorMessage = `An unexpected error occurred: ${err.message}`;
            }

            toast.error(errorMessage);
        }
    };

    // --- Render Logic ---

    // Check specifically for a 404 error and render PostNotFound component
    if (error && error.response && error.response.status === 404) {
        return <PostNotFound />; // Render the PostNotFound component
    }


    // Show loader if loading or authLoading, or if post is null and there's no error,
    // or if post is loaded but we are still checking category moderator status.
    if (loading || authLoading || (!post && !error) || (post && checkingCategoryModerator)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="flex flex-col items-center gap-4">
                    {(loading || authLoading || (post && checkingCategoryModerator)) ? (
                        <>
                            <Oval height={50} width={50} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} visible={true} />
                            <p className="text-gray-medium">
                                {loading ? 'Loading post...' : authLoading ? 'Authenticating user...' : 'Checking permissions...'}
                            </p>
                        </>
                    ) : (
                        <p className="text-gray-medium">Preparing post...</p>
                    )
                    }
                </div>
            </div>
        );
    }

    // Show generic error message if there's an error, but not a 404 (handled above)
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="p-6 bg-white rounded-md shadow-md text-center text-red-600">
                    <p>Failed to load post: {error.message || 'An unknown error occurred.'}</p>
                    <Link to="/" className="text-blue-600 underline mt-4 block">
                        Go back to Home
                    </Link>
                </div>
            </div>
        );
    }


    // Only render the post content if post is successfully loaded and no error
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
                                    {(post.category?.name || post.creator?.username) && post.createdAt && ' • '}
                                    {post.createdAt && (
                                        formatRelativeTime(post.createdAt)
                                    )}
                                </div>

                                {/* Dropdown Button and Menu - Only show if post is loaded and there's an action available */}
                                { (canUpdatePost || canDeletePost) && (
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
                                )}
                            </div>
                        )}

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

                        {post?.images.length > 0 && (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden group mb-3">
                                <div
                                    className="flex h-full transition-transform ease-in-out duration-300 relative z-10"
                                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                                >
                                    {post?.images.map((image, index) => (
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

                                {post?.images.length > 1 && (
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20 bg-black/30 rounded-full px-2 py-1">
                                        {post?.images.map((_, index) => (
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

                        <div className="flex items-center text-sm text-gray-600 gap-2">
                            <MessageCircle size={16} className="mr-1" />
                            <span>{post?.commentsCount || 0} comments</span>
                        </div>

                        <hr className="my-6 border-gray-300" />

                        {/* Integrate the PostCommentaries component here */}
                        {/* Ensure PostCommentaries accepts and passes down categoryId and isUserCategoryModerator */}
                        {post?.id && post.category && ( // Ensure post.category is available
                            <PostCommentaries
                                postId={post.id}
                                categoryId={post.category?.id} // Pass down categoryId (assuming it exists)
                                isUserCategoryModerator={isUserCategoryModerator} // Pass down moderator status
                            />
                        )}

                    </div>

                    {post?.category && (
                        <div className="w-80 flex-shrink-0 sticky top-16 self-start hidden lg:block"> {/* Hide sidebar on smaller screens */}
                            <CategoryInfoSidebar category={post.category} />
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {showPreview && currentImageUrl && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[999] overflow-hidden"
                    onClick={closePreview}
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
                        onClick={closePreview} // Allow closing by clicking the image
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
                    onClick={() => setShowDeleteModal(false)} // Close modal when clicking outside
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-sm mx-4"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing modal
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

export default PostPage;