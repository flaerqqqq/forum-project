import {Link, useNavigate} from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import Cookies from 'js-cookie';

const Header = () => {
    const auth = isAuthenticated();
    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove('token');

        navigate('/login')
    }

    return (
        <header className="header">
            <Link to="/">🏠 Forum</Link>
            <nav>
                {!auth ? (
                    <Link to="/login">Login</Link>
                ) : (
                    <>
                    <Link to="/users/me">Profile</Link> // Or the logged-in user's ID
                    <button onClick={handleLogout()}>Logout</button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;