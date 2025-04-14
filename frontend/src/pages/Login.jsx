import { useState } from 'react';
import AuthInput from '../components/AuthInput';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('http://localhost:8080/api/v1/auth/login', form);
            const token = res.data.token;

            // Save token to localStorage or context
            localStorage.setItem('jwt', token);

            // Navigate to homepage or dashboard
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <AuthInput
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                />
                <AuthInput
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
}