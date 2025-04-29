import { useState } from 'react';
import { loginUser } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await loginUser(form);
            const token = res.data.token;

            Cookies.set("token", token, {
                expires: 1,
                sameSite: "strict",
            });

            navigate('/');
            window.location.reload();
        } catch (error) {
            const errorMessage = error.response?.data?.body?.detail || 'Error while logging in. Please try again.';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="flex w-[99.99%] h-screen[99.99%] py-20 justify-center items-center bg-background-light-gray font-sans text-black overflow-hidden">
            {/* Medium-like card container */}
            <div className="bg-white w-full max-w-md rounded-md shadow-sm p-8 overflow-hidden">
                {/* Heading */}
                <h2 className="text-2xl font-heading text-black mb-6 text-center">Welcome Back</h2>

                <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-darker mb-1">Username</label> {/* Styled label */}
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            // Styled input
                            className="w-full p-2 border border-border rounded-md focus:outline-none focus:border-black text-gray-darker bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-darker mb-1">Password</label> {/* Styled label */}
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            // Styled input
                            className="w-full p-2 border border-border rounded-md focus:outline-none focus:border-black text-gray-darker bg-white"
                        />
                    </div>
                    <div className="mt-1">
                        <label className="flex items-center cursor-pointer text-sm text-gray-darker"> {/* Styled label */}
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            {/* Styled checkbox */}
                            <div className="w-5 h-5 border border-border rounded-sm flex items-center justify-center transition-all duration-150 peer-focus:ring-black peer-focus:ring-1 peer-checked:bg-accent-green peer-checked:border-transparent">
                                {showPassword && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span className="ml-2">Show Password</span>
                        </label>
                    </div>
                    <div className="flex justify-center mt-6"> {/* Added top margin */}
                        <button
                            type="submit"
                            // Styled button
                            className="w-full justify-center bg-accent-green hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            Log In
                        </button>
                    </div>
                </form>
                {/* Sign up link */}
                <p className="text-sm text-center text-gray-darker mt-6"> {/* Styled text and margin */}
                    Don't have an account?{' '}
                    <a href="/register" className="text-accent-green hover:underline"> {/* Styled link */}
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}