import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Settings from './pages/Settings';
import EmailVerificationNotice from './pages/EmailVerificationNotice';
import GuestOnlyRoute from "./routes/GuestOnlyRoute";
import MainLayout from "./layouts/MainLayout";
import UserProfile from "./pages/UserProfile";
import AuthOnlyRoute from "./routes/AuthOnlyRoute.jsx";
import { UserProvider } from "./contexts/UserContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import 'react-toastify/dist/ReactToastify.css';
import {useState} from "react";
import Moderator from "./Moderator.jsx";
import ModeratorOnlyRoute from "./routes/ModeratorOnlyRoute.jsx"; // Don't forget to import Toastify styles

function App() {
    return (
        <ErrorBoundary>
            <UserProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<MainLayout />}>
                            <Route path="/email-verify-notice" element={<EmailVerificationNotice />} />
                            <Route path="/users/:username" element={<UserProfile />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/moderator" element={
                                <ModeratorOnlyRoute>
                                    <Moderator />
                                </ModeratorOnlyRoute>
                            } />
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
                    {/* ToastContainer to display notifications */}
                    <ToastContainer
                        position="bottom-right"
                        autoClose={3000}
                        hideProgressBar={false}
                    />
                </BrowserRouter>
            </UserProvider>
        </ErrorBoundary>
    );
}

export default App;