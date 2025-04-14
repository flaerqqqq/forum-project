import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import EmailVerificationNotice from './pages/EmailVerificationNotice'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/email-verify-notice" element={<EmailVerificationNotice />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;