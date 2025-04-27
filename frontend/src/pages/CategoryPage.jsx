import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from '../contexts/UserContext'; // Import the user context hook
import { Oval } from 'react-loader-spinner'; // Import Oval spinner
import { ToastContainer, toast } from 'react-toastify'; // Import React-Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import the styles for Toastify
import PopularCategoriesSidebar from "../components/PopularCategoriesSidebar.jsx"; // Keep if needed elsewhere
import CategoryInfoSidebar from "../components/CategoryInfoSidebar.jsx"; // Keep if needed elsewhere
import CategoryNotFound from "../components/CategoryNotFound.jsx"; // Import the Not Found page

const CategoryPage = () => {
    const { categorySlug } = useParams();
    const navigate = useNavigate(); // Initialize navigate

    // --- State for CategoryPage (Main Data Fetch) ---
    const [category, setCategory] = useState(null);
    const [loadingCategory, setLoadingCategory] = useState(true); // Renamed loading for clarity
    const [categoryError, setCategoryError] = useState(null); // Renamed error for clarity
    const [notFound, setNotFound] = useState(false);

    // --- State for CategoryHeader Logic (Follow Status) ---
    const { user, loading: userLoading } = useUser(); // Get user data and loading state
    const [isFollowed, setIsFollowed] = useState(false);
    const [loadingFollowStatus, setLoadingFollowStatus] = useState(true); // Loading state for follow check/action
    const [followActionError, setFollowActionError] = useState(null); // Error state for follow action

    // Effect to fetch category details based on slug
    useEffect(() => {
        const fetchCategoryDetails = async () => {
            setLoadingCategory(true); // Start loading main category data
            setCategoryError(null); // Clear previous errors
            setNotFound(false); // Reset not found status

            try {
                const res = await axios.get(`http://localhost:8080/api/v1/categories/slug/${categorySlug}`);
                setCategory(res.data);
            } catch (error) {
                console.error("Failed to load category details:", error);
                if (error.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setCategoryError('Failed to load category details.');
                    toast.error('Failed to load category details.'); // Show error toast
                }
            } finally {
                setLoadingCategory(false); // End loading main category data
            }
        };

        fetchCategoryDetails();
    }, [categorySlug]); // Re-run effect if categorySlug changes

    // Effect to check follow status - Runs AFTER category and user data are potentially loaded
    useEffect(() => {
        if (userLoading || !category) {
            setLoadingFollowStatus(true);
            return;
        }

        if (!user) {
            setIsFollowed(false);
            setLoadingFollowStatus(false);
            return;
        }

        const checkFollowStatus = async () => {
            setLoadingFollowStatus(true); // Start loading follow status
            setFollowActionError(null); // Clear previous follow errors

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/v1/categories/${category.id}/follows/${user.publicId}`
                );
                setIsFollowed(true);
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    setIsFollowed(false); // 404 means not followed
                } else {
                    console.error("Failed to fetch follow status", err);
                    setFollowActionError("Failed to fetch follow status.");
                    toast.error("Failed to fetch follow status."); // Show error toast
                    setIsFollowed(false);
                }
            } finally {
                setLoadingFollowStatus(false); // End loading follow status
            }
        };

        checkFollowStatus();
    }, [category?.id, user?.publicId, userLoading, category]);

    // Handler for the follow/unfollow button click
    const handleFollowClick = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoadingFollowStatus(true);
        setFollowActionError(null);

        const token = Cookies.get('token');
        if (!token) {
            console.error("No JWT token found.");
            navigate('/login');
            setLoadingFollowStatus(false);
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            if (isFollowed) {
                await axios.delete(`http://localhost:8080/api/v1/categories/${category.id}/follows`, config);
                setIsFollowed(false);
            } else {
                await axios.post(`http://localhost:8080/api/v1/categories/${category.id}/follows`, {}, config);
                setIsFollowed(true);
            }
        } catch (err) {
            console.error("Failed to follow/unfollow category.", err);
            setFollowActionError("Failed to update follow status.");
            toast.error("Failed to update follow status."); // Show error toast
        } finally {
            setLoadingFollowStatus(false);
        }
    };

    if (loadingCategory || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <Oval height={50} width={50} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={5} visible={true} />
                    <p className="text-gray-600">Loading category...</p>
                </div>
            </div>
        );
    }

    if (notFound) {
        return <CategoryNotFound />;
    }

    if (categoryError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-red-500 text-center">
                    <p>{categoryError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 max-w-[88%] mx-auto px-4 py-1 flex flex-col gap-6 overflow-x-hidden">
            <div className="relative mb-6 overflow-hidden">
                {category?.bannerUrl ? (
                    <img src={category.bannerUrl} alt="Category Banner" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded-t-lg">
                        No Banner
                    </div>
                )}

                <div className="relative p-4 flex items-center">
                    <div className="absolute -top-8 left-4 bg-gray-100 p-1 rounded-full">
                        {category?.iconUrl ? (
                            <img
                                src={category.iconUrl}
                                alt="Category Icon"
                                className="w-20 h-20 rounded-full border-1 border-white object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full border-1 border-white bg-gray-200 flex items-center justify-center text-gray-400">
                                No Icon
                            </div>
                        )}
                    </div>

                    <div className="ml-24">
                        <h1 className="text-2xl pl-2 font-semibold text-gray-900 tracking-tight">
                            {category?.name}
                        </h1>
                    </div>

                    <div className="ml-auto flex items-center">
                        <button
                            onClick={handleFollowClick}
                            disabled={loadingFollowStatus}
                            className={`${
                                isFollowed ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white text-sm font-semibold py-2 px-4 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loadingFollowStatus ? (
                                <Oval height={16} width={16} color="#fff" secondaryColor="#ffffff33" strokeWidth={5} visible={true} />
                            ) : (
                                isFollowed ? 'Following' : 'Follow'
                            )}
                        </button>

                    </div>
                </div>
            </div>

            <div className="flex gap-6 w-full">
                <div className="flex-1">
                    <div className="p-4 bg-white rounded-md border border-gray-200 text-center text-gray-500">
                        No posts yet.
                    </div>
                </div>

                <div className="w-80 flex flex-col gap-6">
                    {category && <CategoryInfoSidebar category={category} />}
                </div>
            </div>

        </div>
    );
};

export default CategoryPage;