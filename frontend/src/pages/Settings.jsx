import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import defaultAvatar from '../assets/images/default-avatar.png';

const Settings = () => {
    const navigate = useNavigate();
    const { user, setUser, loading } = useUser();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [description, setDescription] = useState(user?.description || '');

    if (loading) return <div>Loading...</div>;

    if (error) {
        throw error;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setError(null);

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
        } catch (err) {
            setError(new Error(err.response?.data?.body.detail.split(':')[1] || 'Failed to update profile'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUpdating(true);
        setError(null);

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
        } catch (err) {
            setError(new Error(err.response?.data?.body.detail.split(':')[1] || 'Failed to upload avatar'));
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <img
                                            src={user.avatarUrl || defaultAvatar}
                                            alt="Avatar"
                                            className="w-32 h-32 rounded-full object-cover"
                                        />
                                        <label className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2 cursor-pointer hover:bg-gray-700">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                disabled={isUpdating}
                                            />
                                            📷
                                        </label>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            disabled={isUpdating}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Bio
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            disabled={isUpdating}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;