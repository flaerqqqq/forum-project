import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const ModeratorOnlyRoute = ({ children }) => {
    const token = Cookies.get('token');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const roles = decoded.roles?.map(role => role.authority);

        if (roles?.includes('ROLE_MODERATOR')) {
            return children; // Authorized
        } else {
            return <Navigate to="/" replace />; // Not authorized
        }
    } catch (error) {
        console.error('Error decoding token:', error);
        return <Navigate to="/" replace />;
    }
};

export default ModeratorOnlyRoute;