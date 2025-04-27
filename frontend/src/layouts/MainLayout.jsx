import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import SidebarMenu from "../components/SidebarMenu.jsx"; // Assuming your sidebar component is called SidebarMenu

const MainLayout = () => {
    const location = useLocation();

    // Check if the current path is one of the authentication pages
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <>
            <Header />
            <main className="flex">
                {/* Conditionally render the fixed left sidebar */}
                {!isAuthPage && (
                    <div className="fixed top-14 left-0 h-screen w-64 bg-white shadow-md z-10">
                        <SidebarMenu />
                    </div>
                )}

                {/* Main content area with padding on the left to prevent overlap */}
                <div className={`flex-1 p-1 ${!isAuthPage ? 'ml-64' : 'ml-0'} mt-14`}>
                    <Outlet />
                </div>
            </main>
        </>
    );
};

export default MainLayout;