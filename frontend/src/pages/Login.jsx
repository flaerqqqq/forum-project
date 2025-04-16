import { useState } from 'react';
import { loginUser } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await loginUser(form);
            const token = res.data.token;

            Cookies.set("token", token, {
                expires: 1,
                sameSite: "strict",
            });

            navigate('/');
            window.navigation.reload();
        } catch (err) {
            setError(err.response?.data?.body.detail || 'Login failed');
        }
    };

    return (
        <div className="flex w-screen h-screen justify-center items-center bg-gray-100">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Welcome Back</h2>
                {error && <p className="text-red-600 mb-4 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                    </div>

                    <div className="mt-1">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <div className="w-5 h-5 border border-gray-300 rounded-md flex items-center justify-center transition-all duration-150 peer-focus:ring-blue-500 peer-focus:ring-2 peer-checked:bg-blue-600 peer-checked:border-transparent">
                                {showPassword && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">Show Password</span>
                        </label>
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="w-2/3 justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-3xl transition-colors"
                        >
                            Log In
                        </button>
                    </div>
                </form>

                <p className="text-sm text-center text-gray-600 mt-4">
                    Don’t have an account?{' '}
                    <a href="/register" className="text-blue-600 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}