import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const Header = () => {
    const auth = isAuthenticated();

    return (
        <header className="header">
            <Link to="/">🏠 Forum</Link>
            <nav>
                {!auth ? (
                    <Link to="/login">Login</Link>
                ) : (
                    <Link to="/users/me">Profile</Link> // Or the logged-in user's ID
                )}
            </nav>
        </header>
    );
};

export default Header;