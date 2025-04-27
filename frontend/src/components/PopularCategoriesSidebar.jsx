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
        // Full page reload using window.location.href
        window.location.href = `/categories/${slug}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center w-56 h-20 sticky top-20 bg-white rounded-lg">
                <Oval
                    height={40}
                    width={40}
                    color="#3b82f6"
                    secondaryColor="#dbeafe"
                    strokeWidth={4}
                    visible={true}
                />
            </div>
        );
    }

    return (
        <div className="w-56 py-4 sticky top-20 rounded-lg max-h-[calc(100vh-4rem)] overflow-y-auto bg-white">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul className="space-y-4">
                {popularCategories.map(category => (
                    <li key={category.id}>
                        <button
                            onClick={() => handleCategoryClick(category.slug)} // Trigger page reload here
                            className="w-full flex items-center space-x-3 text-left hover:underline text-gray-700"
                        >
                            {category.iconUrl ? (
                                <img
                                    src={category.iconUrl}
                                    alt={category.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                                    🏷️
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="font-medium">c/{category.name}</span>
                                <span className="text-xs text-gray-500">{category.followersCount} followers</span>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PopularCategoriesSidebar;