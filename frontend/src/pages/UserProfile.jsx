import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from '../contexts/UserContext';
import UserReactions from '../components/UserReactions';
import UserNotFound from "../components/UserNotFound.jsx";
import ReportUserModal from '../components/ReportUserModal';
import UserReports from '../components/UserReports';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isModerator } from "../utils/Auth.js";
import UserCategories from "../components/UserCategories.jsx";
import PostsFeed from '../components/PostsFeed.jsx';
import { ArrowUp } from 'lucide-react';
// Import the UserCommentaries component
import UserCommentaries from '../components/UserCommentaries.jsx';


const userPostsCache = {};

const UserProfile = () => {
    const rawParams = useParams();
    const profileUsername = typeof rawParams === 'object' && rawParams?.username ? rawParams.username : '';
    const [profileUser, setProfileUser] = useState(null);
    const { user: authenticatedUser, loading: authLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [failedToLoad, setFailedToLoad] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [activeSection, setActiveSection] = useState('posts');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;
    const navigate = useNavigate();

    const [showScrollToTop, setShowScrollToTop] = useState(false);

    const saveUserPostsCache = useCallback((key, sort, posts, loadedCount, scrollY, page, hasMore) => {
        userPostsCache[`${key}-${sort}`] = { posts, loadedCount, scrollY, page, hasMore, timestamp: Date.now(), sortBy: sort };
    }, []);

    const getUserPostsCache = useCallback((key, sort) => {
        const cachedData = userPostsCache[`${key}-${sort}`];
        if (cachedData) {
            return cachedData;
        }
        return null;
    }, []);

    const clearUserPostsCache = useCallback((key, sort) => {
        delete userPostsCache[`${key}-${sort}`];
    }, []);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    useEffect(() => {
        let timeoutId;
        let isMounted = true;

        if (retryCount > MAX_RETRIES || authLoading || failedToLoad || notFound) return;

        const fetchProfileUser = async () => {
            if (authLoading || failedToLoad || notFound) return;

            try {
                if (authenticatedUser && profileUsername === authenticatedUser.username) {
                    if (isMounted) {
                        setProfileUser(authenticatedUser);
                        setIsLoading(false);
                    }
                    return;
                }

                const res = await axios.get(`http://localhost:8080/api/v1/users/username/${profileUsername}`);
                if (isMounted) {
                    setProfileUser(res.data);
                    setIsLoading(false);
                }
            } catch (error) {
                if (!isMounted) return;

                if (error.response?.status === 404) {
                    setNotFound(true);
                    setIsLoading(false);
                    return;
                }

                if (retryCount < MAX_RETRIES) {
                    timeoutId = setTimeout(() => {
                        if (isMounted) {
                            setRetryCount(prev => prev + 1);
                        }
                    }, RETRY_DELAY);
                } else {
                    setIsLoading(false);
                    setFailedToLoad(true);
                }
            }
        };

        fetchProfileUser();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [profileUsername, authenticatedUser, authLoading, retryCount, navigate]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollToTop(true);
            } else {
                setShowScrollToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    if (notFound) {
        return (<UserNotFound />);
    }

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light-gray">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
                    {retryCount > 0 && (
                        <p className="text-gray-medium">
                            Retrying... ({retryCount}/{MAX_RETRIES})
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return <div className="text-center text-black mt-8">Error loading user profile.</div>;
    }

    const isOwnProfile = authenticatedUser?.username === profileUsername;

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const handleReportClick = () => {
        setShowReportModal(true);
        setShowDropdown(false);
    };

    const handleEditClick = () => {
        navigate('/settings');
        setShowDropdown(false);
    }

    const handleCopyUsername = async () => {
        const usernameToCopy = profileUser.username;
        try {
            await navigator.clipboard.writeText(usernameToCopy);
            toast.success(`Username "@${usernameToCopy}" copied!`);
        } catch (err) {
            console.error('Failed to copy username: ', err);
            toast.error('Failed to copy username.');
        }
    };

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


    return (
        <div className="bg-background-light-gray min-h-screen font-sans text-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 border-b border-border">
                    <div className="flex flex-col flex-grow border-r border-border pr-6">
                        <div className="flex items-center ">
                            <h1 className="text-3xl sm:text-4xl font-heading text-black mr-4 flex-grow">
                                {profileUser.displayName}
                            </h1>
                            <div className="relative flex-shrink-0">
                                <button
                                    ref={buttonRef}
                                    className="flex items-center justify-center w-8 h-8 text-gray-medium hover:text-black text-2xl font-bold rounded-full transition-colors"
                                    onClick={toggleDropdown}
                                    aria-label="More actions"
                                >
                                    ...
                                </button>
                                {showDropdown && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute top-full mt-2 right-0 w-48 bg-white rounded-md shadow-lg border border-border overflow-hidden z-10"
                                    >
                                        {isOwnProfile ? (
                                            <button
                                                onClick={handleEditClick}
                                                className="block w-full text-left px-4 py-2 text-gray-darker hover:bg-gray-lighter"
                                            >
                                                Edit profile
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleReportClick}
                                                className="block w-full text-left px-4 py-2 text-gray-darker hover:bg-gray-lighter"
                                            >
                                                Report User
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                            <p className="text-gray-700 text-base mb-4 pr-6">
                                {profileUser.description ? profileUser.description : 'No bio.'}
                            </p>
                        <div className="flex space-x-6 font-medium text-gray-darker">
                            <button
                                className={`pb-2 border-b-2 ${activeSection === 'posts' ? 'border-black text-black' : 'border-transparent text-gray-darker hover:text-black hover:border-gray-medium'} transition-colors duration-200`}
                                onClick={() => setActiveSection('posts')}
                            >
                                Posts
                            </button>
                            {isOwnProfile && (
                                <button
                                    className={`pb-2 border-b-2 ${activeSection === 'categories' ? 'border-black text-black' : 'border-transparent text-gray-darker hover:text-black hover:border-gray-medium'} transition-colors duration-200`}
                                    onClick={() => setActiveSection('categories')}
                                >
                                    Categories
                                </button>
                            )}
                            <button
                                className={`pb-2 border-b-2 ${activeSection === 'comments' ? 'border-black text-black' : 'border-transparent text-gray-darker hover:text-black hover:border-gray-medium'} transition-colors duration-200`}
                                onClick={() => setActiveSection('comments')}
                            >
                                Comments
                            </button>
                            {isOwnProfile && !isModerator() && (
                                <button
                                    className={`pb-2 border-b-2 ${activeSection === 'reports' ? 'border-black text-black' : 'border-transparent hover:border-gray-medium'} transition-colors duration-200`}
                                    onClick={() => setActiveSection('reports')}
                                >
                                    Reports
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center flex-shrink-0 mt-6 sm:mt-6 pl-6">
                        <div className={`w-16 h-16 rounded-full ${profileUser.username ? getAvatarColorClass(profileUser.username) : 'bg-gray-medium'} flex items-center justify-center text-white text-2xl font-bold mb-2 overflow-hidden`}>
                            {profileUser.avatarUrl ? (
                                <img src={profileUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{getInitials(profileUser.displayName)}</span>
                            )}
                        </div>
                        <p
                            className="text-gray-darker text-sm font-semibold cursor-pointer hover:underline"
                            onClick={handleCopyUsername}
                            title={`Click to copy username: @${profileUser.username}`}
                        >
                            @{profileUser.username}
                        </p>
                        {profileUser.publicId && (
                            <div className="mt-4">
                                <UserReactions
                                    targetPublicId={profileUser.publicId}
                                    readOnly={isOwnProfile}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    {activeSection === 'posts' && profileUser?.publicId && (
                        <PostsFeed
                            saveHomePostsCache={saveUserPostsCache}
                            getHomePostsCache={getUserPostsCache}
                            clearHomePostsCache={clearUserPostsCache}
                            creatorPublicId={profileUser.publicId}
                        />
                    )}
                    {/* Render the UserCommentaries component when activeSection is 'comments' */}
                    {activeSection === 'comments' && profileUser?.publicId && (
                        <UserCommentaries userPublicId={profileUser.publicId} profileUser={profileUser} />
                    )}

                    {activeSection === 'categories' && profileUser?.publicId && (
                        <UserCategories userPublicId={profileUser.publicId} />
                    )}

                    {activeSection === 'reports' && profileUser?.publicId && (
                        <UserReports userId={profileUser.publicId} />
                    )}
                </div>

            </div>

            {showReportModal && profileUser?.publicId && (
                <ReportUserModal
                    targetPublicId={profileUser.publicId}
                    onClose={() => setShowReportModal(false)}
                />
            )}

            {showScrollToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-accent-green hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={20} />
                </button>
            )}

        </div>
    );
};

export default UserProfile;