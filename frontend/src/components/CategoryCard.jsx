import React from 'react';

const CategoryCard = ({ category }) => {
    return (
        <div className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2">
                <a
                    href={`/categories/${category.slug}`} // Link to the category page
                    target="_blank" // Opens in a new tab
                    rel="noopener noreferrer" // Security feature for opening in new tab
                    className="text-blue-500 hover:underline"
                >
                    {category.name}
                </a>
            </h3>
            <p className="text-sm text-gray-600">Slug: {category.slug}</p>
        </div>
    );
};

export default CategoryCard;