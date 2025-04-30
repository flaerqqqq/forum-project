import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import defaultAvatar from "../assets/images/default-avatar.png";
import { Oval } from "react-loader-spinner";
import AddModeratorModal from "../components/AddModeratorModal";
import CategoryNotFound from "../components/CategoryNotFound";

const PAGE_SIZE = 10;

const CategoryModeratorsPage = () => {
    const { categorySlug } = useParams();
    const { user, loading: userLoading } = useUser();
    const [category, setCategory] = useState(null);
    const [moderators, setModerators] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isAddModeratorModalOpen, setIsAddModeratorModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [categoryError, setCategoryError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const navigate = useNavigate();
    const observer = useRef();

    const getAvatarColorClass = (username) => {
        if (!username) return 'bg-gray-medium';
        const firstLetter = username.charAt(0).toUpperCase();
        const asciiCode = firstLetter.charCodeAt(0);
        const colorIndex = asciiCode % 10;
        const avatarColors = [
            'bg-accent-green', 'bg-gray-darker', 'bg-indigo-600', 'bg-blue-600', 'bg-purple-600',
            'bg-pink-600', 'bg-teal-600', 'bg-orange-600', 'bg-red-600', 'bg-gray-medium',
        ];
        return avatarColors[colorIndex];
    };

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };


    const lastModeratorRef = useCallback((node) => {
        if (loading || initialLoading || refreshKey > 0 && page === 0) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage((prev) => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, initialLoading, hasMore, refreshKey, page]);

    useEffect(() => {
        if (userLoading) return;

        const fetchCategory = async () => {
            setInitialLoading(true);
            setCategoryError(null);
            setNotFound(false);
            setCategory(null);

            try {
                const categoryRes = await axios.get(`http://localhost:8080/api/v1/categories/slug/${categorySlug}`);
                setCategory(categoryRes.data);
            } catch (err) {
                console.error("Failed to load category:", err);
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setCategoryError("Failed to load category details.");
                    toast.error("Failed to load category details.");
                }
                setInitialLoading(false);
            }
        };

        fetchCategory();
    }, [categorySlug, userLoading]);

    useEffect(() => {
        if (!category) {
            if (!initialLoading && !notFound && !categoryError) {
                console.warn("Moderator fetch effect ran before category was loaded without error/404 state.");
            }
            return;
        }

        const fetchModerators = async () => {

            try {
                const res = await axios.get(`http://localhost:8080/api/v1/categories/${category.id}/moderators`, {
                    params: { page, size: page === 0 ? 11 : PAGE_SIZE },
                });

                const moderatorsWithUserDto = res.data.content;

                setModerators((prev) => (page === 0 ? moderatorsWithUserDto : [...prev, ...moderatorsWithUserDto]));

                setHasMore(moderatorsWithUserDto.length === (page === 0 ? 11 : PAGE_SIZE));


            } catch (err) {
                console.error("Failed to load moderators:", err);
                toast.error("Failed to load moderators.");
                setHasMore(false);
                if (page === 0) {
                    setModerators([]);
                }
            } finally {
                if (page === 0) setInitialLoading(false);
                setLoading(false);
            }
        };

        fetchModerators();
    }, [category, page, refreshKey, initialLoading, notFound, categoryError]);

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleRemoveModerator = async (userId) => {
        const token = Cookies.get("token");

        try {
            await axios.delete(
                `http://localhost:8080/api/v1/categories/${category.id}/moderators/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Moderator removed.");
            setPage(0);
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to remove moderator.");
        }
    };


    if (notFound) {
        return <CategoryNotFound />;
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="flex flex-col items-center gap-4">
                    <Oval height={50} width={50} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible={true} />
                    <p className="text-gray-medium">Loading category and moderators...</p>
                </div>
            </div>
        );
    }

    if (categoryError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light-gray">
                <div className="text-red-600 text-center mt-8">
                    <p>{categoryError}</p>
                </div>
            </div>
        );
    }


    const isOwner = user && user.publicId === category?.creatorId;

    const uniqueModeratorsMap = new Map();
    moderators.forEach((mod) => {
        const userId = mod.userDto.publicId;
        if (!uniqueModeratorsMap.has(userId)) {
            uniqueModeratorsMap.set(userId, mod);
        } else {
            const existing = uniqueModeratorsMap.get(userId);
            if (mod.role === "OWNER" && existing.role !== "OWNER") {
                uniqueModeratorsMap.set(userId, mod);
            }
        }
    });

    const uniqueModerators = Array.from(uniqueModeratorsMap.values());
    const filteredModerators = uniqueModerators.filter((mod) =>
        mod.userDto?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-background-light-gray font-sans text-black min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-heading text-black mb-8">
                    Moderators of {category?.name || 'Category'}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search moderators..."
                        className="flex-grow border border-border p-2 rounded-md focus:outline-none focus:border-black text-gray-darker"
                    />

                    {isOwner && (
                        <button
                            onClick={() => setIsAddModeratorModalOpen(true)}
                            className="bg-accent-green text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex-shrink-0"
                        >
                            Add Moderator
                        </button>
                    )}
                </div>

                {/* Header for Moderators List */}
                <div className="flex items-center justify-between px-4 pb-2 mb-2 border-b border-border text-gray-darker text-sm font-semibold">
                    <div className="flex-grow">Username</div>
                    {/* Added pr-4 here to match the list item date padding */}
                    <div className="w-40 text-right pr-4">Joined At</div>
                    <div className="flex-shrink-0 ml-4 w-20"></div> {/* Placeholder column for Remove button */}
                </div>

                <ul className="space-y-2 mt-6">
                    {filteredModerators.length > 0 ? (
                        filteredModerators.map((moderator, index) => (
                            <li
                                key={moderator.id || moderator.userDto?.publicId}
                                ref={index === filteredModerators.length - 1 ? lastModeratorRef : null}
                                className="flex items-center justify-between p-4 border-none hover:bg-gray-lighter transition duration-300 group rounded-md"
                            >
                                <div className="flex items-center gap-4 flex-grow">
                                    <a href={`/users/${moderator.userDto?.username}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                        {moderator.userDto?.avatarUrl ? (
                                            <img
                                                src={moderator.userDto.avatarUrl}
                                                alt={moderator.userDto?.username}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full ${getAvatarColorClass(moderator.userDto?.username)} flex items-center justify-center text-sm text-white font-semibold`}>
                                                {getInitials(moderator.userDto?.displayName || moderator.userDto?.username)}
                                            </div>
                                        )}
                                    </a>
                                    <div className="flex flex-col">
                                        <a
                                            href={`/users/${moderator.userDto?.username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-black font-semibold hover:underline"
                                        >
                                            {moderator.userDto?.displayName || moderator.userDto?.username}
                                        </a>
                                        {moderator.role === "OWNER" ? (
                                            <span className="text-xs font-semibold text-gray-darker">Owner</span>
                                        ) : (
                                            <span className="text-xs font-semibold text-gray-darker">Moderator</span>
                                        )}
                                    </div>
                                </div>
                                {/* Joined Date Column */}
                                <div className="w-40 text-gray-darker text-sm flex-shrink-0 text-right ">
                                    {moderator.assignedAt ? new Date(moderator.assignedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </div>
                                {/* Remove Button Column - Always render this container */}
                                <div className="flex-shrink-0 ml-4 w-20 flex justify-end items-center">
                                    {/* Conditionally render the button inside */}
                                    {isOwner && moderator.userDto?.publicId !== user?.publicId && (
                                        <button
                                            onClick={() => handleRemoveModerator(moderator.userDto?.publicId)}
                                            className={`font-medium px-3 py-1 rounded-full focus:outline-none transition-colors duration-300 opacity-0 group-hover:opacity-100
                                                    bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black `}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))
                    ) : (
                        !loading && <div className="text-gray-medium text-center mt-8">{searchQuery ? `No moderators found matching "${searchQuery}"` : "No moderators found for this category."}</div>
                    )}
                </ul>

                {loading && page > 0 && (
                    <div className="flex justify-center mt-4">
                        <Oval height={30} width={30} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible={true} />
                    </div>
                )}
            </div>

            {isAddModeratorModalOpen && (
                <AddModeratorModal
                    categoryId={category?.id}
                    onClose={() => setIsAddModeratorModalOpen(false)}
                    onModeratorAdded={() => {
                        setPage(0);
                        setRefreshKey(prev => prev + 1);
                        setIsAddModeratorModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default CategoryModeratorsPage;