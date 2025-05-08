import {BrowserRouter, Routes, Route, ScrollRestoration} from 'react-router-dom';
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
import ModeratorOnlyRoute from "./routes/ModeratorOnlyRoute.jsx";
import CategoryPage from "./pages/CategoryPage";
import ExploreCategories from "./pages/ExploreCategories.jsx";
import CategoryModeratorsPage from "./pages/CategoryModeratorsPage.jsx";
import CreatePostPage from "./pages/CreatePostPage.jsx";
import Moderator from "./pages/Moderator.jsx";
import PostPage from "./pages/PostPage.jsx";
import UpdatePostPage from "./pages/UpdatePostPage.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import {DeletedPostsProvider} from "./contexts/DeletedPostsContext.jsx";
import {DeletedCommentsProvider} from "./contexts/DeletedCommentsContext.jsx";

function App() {
    return (
        <ErrorBoundary>
            <UserProvider>
                <DeletedCommentsProvider>
                <DeletedPostsProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<MainLayout />}>
                            <Route path="/email-verify-notice" element={<EmailVerificationNotice />} />
                            <Route path="/users/:username" element={<UserProfile />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/categories/:categorySlug" element={<CategoryPage />} />
                            <Route path="/categories" element={<ExploreCategories />} />
                            <Route path="/categories/:categorySlug/moderators" element={<CategoryModeratorsPage />} />
                            <Route path="/categories/:categorySlug/posts/:postId" element={<PostPage />} />
                            <Route path="/posts/search" element={<SearchResultsPage />} />

                            <Route path="/categories/:categorySlug/create-post" element={
                                <AuthOnlyRoute>
                                    <CreatePostPage />
                                </AuthOnlyRoute>
                            } />
                            <Route path="/categories/:categorySlug/posts/:postId/edit" element={
                                <AuthOnlyRoute>
                                    <UpdatePostPage />
                                </AuthOnlyRoute>
                            } />
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
                    <ToastContainer
                        position="bottom-right"
                        autoClose={3000}
                        hideProgressBar={false}
                    />
                </BrowserRouter>
                </DeletedPostsProvider>
                </DeletedCommentsProvider>
            </UserProvider>
        </ErrorBoundary>
    );
}

export default App;