import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import AvatarMenu from "./AvatarMenu.jsx";
import SearchBar from "./SearchBar.jsx";
import { MessageCircle, MessageSquare, MessagesSquare, Users } from 'lucide-react';


const Header = () => {
    const auth = isAuthenticated();

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-border">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                <Link to="/" className="text-3xl font-noe-bold text-black hover:text-gray-darker transition-colors flex items-center space-x-2"> {/* Added flex and space-x-2 to align icon and text */}
                    <MessagesSquare size={30} />
                    <span>Forum</span>
                </Link>
                <SearchBar />
                <nav className="flex items-center space-x-4 sm:space-x-6">
                    {!auth ? (
                        <Link to="/login" className="text-gray-darker hover:text-black font-medium transition-colors">
                            Sign In
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