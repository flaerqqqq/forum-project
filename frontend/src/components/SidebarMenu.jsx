import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PopularCategoriesSidebar from './PopularCategoriesSidebar.jsx';
import CategoryCreateModal from "./CreateCategoryModal.jsx";
import { isAuthenticated } from "../utils/Auth.js";
// Import Lucide React icons
import { Home, Compass, PlusCircle } from 'lucide-react';


const SidebarMenu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const isActive = (pathname) => location.pathname === pathname;

    return (
        // Adjusted max-height slightly to maybe account for header height if needed
        <div className="sticky border border-b-0 border-border top-6 w-64 bg-white px-4 py-1 overflow-hidden hover:overflow-y-auto max-h-[calc(100vh-3rem)] scrollbar-thin-light">

            <ul className="pt-3">
                <li>
                    <Link
                        to="/"
                        className={`flex items-center space-x-2 text-gray-darker hover:text-black p-2 px-6 transition-colors ${isActive('/') ? 'bg-[#e5ebee] rounded-lg p-2' : 'hover:bg-[#f6f8f9] rounded-lg'}`}
                    >
                        {/* Replaced Home emoji with Lucide Home icon */}
                        <Home size={20} />
                        <span className="px-2"> Home</span>
                    </Link>
                </li>
                <li>
                    <Link
                        to="/categories"
                        className={`flex items-center space-x-2 text-gray-darker hover:text-black p-2 px-6 transition-colors ${isActive('/categories') ? 'bg-[#e5ebee] rounded-lg p-2' : ' hover:bg-[#f6f8f9] rounded-lg'}`}
                    >
                        {/* Replaced Explore emoji with Lucide Compass icon */}
                        <Compass size={20} />
                        <span className="px-2"> Explore</span>
                    </Link>
                </li>
                {isAuthenticated() && (
                    <>
                        <hr className="my-4 border-border" />
                        <li>
                            <button
                                onClick={openModal}
                                className='flex items-center space-x-2 text-gray-darker hover:text-black p-2 px-6 transition-colors '
                            >
                                {/* Replaced Create emoji with Lucide PlusCircle icon */}
                                <PlusCircle size={20} />
                                <span className='hover:underline px-2'>Create Category</span>
                            </button>
                        </li>
                    </>
                )}
            </ul>

            <hr className="my-4 border-border" />

            <PopularCategoriesSidebar />

            <hr className="my-4 border-border" />

            {isModalOpen && <CategoryCreateModal onClose={closeModal} />}
        </div>
    );
};

export default SidebarMenu;