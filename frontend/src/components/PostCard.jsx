import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronLeft, ChevronRight, X, MoreHorizontal } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const PostCard = ({ post, saveCurrentStateToCache }) => {
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

    const getPlainText = (html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    const snippet = getPlainText(body);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    // Removed imageGalleryRef

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownButtonRef = useRef(null);


    // Removed scroll event listener useEffect


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

    const handleUpdatePostClick = (e) => { // Accept event object
        e.preventDefault(); // Prevent default button behavior
        e.stopPropagation(); // Stop event from bubbling up to the Link
        if (category?.slug && id) {
            navigate(`/categories/${category.slug}/posts/${id}/edit`);
            setShowDropdown(false);
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

                        {/* Dropdown Button (visible to everyone) */}
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
                            {/* Dropdown Menu (visible when button clicked) */}
                            {showDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-full mt-2 right-0 w-40 bg-white rounded-md shadow-lg border border-border overflow-hidden z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Update Post option (only visible to owner) */}
                                    {!authLoading && isPostOwner && (
                                        <button
                                            onClick={handleUpdatePostClick}
                                            className="block w-full text-left px-4 py-2 text-gray-darker hover:bg-gray-lighter"
                                        >
                                            Update post
                                        </button>
                                    )}
                                    {/* Add other post options here if needed (e.g., Report, Share) */}
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
                                // Removed ref={imageGalleryRef}
                                className="flex h-full transition-transform ease-in-out duration-300 relative z-10" // Removed overflow-x-auto, snap classes
                                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }} // Re-added transform style
                            >
                                {images.map((image, index) => (
                                    <div key={index} className="w-full h-full flex-shrink-0 flex justify-center items-center relative"> {/* Removed snap-center */}
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

                            {/* Re-added Prev/Next Buttons */}
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
        </div>
    );
};

export default PostCard;