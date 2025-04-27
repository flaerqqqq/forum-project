import { useState } from 'react';
import { Link } from 'react-router-dom';
import PopularCategoriesSidebar from './PopularCategoriesSidebar.jsx';
import CategoryCreateModal from "./CreateCategoryModal.jsx";
import {isAuthenticated} from "../utils/Auth.js";

const SidebarMenu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

    const openModal = () => setIsModalOpen(true); // Open modal
    const closeModal = () => setIsModalOpen(false); // Close modal

    return (
        <div className="sticky top-6 w-64 h-full bg-white border border-gray-200 shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Menu</h2>
            <ul className="space-y-4">
                <li>
                    <Link to="/" className="text-blue-600 hover:underline">
                        Home
                    </Link>
                </li>

                {/* Show "Explore" link only if user is authenticated */}
                <li>
                    <Link to="/categories" className="text-blue-600 hover:underline">
                        Explore
                    </Link>
                </li>

                {/* Show "Create Category" button only if user is authenticated */}
                {isAuthenticated() && (
                    <>
                        <hr />
                        <li>
                            <button
                                onClick={openModal}
                                className="text-blue-600 hover:underline"
                            >
                                Create Category
                            </button>
                        </li>
                    </>
                )}
            </ul>

            {/* Conditional Rendering of CategoryCreateModal */}
            {isModalOpen && <CategoryCreateModal onClose={closeModal} />}
            <hr />
            <PopularCategoriesSidebar />
            <hr />
        </div>
    );
};

export default SidebarMenu;