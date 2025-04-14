import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AvatarUpload = ({ username }) => {
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState(null);
    const token = Cookies.get('token');

    const handleFileChange = (e) => {
        setAvatar(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!avatar) return;

        const formData = new FormData();
        formData.append('avatar', avatar);

        try {
            await axios.post(
                `http://localhost:8080/api/v1/users/${username}/avatar`,
                formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            alert('Avatar uploaded!');
            window.location.reload(); // reload to show new avatar
        } catch (err) {
            console.error(err);
            setError('Upload failed');
        }
    };

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload Avatar</button>
        </div>
    );
};

export default AvatarUpload;