import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { Oval } from 'react-loader-spinner';
import 'react-toastify/dist/ReactToastify.css';

const CategoryView = ({ category}) => {
    const navigate = useNavigate();
    const { user, loading: userLoading } = useUser();
    const [isFollowed, setIsFollowed] = useState(false);
    const [loadingFollowStatus, setLoadingFollowStatus] = useState(true);
    const [followActionError, setFollowActionError] = useState(null);

    useEffect(() => {
        if (userLoading || !category) {
            setLoadingFollowStatus(true);
            return;
        }

        const checkFollowStatus = async () => {
            setLoadingFollowStatus(true);
            setFollowActionError(null);

            try {
                let response;
                if (user) {
                    response = await axios.get(
                        `http://localhost:8080/api/v1/categories/${category.id}/follows/${user.publicId}`
                    );
                    setIsFollowed(true);
                } else {
                    setIsFollowed(false);
                }
            } catch (err) {
                if (err.response?.status === 400) {
                    setIsFollowed(false);
                } else {
                    console.error('Failed to fetch follow status', err);
                    setFollowActionError('Failed to fetch follow status.');
                    toast.error('Failed to fetch follow status.');
                    setIsFollowed(false);
                }
            } finally {
                setLoadingFollowStatus(false);
            }
        };

        checkFollowStatus();
    }, [category?.id, user?.publicId, userLoading, category]);

    const handleFollowClick = async (event) => {
        event.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        setLoadingFollowStatus(true);
        setFollowActionError(null);

        const token = Cookies.get('token');
        if (!token) {
            console.error('No JWT token found.');
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
            console.error('Failed to follow/unfollow category.', err);
            setFollowActionError('Failed to update follow status.');
            toast.error('Failed to update follow status.');
        } finally {
            setLoadingFollowStatus(false);
        }
    };

    const navigateToCategoryPage = () => {
        navigate(`/categories/${category.slug}`);
    };

    return (
        <div
            className={`bg-white rounded-md shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300`}
            onClick={navigateToCategoryPage}
        >
            <div className="flex p-4 space-x-4 items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {category.iconUrl ? (
                        <img
                            src={category.iconUrl || '/default-icon.png'}
                            alt="Category Icon"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-light flex items-center justify-center text-lg">
                            🏷️
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex-grow">
                        <h2 className="text-xl font-heading text-black hover:text-gray-darker transition-colors duration-300">{category.name}</h2>

                        {/* Description with fixed height for 2 lines */}
                        {/* Added h-12 (3rem) and overflow-hidden */}
                        <p className="text-gray-medium mt-1 line-clamp-2 h-12 overflow-hidden">
                            {category.description}
                        </p>

                        <p className="text-sm text-gray-medium mt-1">
                            {category.followersCount} {category.followersCount === 1 ? 'follower' : 'followers'}
                        </p>
                    </div>

                    {user && (
                        <div className={`mt-4 transition-all duration-300`}>
                            <button
                                onClick={handleFollowClick}
                                disabled={loadingFollowStatus}
                                className={`font-medium px-6 py-1 rounded-full focus:outline-none transition-colors duration-300
                                ${
                                    isFollowed
                                        ? 'bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black'
                                        : 'bg-accent-green hover:bg-green-700 text-white'
                                }`}
                            >
                                {loadingFollowStatus ? (
                                    <Oval height={16} width={16} color={isFollowed ? '#000' : '#fff'} secondaryColor={isFollowed ? '#EAEAEA' : '#ffffff33'} strokeWidth={5} visible={true} />
                                ) : (
                                    isFollowed ? 'Following' : 'Follow'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryView;