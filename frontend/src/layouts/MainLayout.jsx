import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import SidebarMenu from "../components/SidebarMenu.jsx"; // Assuming your sidebar component is called SidebarMenu

const MainLayout = () => {
    const location = useLocation();

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <>
            <div className="sticky top-0 z-40 w-full">
                <Header />
            </div>
            <main className="flex">
                {!isAuthPage && (
                    <div className="fixed top-14 left-0 h-screen w-64  bg-white shadow-md z-40">
                        <SidebarMenu />
                    </div>
                )}

                <div className={`flex-1 p-1 ${!isAuthPage ? 'ml-64' : 'ml-0'} mt-14`}>
                    <Outlet />
                </div>
            </main>
        </>
    );
};

export default MainLayout;