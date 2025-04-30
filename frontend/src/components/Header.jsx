import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import AvatarMenu from "./AvatarMenu.jsx"; // Assuming AvatarMenu is styled separately

const Header = () => {
    const auth = isAuthenticated();

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-border"> {/* Use white background and defined border color */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between"> {/* Adjust max-width slightly, keep height and flex properties */}
                {/* Logo/Site Title - Use a font that fits the theme */}
                <Link to="/" className="text-3xl font-noe-bold text-black hover:text-gray-darker transition-colors"> {/* Use heading font, black color, subtle hover */}
                    Forum
                </Link>
                <nav className="flex items-center space-x-4 sm:space-x-6"> {/* Adjust spacing */}
                    {!auth ? (
                        // Login Link - Style subtly
                        <Link to="/login" className="text-gray-darker hover:text-black font-medium transition-colors"> {/* Use a dark gray, subtle hover */}
                            Sign In
                        </Link>
                    ) : (
                        // Avatar Menu - Assuming it's styled internally
                        <AvatarMenu />
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;