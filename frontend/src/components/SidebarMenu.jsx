import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PopularCategoriesSidebar from './PopularCategoriesSidebar.jsx';
import CategoryCreateModal from "./CreateCategoryModal.jsx";
import {isAuthenticated} from "../utils/Auth.js";

const SidebarMenu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const isActive = (pathname) => location.pathname === pathname;


    return (
        // Added scrollbar-thin-light class
        <div className="sticky top-6 w-64 bg-white  px-6 py-3 overflow-y-auto max-h-[calc(100vh-3rem)] scrollbar-thin-light">

            <ul className="pt-3">
                <li>
                    <Link
                        to="/"
                        className={`flex items-center space-x-2 text-gray-darker hover:text-black p-2 transition-colors ${isActive('/') ? 'text-black font-semibold bg-gray-lighter rounded-md p-2' : ''}`}
                    >
                        <span>🏠</span>
                        <span>Home</span>
                    </Link>
                </li>
                <li>
                    <Link
                        to="/categories"
                        className={`flex items-center space-x-2 text-gray-darker hover:text-black p-2 transition-colors ${isActive('/categories') ? 'text-black font-semibold bg-gray-lighter rounded-md p-2' : ''}`}
                    >
                        <span >📂</span>
                        <span>Explore</span>
                    </Link>
                </li>
                {isAuthenticated() && (
                    <>
                        <hr className="my-4 border-border" />
                        <li>
                            <button
                                onClick={openModal}
                                className='flex items-center space-x-2 text-gray-darker hover:text-black p-2 transition-colors '
                            >
                                <span>✨</span>
                                <span className='hover:underline'>Create Category</span>
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