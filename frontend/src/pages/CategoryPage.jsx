import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PopularCategoriesSidebar from "../components/PopularCategoriesSidebar.jsx";
import CategoryInfoSidebar from "../components/CategoryInfoSidebar.jsx";
import CategoryHeader from "../components/CategoryHeader.jsx";
import CategoryNotFound from "../components/CategoryNotFound.jsx"; // Import the Not Found page

const CategoryPage = () => {
    const { categorySlug } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false); // Track if it's 404

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/categories/slug/${categorySlug}`);
                setCategory(res.data);
            } catch (error) {
                console.error(error);
                if (error.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setError('Failed to load category details.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryDetails();
    }, [categorySlug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading category...</p>
                </div>
            </div>
        );
    }

    if (notFound) {
        return <CategoryNotFound />;
    }

    if (error) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-red-500 text-center">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 max-w-[88%] mx-auto px-4 py-1 flex flex-col gap-6 overflow-x-hidden">
            <CategoryHeader category={category} />

            <div className="flex gap-6 w-full">
                <div className="flex-1">
                    <div className="p-4 bg-white rounded-md border border-gray-200 text-center text-gray-500">
                        No posts yet.
                    </div>
                </div>

                <div className="w-80 flex flex-col gap-6">
                    <CategoryInfoSidebar category={category} />
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;