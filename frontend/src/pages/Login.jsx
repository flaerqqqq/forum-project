import { useState } from 'react';
import AuthInput from '../components/AuthInput';
import {loginUser} from '../services/AuthService'
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
            const res = await loginUser(form);
            const token = res.data.token;

            localStorage.setItem('jwt', token);

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.body.detail || 'Login failed');
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