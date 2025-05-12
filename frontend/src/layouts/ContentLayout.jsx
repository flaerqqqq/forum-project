import SidebarMenu from "../components/SidebarMenu.jsx";  // Import SidebarMenu
import { Outlet } from 'react-router-dom'; // For rendering child routes

const Layout = () => {
    return (
        <div className="fixed gap-6">
            <div className="sticky top-6">
                <SidebarMenu />
            </div>

            <div className="flex-1 flex flex-col gap-6">
                <header className="bg-white shadow-md p-4">
                    <h1 className="text-2xl font-bold">App Header</h1>
                </header>

                <main className="p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;