import React, { useState } from 'react';
import UserReports from "../components/UserReports.jsx";
import BannedUsers from "../components/BannedUsers.jsx";

const ModeratorPage = () => {
    const [activeComponent, setActiveComponent] = useState('reports');

    const renderContent = () => {
        if (activeComponent === 'reports') {
            return <UserReports />;
        } else if (activeComponent === 'bans') {
            return <BannedUsers />;
        }
        return null;
    };

    return (
        <div className="flex min-h-screen flex-col pt-8 bg-background-light-gray font-sans text-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex items-center justify-center bg-gray-light rounded-full p-1 w-fit mx-auto mb-8">
                    <button
                        onClick={() => setActiveComponent('reports')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${activeComponent === 'reports' ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                    >
                        Reports
                    </button>
                    <button
                        onClick={() => setActiveComponent('bans')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${activeComponent === 'bans' ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                    >
                        Bans
                    </button>
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default ModeratorPage;