import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { useUser } from '../contexts/UserContext';
import { useModeratedCategories } from '../contexts/ModeratedCategoriesContext';
import { isModerator as isGlobalModerator } from '../utils/Auth'; // Rename global moderator check
import CategoryReports from '../components/CategoryReports'; // Import the CategoryReports component
import CategoryNotFound from '../components/CategoryNotFound'; // Import CategoryNotFound for 404 cases

const CategoryModeratorPage = () => {
    const { categorySlug } = useParams(); // Get the category slug from the URL
    const navigate = useNavigate(); // Initialize useNavigate
    const location = useLocation(); // Initialize useLocation for history check

    const { user, loading: userLoading } = useUser(); // Get authenticated user and loading state
    // Get the list of moderated category slugs and loading state from context
    const { moderatedCategorySlugs, loadingModeratedCategories } = useModeratedCategories();

    const [category, setCategory] = useState(null); // State for the category details
    const [loadingCategory, setLoadingCategory] = useState(true); // State for loading category details
    const [categoryError, setCategoryError] = useState(null); // State for category fetch errors
    const [notFound, setNotFound] = useState(false);


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
    }, [overallLoading, notFound, categoryError, isModeratorForThisCategory, navigate]);


    if (notFound) {
        return <CategoryNotFound />;
    }

    // Handle loading state
    if (overallLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="flex flex-col items-center gap-4">
                    <Oval height={50} width={50} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} visible={true} />
                    <p className="text-gray-medium">Loading category and checking permissions...</p>
                </div>
            </div>
        );
    }

    // Handle category fetch error (if not a 404, which is handled by notFound)
    if (categoryError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="p-6 bg-white rounded-md shadow-md text-center text-red-600">
                    <p>{categoryError}</p>
                </div>
            </div>
        );
    }

    return (
        isModeratorForThisCategory && !loadingCategory && !categoryError && !notFound && !overallLoading && (
            <div className="flex min-h-screen pt-8"> {/* Added padding-top to offset header */}
                <CategoryReports categorySlug={categorySlug} />
            </div>
            )
    );
};

export default CategoryModeratorPage;