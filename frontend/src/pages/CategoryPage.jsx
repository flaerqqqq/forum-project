import React, { useEffect, useState, useRef, useCallback } from 'react'; // Import useCallback
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from '../contexts/UserContext';
import { Oval } from 'react-loader-spinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategoryInfoSidebar from "../components/CategoryInfoSidebar.jsx";
import CategoryNotFound from "../components/CategoryNotFound.jsx";
import CategoryPosts from "../components/CategoryPosts.jsx";
import CategoryUpdateModal from '../components/CategoryUpdateModal';

const categoryPostsCache = new Map();

const CategoryPage = () => {
    const { categorySlug } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [categoryError, setCategoryError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const { user, loading: userLoading } = useUser();
    const [isFollowed, setIsFollowed] = useState(false);
    const [loadingFollowStatus, setLoadingFollowStatus] = useState(true);
    const [followActionError, setFollowActionError] = useState(null);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const saveCategoryPostsCache = useCallback((slug, sort, posts, loadedCount, scrollY, currentPage, hasMore) => {
        console.log('Saving to cache:', slug, sort, posts, loadedCount, scrollY, currentPage, hasMore);
        const key = `${slug}_${sort}`;
        categoryPostsCache.set(key, { posts, loadedCount, scrollY, currentPage, hasMore });
        console.log('Saved to cache:', key, categoryPostsCache.get(key));
    }, []);

    const getCategoryPostsCache = useCallback((slug, sort) => {
        const key = `${slug}_${sort}`;
        const cachedData = categoryPostsCache.get(key);
        console.log('Attempting to get from cache:', key, cachedData);
        return cachedData;
    }, []);

    const clearCategoryPostsCache = useCallback((slug, sort) => {
        const key = `${slug}_${sort}`;
        const deleted = categoryPostsCache.delete(key);
        console.log('Cleared cache for:', key, 'Deleted:', deleted);
    }, []);


    const fetchCategoryDetails = async () => {
        setLoadingCategory(true);
        setCategoryError(null);
        setNotFound(false);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/categories/slug/${categorySlug}`);
            setCategory(res.data);
        } catch (error) {
            console.error("Failed to load category details:", error);
            if (error.response?.status === 404) {
                setNotFound(true);
            } else {
                setCategoryError('Failed to load category details.');
                toast.error('Failed to load category details.');
            }
        } finally {
            setLoadingCategory(false);
        }
    };

    useEffect(() => {
        fetchCategoryDetails();
    }, [categorySlug]);

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
            setLoadingFollowStatus(true);
            setFollowActionError(null);

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/v1/categories/${category.id}/follows/${user.publicId}`
                );
                setIsFollowed(true);
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    setIsFollowed(false);
                } else {
                    console.error("Failed to fetch follow status", err);
                    setFollowActionError("Failed to fetch follow status.");
                    toast.error("Failed to fetch follow status.");
                    setIsFollowed(false);
                }
            } finally {
                setLoadingFollowStatus(false);
            }
        };

        checkFollowStatus();
    }, [category?.id, user?.publicId, userLoading, category]); // Depend on category and user

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
            toast.error("Failed to update follow status.");
        } finally {
            setLoadingFollowStatus(false);
        }
    };

    const handleUpdateModalClose = (updated = false) => {
        setIsUpdateModalOpen(false);
        if (updated) {
            fetchCategoryDetails();
        }
    };


    if (loadingCategory || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="flex flex-col items-center gap-4">
                    <Oval height={50} width={50} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} visible={true} />
                    <p className="text-gray-medium">Loading category...</p>
                </div>
            </div>
        );
    }

    if (notFound) {
        return <CategoryNotFound />;
    }

    if (categoryError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="text-red-600 text-center">
                    <p>{categoryError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light-gray font-sans text-black min-h-screen">
            {category?.bannerUrl ? (
                <div className="w-full h-64 overflow-hidden">
                    <img src={category.bannerUrl} alt="Category Banner" className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="w-full h-40 bg-gray-light flex items-center justify-center text-gray-medium text-lg">
                    No Banner
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-grow">
                        <div className="flex items-center mb-4">
                            {category?.iconUrl ? (
                                <img
                                    src={category.iconUrl}
                                    alt="Category Icon"
                                    className="w-16 h-16 rounded-full object-cover mr-4 border border-border"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-light flex items-center justify-center text-xl text-gray-medium mr-4 border border-border">
                                    🏷️
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-heading text-black mb-1">{category?.name}</h1>
                                <p className="text-sm text-gray-medium">
                                    {category?.followersCount} {category?.followersCount === 1 ? 'follower' : 'followers'}
                                </p>
                            </div>
                        </div>

                        {category?.description && (
                            <p className="text-gray-darker text-base mb-6">
                                {category.description}
                            </p>
                        )}

                        <div className="flex items-center gap-4 mb-8">
                            {user && (
                                <button
                                    onClick={handleFollowClick}
                                    disabled={loadingFollowStatus}
                                    className={`${
                                        isFollowed
                                            ? 'bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black'
                                            : 'bg-accent-green hover:bg-green-700 text-white'
                                    } font-medium px-4 py-2 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center`}
                                >
                                    {loadingFollowStatus ? (
                                        <Oval height={16} width={16} color={isFollowed ? '#000' : '#fff'} secondaryColor={isFollowed ? '#EAEAEA' : '#ffffff33'} strokeWidth={5} visible={true} />
                                    ) : (
                                        isFollowed ? 'Following' : 'Follow'
                                    )}
                                </button>
                            )}

                            {user && categorySlug && (
                                <Link
                                    to={`/categories/${categorySlug}/create-post`}
                                    className="bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black font-medium px-4 py-2 rounded-full transition duration-300 text-sm flex items-center justify-center gap-1 hover:no-underline"
                                >
                                    + Create Post
                                </Link>
                            )}

                            {user?.publicId === category?.creatorId && (
                                <button
                                    onClick={() => setIsUpdateModalOpen(true)}
                                    className="bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black font-medium px-4 py-2 rounded-full transition duration-300 text-sm flex items-center justify-center gap-1"
                                >
                                    Update category
                                </button>
                            )}
                        </div>

                        <CategoryPosts
                            categorySlug={categorySlug}
                            saveCategoryPostsCache={saveCategoryPostsCache}
                            getCategoryPostsCache={getCategoryPostsCache}
                            clearCategoryPostsCache={clearCategoryPostsCache}
                        />

                    </div>

                    <div className="w-80 flex-shrink-0 sticky top-16 self-start">
                        {category && <CategoryInfoSidebar category={category} />}
                    </div>
                </div>
            </div>

            {isUpdateModalOpen && category && (
                <CategoryUpdateModal
                    category={category}
                    onClose={handleUpdateModalClose}
                />
            )}

        </div>
    );
};

export default CategoryPage;