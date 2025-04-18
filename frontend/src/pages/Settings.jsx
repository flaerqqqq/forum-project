import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Settings = () => {
    const [user, setUser] = useState({
        publicId: '',
        username: '',
        displayName: '',
        description: '',
        avatarUrl: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch user data
    const token = Cookies.get("token");
    const username = token ? jwtDecode(token).sub : null;

    useEffect(() => {
        if (username) {
            axios.get(`http://localhost:8080/api/v1/users/${username}`)
                .then(response => {
                    setUser(response.data);
                })
                .catch(err => {
                    setError('Failed to load user data.');
                });
        }
    }, [username]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value,
        });
    };

    const handleAvatarUpload = async () => {
        if (!avatar) return true; // Skip if no new avatar selected

        const formData = new FormData();
        formData.append("avatar", avatar);

        try {
            await axios.post(
                `http://localhost:8080/api/v1/users/${user.publicId}/avatar`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return true;
        } catch (err) {
            setError(err.response?.data?.body?.detail || 'Failed to upload avatar!');
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const avatarUploaded = await handleAvatarUpload();
        if (!avatarUploaded) {
            setLoading(false);
            return;
        }

        const payload = {
            displayName: user.displayName,
            description: user.description
        };

        try {
            const res = await axios.patch(
                `http://localhost:8080/api/v1/users/${user.publicId}`,
                JSON.stringify(payload),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            setUser(res.data);
            navigate(`/users/${user.username}`);
            window.location.reload();
        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setAvatar(e.target.files[0]);
        const reader = new FileReader();
        reader.onloadend = () => setFile(reader.result);
        if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
    };

    return (
        <div className="w-screen bg-gray-100 min-h-screen">
            {/* Header */}

            <div className="max-w-3xl pt-[90px] mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Link to={`/users/${user.username}`} className="text-3xl font-bold text-blue-600">{`@${user.username}`}</Link>
                    </div>
                </div>

                {/* Error */}
                {error && <div className="text-red-500 text-center mb-4">{error}</div>}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 space-y-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mt-2">Profile</h1>
                    {/* Display Name */}
                    <div>
                        <label className="block text-base font-medium text-black" htmlFor="displayName">
                            Profile Name
                        </label>
                        <input
                            id="displayName"
                            name="displayName"
                            type="text"
                            value={user.displayName}
                            onChange={handleChange}
                            className="mt-2 px-2 py-1 w-full border border-gray-300 text-black bg-white rounded-md focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-base font-medium text-black" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={user.description}
                            onChange={handleChange}
                            className="mt-2 px-2 py-1 w-full border border-gray-300 bg-white text-black rounded-md focus:ring-2 focus:ring-blue-500 transition"
                            rows="2"
                        />
                    </div>

                    {/* Avatar */}
                    <div>
                        <label className="block text-base font-medium text-black" htmlFor="avatar">
                            Profile image
                        </label>
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition"
                        />
                        {file && (
                            <div className="mt-4">
                                <h3 className="text-black text-base text-bold">Image Preview:</h3>
                                <img src={file} alt="Avatar Preview" className="w-32 h-32 object-cover rounded-full mt-2" />
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;