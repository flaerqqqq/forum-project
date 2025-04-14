import {Link, useNavigate} from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import ProfileButton from "./ProfileButton";
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
                    <ProfileButton />
                    <button onClick={handleLogout}>Logout</button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;