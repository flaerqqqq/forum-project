import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import UserReactions from '../components/UserReactions';
import defaultAvatar from '../assets/images/default-avatar.png';
import UserNotFound from "../components/UserNotFound.jsx";
import ReportUserModal from '../components/ReportUserModal';  // Import the modal
import UserReports from '../components/UserReports'; // Import the UserReports component
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import React-Toastify CSS

const UserProfile = () => {
    const rawParams = useParams();
    const profileUsername = typeof rawParams === 'object' && rawParams?.username ? rawParams.username : '';
    const [profileUser, setProfileUser] = useState(null);
    const { user: authenticatedUser, loading: authLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [failedToLoad, setFailedToLoad] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);  // State to control the modal
    const [showReportsSection, setShowReportsSection] = useState(false); // State to toggle reports section
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;
    const navigate = useNavigate();

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

                const res = await axios.get(`http://localhost:8080/api/v1/users/${profileUsername}`);
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

    if (notFound) {
        return (<UserNotFound />);
    }

    if (authLoading || isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    {retryCount > 0 && (
                        <p className="text-gray-600">
                            Retrying... ({retryCount}/{MAX_RETRIES})
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return <div>Error loading user profile.</div>;
    }

    const isOwnProfile = authenticatedUser?.username === profileUsername;

    return (
        <div className="w-screen bg-gray-100 min-h-screen">
            <div className="bg-black h-32 w-full" />

            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow -mt-16 p-6 relative text-center">
                    <img
                        src={profileUser.avatarUrl || defaultAvatar}
                        alt="avatar"
                        className="w-28 h-28 rounded-full border-4 border-white mx-auto"
                    />
                    <h2 className="text-2xl font-bold text-gray-700 mt-2 m-4">
                        {profileUser.displayName}
                    </h2>
                    <p className="text-gray-600">
                        {profileUser.description || "404 bio not found"}
                    </p>
                    <p className="text-sm text-gray-500 mt-6">
                        🎂 Joined on {new Date(profileUser.registrationDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                    </p>

                    {profileUser.publicId && (
                        <div className="mt-4">
                            <UserReactions
                                targetPublicId={profileUser.publicId}
                                readOnly={isOwnProfile}
                            />
                        </div>
                    )}

                    {isOwnProfile && (
                        <div className="absolute top-6 right-6">
                            <Link
                                to="/settings"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Edit profile
                            </Link>
                        </div>
                    )}

                    {authenticatedUser && !isOwnProfile && (
                        <div className="absolute top-6 right-20">
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                onClick={() => setShowReportModal(true)}
                            >
                                Report User
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-white rounded-lg shadow p-4 text-gray-700 text-sm">
                    <div className="flex justify-around flex-wrap gap-4">
                        <button className="flex items-center space-x-2">
                            <span>📰</span>
                            <span>Posts</span>
                        </button>

                        <button className="flex items-center space-x-2">
                            <span>💬</span>
                            <span>Comments</span>
                        </button>

                        <button className="flex items-center space-x-2">
                            <span>❤️</span>
                            <span>Likes</span>
                        </button>

                        <button className="flex items-center space-x-2">
                            <span>👎</span>
                            <span>Dislikes</span>
                        </button>

                        {isOwnProfile && (
                            <div className="relative">
                                <button
                                    className="flex items-center space-x-2"
                                    onClick={() => setShowReportsSection(!showReportsSection)} // Toggle reports section visibility
                                >
                                    <span>🚨</span>
                                    <span>Reports</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Style the UserReports like the profile container */}
                {showReportsSection && (
                    <UserReports userId={profileUser.publicId} />
                )}
            </div>

            {showReportModal && (
                <ReportUserModal
                    targetUsername={profileUser.username}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
};

export default UserProfile;