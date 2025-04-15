import {Link} from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import AvatarMenu from "./AvatarMenu.jsx";

const Header = () => {
    const auth = isAuthenticated();

    return (
        <header className="header">
            <Link to="/">🏠 Forum</Link>
            <nav>
                {!auth ? (
                    <Link to="/login">Login</Link>
                ) : (
                    <>
                    <AvatarMenu />
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;