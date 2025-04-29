import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/AuthService';
import { toast } from "react-toastify";

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        displayName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        description: '',
    });
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);

    if (error) {
        throw error;
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (form.password !== form.passwordConfirm) {
            toast.error('Passwords do not match.');
            return;
        }

        try {
            await registerUser(form);
            navigate('/email-verify-notice', { state: { fromRegister: true } });
        } catch (err) {
            const backendMessage = err.response?.data?.body.detail || 'Registration failed.';
            toast.error(backendMessage);
        }
    };

    return (
        // Main page container with flex layout
        // This div will contain the sidebar (if present) and the main content area
        <div className="flex w-[99.99%] pt-6 bg-background-light-gray font-sans text-black">

            {/*
                Sidebar placeholder:
                If you have a sidebar component with w-64, place it here.
                Example: <div className="w-64 bg-gray-200 flex-shrink-0">Your Sidebar Content</div>
                The flex layout of the parent div will automatically position it on the left.
            */}

            {/* Main content area - takes remaining width and centers its content */}
            {/* flex-grow makes this div take up all space not used by the sidebar */}
            {/* flex justify-center items-center centers the content (the form container) within this area */}
            <div className="flex-grow flex justify-center items-center "> {/* Added py-8 for vertical spacing */}
                {/* Form container - remains centered within the flex-grow area */}
                <div className="bg-white w-full max-w-md rounded-md shadow-sm p-8">
                    <h2 className="text-2xl font-heading text-black mb-6 text-center">Join the Forum Community</h2>

                    {step === 1 && (
                        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-darker mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border border-border rounded-md focus:outline-none focus:border-black text-gray-darker bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-darker mb-1">Profile Name</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={form.displayName}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border border-border rounded-md focus:outline-none focus:border-black text-gray-darker bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-darker mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border border-border rounded-md focus:outline-none focus:border-black text-gray-darker bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-darker mb-1">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border border-border rounded-md focus:outline-none focus:border-black text-gray-darker bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-darker mb-1">Confirm Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="passwordConfirm"
                                    value={form.passwordConfirm}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border border-border rounded-md focus:outline-none focus:border-black text-gray-darker bg-white"
                                />
                            </div>
                            <div className="mt-1">
                                <label className="flex items-center cursor-pointer text-sm text-gray-darker">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={showPassword}
                                        onChange={() => setShowPassword(!showPassword)}
                                    />
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
                            <div className="flex justify-center mt-6">
                                <button
                                    type="submit"
                                    className="w-full justify-center bg-accent-green hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                >
                                    Continue
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-darker mb-1">Short description about yourself</label>
                                <textarea
                                    name="description"
                                    placeholder="(Max 250 characters)"
                                    maxLength="250"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-border rounded-md focus:outline-none focus:border-black text-gray-darker bg-white min-h-[100px]"
                                />
                            </div>

                            <div className="flex justify-center mt-6">
                                <button
                                    type="submit"
                                    className="w-full justify-center bg-accent-green hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                >
                                    Complete Registration
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="text-sm text-center text-gray-darker mt-6">
                        Already have an account?{' '}
                        <a href="/login" className="text-accent-green hover:underline">
                            Log in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;