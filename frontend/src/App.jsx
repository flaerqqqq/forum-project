import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import EmailVerificationNotice from './pages/EmailVerificationNotice'
import GuestOnlyRoute from "./routes/GuestOnlyRoute";
import AuthLayout from "./layouts/AuthLayout";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AuthLayout />}>
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
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;