import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import defaultAvatar from '../assets/images/default-avatar.png';
import { toast } from "react-toastify";

const Settings = () => {
    const navigate = useNavigate();
    const { user, setUser, loading } = useUser();
    const [isUpdating, setIsUpdating] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [description, setDescription] = useState(user?.description || '');
    const [avatarColorClass, setAvatarColorClass] = useState('');

    if (loading) return <div>Loading...</div>;

    const getAvatarColorClass = (username) => {
        if (!username) return 'bg-gray-medium';
        const firstLetter = username.charAt(0).toUpperCase();
        const asciiCode = firstLetter.charCodeAt(0);
        const colorIndex = asciiCode % 10;

        const avatarColors = [
            'bg-accent-green',
            'bg-gray-darker',
            'bg-indigo-600',
            'bg-blue-600',
            'bg-purple-600',
            'bg-pink-600',
            'bg-teal-600',
            'bg-orange-600',
            'bg-red-600',
            'bg-gray-medium',
        ];

        return avatarColors[colorIndex];
    };

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    useEffect(() => {
        setAvatarColorClass(getAvatarColorClass(user.username));
    }, [user.username]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const response = await axios.patch(
                `http://localhost:8080/api/v1/users/${user.publicId}`,
                { displayName, description },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );
            setUser({ ...user, ...response.data });
            navigate(`/users/${user.username}`);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.body.detail || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUpdating(true);

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post(
                `http://localhost:8080/api/v1/users/${user.publicId}/avatar`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUser({ ...user, avatarUrl: response.data });
            toast.success('Avatar updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.body.detail.split(':')[1] || 'Failed to upload avatar');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-12 p-8">
            <div className="text-center mb-8">
                <div className="relative inline-block">
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt="Avatar"
                            className={`w-40 h-40 rounded-full object-cover mx-auto border-4 border-white shadow-lg cursor-pointer`}
                            onClick={() => document.getElementById('avatarInput').click()}
                        />
                    ) : (
                        <div
                            className={`w-40 h-40 rounded-full flex items-center justify-center text-white text-3xl font-bold cursor-pointer transition overflow-hidden
                            ${avatarColorClass}`}
                            onClick={() => document.getElementById('avatarInput').click()}
                        >
                            <span>{getInitials(user.displayName || user.username)}</span>
                        </div>
                    )}
                    <input
                        type="file"
                        id="avatarInput"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={isUpdating}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-lg font-medium text-gray-700">Display Name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="mt-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg px-4 py-2"
                        disabled={isUpdating}
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium text-gray-700">Bio</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg px-4 py-2"
                        disabled={isUpdating}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;