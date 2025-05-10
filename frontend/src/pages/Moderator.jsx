import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import UserReports from "../components/UserReports.jsx";

const ModeratorPage = () => {
    const [activeComponent, setActiveComponent] = useState('reports'); // State to handle active component

    const renderContent = () => {
        if (activeComponent === 'reports') {
            return <UserReports />; // Render UserReports for the moderator
        }
    };

    return (
        <div className="flex min-h-screen pt-8"> {/* Added padding-top to offset header */}

                {renderContent()}
        </div>
    );
};

export default ModeratorPage;