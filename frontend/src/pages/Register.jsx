import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/AuthService';

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
            setError(new Error('Passwords do not match.'));
            return;
        }

        try {
            await registerUser(form);
            navigate('/email-verify-notice', { state: { fromRegister: true } });
        } catch (err) {
            const backendMessage = err.response?.data?.body.detail || 'Registration failed.';
            setError(new Error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage));
        }
    };

    return (
        <div className="flex w-screen h-screen justify-center items-center bg-gray-100">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Join the Forum Community</h2>

                {step === 1 && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name</label>
                            <input
                                type="text"
                                name="displayName"
                                value={form.displayName}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="passwordConfirm"
                                value={form.passwordConfirm}
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
                                Continue
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short description about yourself</label>
                            <textarea
                                name="description"
                                placeholder="(Max 250 characters)"
                                maxLength="250"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            />
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="w-2/3 justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-3xl transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </form>
                )}

                <p className="text-sm text-center text-gray-600 mt-4">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;