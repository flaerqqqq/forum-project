import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import UserReports from "./components/UserReports.jsx";

const ModeratorPage = () => {
    const [activeComponent, setActiveComponent] = useState('reports'); // State to handle active component

    const renderContent = () => {
        if (activeComponent === 'reports') {
            return <UserReports />; // Render UserReports for the moderator
        }
    };

    return (
        <div className="flex min-h-screen pt-8"> {/* Added padding-top to offset header */}
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg p-4 fixed top-14 left-0 h-[calc(100vh-56px)] z-10">
                <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">Moderator Panel</h2>
                <nav className="space-y-4">
                    <NavLink
                        to={'/moderator'}
                        className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200"
                        onClick={() => setActiveComponent('reports')}
                    >
                        Reports
                    </NavLink>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-6 bg-gray-100"> {/* Added left margin to offset fixed sidebar */}
                {renderContent()}
            </main>
        </div>
    );
};

export default ModeratorPage;