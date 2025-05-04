import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { MessageCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import CategoryInfoSidebar from "../components/CategoryInfoSidebar.jsx";

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

    return `${Math.floor(seconds)} sec. ago`;
};


const PostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const previewImageRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchPost = async () => {
        setLoading(true);
        setError(null);
        setPost(null);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/posts/${postId}`);
            setPost(res.data);
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Failed to load post.');
            toast.error('Failed to load post.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]);

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
        if (post && post.images && currentImageIndex < post.images.length - 1) {
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
            }
        };

        if (showPreview) {
            document.addEventListener('keydown', handleEscapeKey);
        } else {
            document.removeEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showPreview]);

    const showPrevButton = post && post.images && post.images.length > 1 && currentImageIndex > 0;
    const showNextButton = post && post.images && post.images.length > 1 && currentImageIndex < post.images.length - 1;

    const currentImageUrl = post?.images?.[currentImageIndex]?.url;

    // This block already handles the page-level loading spinner
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="flex flex-col items-center gap-4">
                    <Oval height={50} width={50} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} visible={true} />
                    <p className="text-gray-medium">Loading post...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="text-red-600 text-center">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="p-6 bg-white rounded-md border border-border text-center text-gray-medium">
                    Post not found.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light-gray text-black min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-grow">
                        <div className="text-xs text-gray-600">
                            {post.category?.name && (
                                <Link to={`/categories/${post.category.slug}`} className="text-gray-800 font-medium hover:underline font-semibold">
                                    {post.category.name}
                                </Link>
                            )}
                            {' • '}
                            <Link to={`/users/${post.creator.username}`} className="hover:underline text-gray-600">
                                {post.creator.username}
                            </Link>
                            {' • '}
                            {formatRelativeTime(post.createdAt)}
                        </div>

                        {/* Post Title - Matched PostCard style */}
                        <h1
                            className="text-black font-sans font-bold text-2xl mb-4 "
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                            {post.title}
                        </h1>

                        <div
                            className="text-gray-700 text-base mb-6 prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.body }}
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        ></div>

                        {post.images && post.images.length > 0 && (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden group mb-6">
                                <div
                                    className="flex h-full transition-transform ease-in-out duration-300 relative z-10"
                                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                                >
                                    {post.images.map((image, index) => (
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

                        <div className="flex items-center text-sm text-gray-600 gap-2">
                            <MessageCircle size={16} className="mr-1" />
                            <span>{post.commentsCount || 0} comments</span>
                        </div>

                        <hr className="my-6 border-gray-300" />

                        <div className="mt-6 text-gray-600 text-center py-4">
                            No commentaries found.
                        </div>

                    </div>

                    <div className="w-80 flex-shrink-0 sticky top-16 self-start">
                        {post.category && <CategoryInfoSidebar category={post.category} />}
                    </div>
                </div>
            </div>

            {showPreview && currentImageUrl && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[999] overflow-y-auto"
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
                        onClick={closePreview}
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
        </div>
    );
};

export default PostPage;