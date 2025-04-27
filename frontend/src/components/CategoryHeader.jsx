import { Link } from 'react-router-dom';

const CategoryHeader = ({ category }) => {
    if (!category) {
        return null;
    }

    return (
        <div className="relative mb-6 overflow-hidden">
            {/* Banner */}
            {category.bannerUrl ? (
                <img
                    src={category.bannerUrl}
                    alt="Category Banner"
                    className="w-full h-32 object-cover rounded-lg"
                />
            ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded-t-lg">
                </div>
            )}

            {/* White background block under the banner */}
            <div className="relative p-4 flex items-center  ">
                {/* Icon */}
                <div className="absolute -top-8 left-4 bg-gray-100 p-1 rounded-full">
                    {category.iconUrl ? (
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

                {/* Name and followers */}
                <div className="ml-24">
                    <h1 className="text-2xl pl-2 font-semibold text-gray-900 tracking-tight">
                        {category.name}
                    </h1>
                </div>

                {/* Follow button */}
                <div className="ml-auto">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-full transition duration-300">
                        Follow
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryHeader;