import { useEffect, useState } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';

const popularCategoriesCache = {};
const CACHE_KEY = 'popular_categories';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const PopularCategoriesSidebar = () => {
    const [popularCategories, setPopularCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopularCategories = async () => {
            setLoading(true);
            const cachedData = popularCategoriesCache[CACHE_KEY];
            const now = Date.now();

            if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
                setPopularCategories(cachedData.data);
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get('http://localhost:8080/api/v1/categories', {
                    params: {
                        page: 0,
                        size: 8,
                        sort: 'followersCount,desc'
                    }
                });
                const categoriesData = res.data.content;
                setPopularCategories(categoriesData);
                popularCategoriesCache[CACHE_KEY] = {
                    data: categoriesData,
                    timestamp: now
                };
            } catch (error) {
                console.error('Failed to load popular categories', error);
                toast.error('Failed to load popular categories.');
                setPopularCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularCategories();
    }, []);

    const handleCategoryClick = (slug) => {
        window.location.href = `/categories/${slug}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-6 bg-white rounded-lg mt-4">
                <Oval
                    height={40}
                    width={40}
                    color="#1A8917"
                    secondaryColor="#EAEAEA"
                    strokeWidth={4}
                    visible={true}
                />
            </div>
        );
    }

    if (popularCategories.length === 0) {
        return (
            <div className="py-4 bg-white rounded-lg p-4 text-gray-medium text-center mt-4">
                No popular categories found yet.
            </div>
        );
    }


    return (
        <div className="rounded-lg ">
            <h2 className="text-xl font-heading text-black px-2 ">Popular</h2>
            <ul className="space-y-1">
                {popularCategories.map(category => (
                    <li key={category.id}>
                        <button
                            onClick={() => handleCategoryClick(category.slug)}
                            className="w-full flex items-center space-x-3 text-left text-gray-darker hover:text-black hover:bg-gray-lighter rounded-md transition-colors px-1 py-1.5"
                        >
                            {category.iconUrl ? (
                                <img
                                    src={category.iconUrl}
                                    alt={category.name}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-light flex items-center justify-center text-sm flex-shrink-0">
                                    🏷️
                                </div>
                            )}
                            <div className="flex flex-col flex-grow">
                                <span className="text-sm font-sans text-black">c/{category.name}</span>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PopularCategoriesSidebar;