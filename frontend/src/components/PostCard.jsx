import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ChevronLeft, ChevronRight, X } from 'lucide-react'; // Import X icon

const PostCard = ({ post }) => {
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

    const getPlainText = (html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    const snippet = getPlainText(body);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

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


    return (
        <div className="transition rounded-2xl p-4 mb-6 hover:bg-gray-100">
            <Link to={postDetailUrl} className="block no-underline text-inherit hover:no-underline focus:no-underline">
                <div className="text-xs text-gray-600 mb-1">
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

                <div className="text-black font-semibold text-xl mb-1 no-underline hover:underline">
                    {title}
                </div>

                <p className="text-gray-700 text-base mb-3 line-clamp-2">
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

            <div className="flex items-center text-sm text-gray-600 gap-2 mt-2">
                <Link to={`${postDetailUrl}#comments`} className="flex items-center text-gray-600 hover:underline">
                    <MessageCircle size={16} className="mr-1" />
                    <span>{commentsCount || 0} comments</span>
                </Link>
            </div>

            {showPreview && images[currentImageIndex] && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
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