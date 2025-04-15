import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import AvatarMenu from "./AvatarMenu.jsx";

const Header = () => {
    const auth = isAuthenticated();

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                <Link to="/" className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                    🏠 Forum
                </Link>
                <nav className="flex items-center space-x-4">
                    {!auth ? (
                        <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                            Login
                        </Link>
                    ) : (
                        <AvatarMenu />
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;