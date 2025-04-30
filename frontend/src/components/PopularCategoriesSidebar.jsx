import { useEffect, useState } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';

const PopularCategoriesSidebar = () => {
    const [popularCategories, setPopularCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopularCategories = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/v1/categories', {
                    params: {
                        page: 0,
                        size: 8,
                        sort: 'followersCount,desc'
                    }
                });
                setPopularCategories(res.data.content);
            } catch (error) {
                console.error('Failed to load popular categories', error);
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
            // Styled loading state container - removed sticky, max-h, overflow, width
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
            // Styled no categories state - removed width
            <div className="py-4 bg-white rounded-lg p-4 text-gray-medium text-center mt-4">
                No popular categories found yet.
            </div>
        );
    }


    return (
        // Container - removed sticky, max-h, overflow, width
        <div className="rounded-lg ">
            <h2 className="text-xl font-heading text-black px-2 ">Categories</h2>
            <ul className="space-y-2">
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
                                <span className="font-medium text-black">c/{category.name}</span>
                                <span className="text-xs text-gray-medium">{category.followersCount} followers</span>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PopularCategoriesSidebar;