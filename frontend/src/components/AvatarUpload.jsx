import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {toast} from "react-toastify";

const AvatarUpload = ({ username }) => {
    const [avatar, setAvatar] = useState(null);
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
            toast.success('Avatar uploaded successfully!');
            window.location.reload();
        } catch (err) {
           toast.error(err.response?.data?.body.detail || 'Failed to upload avatar!');
        }
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload Avatar</button>
        </div>
    );
};

export default AvatarUpload;