import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Settings from './pages/Settings';
import EmailVerificationNotice from './pages/EmailVerificationNotice'
import GuestOnlyRoute from "./routes/GuestOnlyRoute";
import MainLayout from "./layouts/MainLayout";
import UserProfile from "./pages/UserProfile";
import AuthOnlyRoute from "./routes/AuthOnlyRoute.jsx";
import {UserProvider} from "./contexts/UserContext.jsx";

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/email-verify-notice" element={<EmailVerificationNotice />} />
                        <Route path="/users/:username" element={<UserProfile />}/>
                        <Route path="/" element={<Home />}/>
                        <Route path="/settings" element={
                            <AuthOnlyRoute>
                                <Settings />
                            </AuthOnlyRoute>
                        } />
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
                    </Route>
                </Routes>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;