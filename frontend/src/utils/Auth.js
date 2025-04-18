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