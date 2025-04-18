import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'

export const isAuthenticated = () => {
    return !!Cookies.get('token');
}

export const getUsernameFromToken = () => {
    const token = Cookies.get("token"); // Retrieve the token from cookies
    if (token) {
        const decoded = jwtDecode(token);  // Decode the token
        return decoded.sub;           // Assuming 'username' is part of the decoded token
    }
    return null;
};