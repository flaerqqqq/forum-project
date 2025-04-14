import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import EmailVerificationNotice from './pages/EmailVerificationNotice'
import GuestOnlyRoute from "./routes/GuestOnlyRoute.js";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={
                    <GuestOnlyRoute>
                        <Register />
                    </GuestOnlyRoute>
                } />
                <Route path="/login" element={
                    <GuestOnlyRoute>
                        <Login />
                    </GuestOnlyRoute>
                } />
                <Route path="/email-verify-notice" element={<EmailVerificationNotice />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;