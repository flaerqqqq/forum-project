import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { useUser } from '../contexts/UserContext';
import { useModeratedCategories } from '../contexts/ModeratedCategoriesContext';
import CategoryReports from '../components/CategoryReports';
import CategoryNotFound from '../components/CategoryNotFound';
import BannedUsers from '../components/BannedUsers'; // Import BannedUsers

const CategoryModeratorPage = () => {
    const { categorySlug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { user, loading: userLoading } = useUser();
    const { moderatedCategorySlugs, loadingModeratedCategories } = useModeratedCategories();

    const [category, setCategory] = useState(null);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [categoryError, setCategoryError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const [activeView, setActiveView] = useState('reports');


    useEffect(() => {
        const fetchCategoryDetails = async () => {
            setLoadingCategory(true);
            setCategoryError(null);
            setNotFound(false);
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/categories/slug/${categorySlug}`);
                setCategory(res.data);
            } catch (error) {
                console.error("Failed to load category details:", error);
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setCategoryError('Failed to load category details.');
                }
            } finally {
                setLoadingCategory(false);
            }
        };

        if (categorySlug) {
            fetchCategoryDetails();
        }
    }, [categorySlug]);

    const isModeratorForThisCategory = !userLoading && !loadingModeratedCategories && user && (
        (Array.isArray(moderatedCategorySlugs) && moderatedCategorySlugs.includes(categorySlug))
    );
    const overallLoading = userLoading || loadingModeratedCategories || loadingCategory;

    useEffect(() => {
        scroll(0, 0);
        if (!overallLoading && !notFound && !categoryError) {
            if (!isModeratorForThisCategory) {
                console.log(`User is not a moderator for category ${categorySlug}. Redirecting.`);
                if (window.history.length > 1) {
                    navigate(-1);
                } else {
                    navigate('/');
                }
            }
        }
    }, [overallLoading, notFound, categoryError, isModeratorForThisCategory, navigate, categorySlug]);


    const renderContent = useCallback(() => {
        if (activeView === 'reports') {
            return <CategoryReports categorySlug={categorySlug} />;
        } else if (activeView === 'bans') {
            return <BannedUsers categorySlug={categorySlug} />;
        }
        return null;
    }, [activeView, categorySlug]);

    return (
        <div className="flex min-h-screen flex-col pt-8 bg-background-light-gray font-sans text-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                {isModeratorForThisCategory && !loadingCategory && !categoryError && !notFound && (
                    <div className="flex items-center justify-center bg-gray-light rounded-full p-1 w-fit mx-auto mb-8">
                        <button
                            onClick={() => setActiveView('reports')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${activeView === 'reports' ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        >
                            Reports
                        </button>
                        <button
                            onClick={() => setActiveView('bans')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${activeView === 'bans' ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        >
                            Bans
                        </button>
                    </div>
                )}

                {notFound ? (
                    <CategoryNotFound />
                ) : overallLoading ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <div className="flex flex-col items-center gap-4">
                            <Oval height={50} width={50} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} visible={true} />
                            <p className="text-gray-medium">Loading category and checking permissions...</p>
                        </div>
                    </div>
                ) : categoryError ? (
                    <div className="p-6 bg-white rounded-md shadow-md text-center text-red-600">
                        <p>{categoryError}</p>
                    </div>
                ) : isModeratorForThisCategory ? (
                    renderContent()
                ) : (
                    <div className="p-6 bg-white rounded-md shadow-md text-center text-red-600">
                        <p>You do not have permission to view this page.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default CategoryModeratorPage;