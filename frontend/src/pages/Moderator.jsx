import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import UserReports from "../components/UserReports.jsx";
import BannedUsers from "../components/BannedUsers.jsx"; // Import the new BannedUsers component

const ModeratorPage = () => {
    // State to handle active component/tab, default to 'reports'
    const [activeComponent, setActiveComponent] = useState('reports');

    // Function to render the active component based on state
    const renderContent = () => {
        if (activeComponent === 'reports') {
            return <UserReports />; // Render UserReports
        } else if (activeComponent === 'bans') {
            return <BannedUsers />; // Render BannedUsers
        }
        return null; // Return null if no active component is set (shouldn't happen with initial state)
    };

    return (
        <div className="flex min-h-screen flex-col pt-8 bg-background-light-gray font-sans text-black"> {/* Added flex-col and background */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full"> {/* Container for switcher */}
                {/* Switcher UI */}
                <div className="flex items-center justify-center bg-gray-light rounded-full p-1 w-fit mx-auto mb-8">
                    {/* Reports Button */}
                    <button
                        onClick={() => setActiveComponent('reports')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${activeComponent === 'reports' ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                    >
                        Reports
                    </button>
                    {/* Bans Button */}
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