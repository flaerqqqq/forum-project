import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'

export const isAuthenticated = () => {
    return !!Cookies.get('token');
}

export const getUsernameFromToken = () => {
    const token = Cookies.get("token");
    if (token) {
        const decoded = jwtDecode(token);
        return decoded.sub;
    }
    return null;
};

export const isModerator = () => {
    const token = Cookies.get('token');
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const roles = decoded.roles?.map(role => role.authority);
        return roles?.includes('ROLE_MODERATOR');
    } catch (error) {
        console.error('Invalid JWT in isModerator:', error);
        return false;
    }
};