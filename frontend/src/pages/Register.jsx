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
            setError("Passwords do not match.");
            return;
        }

        try {
            await registerUser(form);
            navigate('/email-verify-notice');
        } catch (err) {
            const backendMessage = err.response?.data?.body.detail || 'Registration failed.';
            setError(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="displayName"
                    placeholder="Display Name"
                    value={form.displayName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="passwordConfirm"
                    placeholder="Password Confirm"
                    value={form.passwordConfirm}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Short Description (max 250 characters)"
                    maxLength="250"
                    value={form.description}
                    onChange={handleChange}
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;