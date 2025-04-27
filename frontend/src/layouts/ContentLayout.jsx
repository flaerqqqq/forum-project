import SidebarMenu from "../components/SidebarMenu.jsx";  // Import SidebarMenu
import { Outlet } from 'react-router-dom'; // For rendering child routes

const Layout = () => {
    return (
        <div className="fixed gap-6">
            {/* Left Sidebar Menu */}
            <div className="sticky top-6">
                <SidebarMenu />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col gap-6">
                {/* You can add a global header here if needed */}
                <header className="bg-white shadow-md p-4">
                    <h1 className="text-2xl font-bold">App Header</h1>
                </header>

                {/* Render child route components */}
                <main className="p-4">
                    <Outlet />  {/* This will render the page-specific content */}
                </main>
            </div>
        </div>
    );
};

export default Layout;