import { useNavigate } from 'react-router-dom';
import { getUsernameFromToken } from '../utils/Auth';

const ProfileButton = () => {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        const username = getUsernameFromToken();

        if (username) {
            navigate(`/users/${username}`);
        } else {
            alert("You need to log in first!");
        }
    };

    return <button onClick={handleProfileClick}>Profile</button>;
};

export default ProfileButton;