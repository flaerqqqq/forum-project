import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import defaultAvatar from "../assets/images/default-avatar.png";
import { Oval } from "react-loader-spinner";
import AddModeratorModal from "../components/AddModeratorModal"; // <-- import your modal

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
    const navigate = useNavigate();
    const observer = useRef();

    const lastModeratorRef = useCallback((node) => {
        if (loading || initialLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage((prev) => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, initialLoading, hasMore]);

    useEffect(() => {
        if (userLoading) return;

        const fetchCategory = async () => {
            try {
                const categoryRes = await axios.get(`http://localhost:8080/api/v1/categories/slug/${categorySlug}`);
                setCategory(categoryRes.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load category.");
            }
        };

        fetchCategory();
    }, [categorySlug, userLoading]);

    useEffect(() => {
        if (!category) return;

        const fetchModerators = async () => {
            if (page === 0) setInitialLoading(true);
            else setLoading(true);

            try {
                const res = await axios.get(`http://localhost:8080/api/v1/categories/${category.id}/moderators`, {
                    params: { page, size: PAGE_SIZE },
                });

                const moderatorsWithUserDto = res.data.content;

                setModerators((prev) => (page === 0 ? moderatorsWithUserDto : [...prev, ...moderatorsWithUserDto]));
                setHasMore(!res.data.last);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load moderators.");
                setHasMore(false);
            } finally {
                if (page === 0) setInitialLoading(false);
                else setLoading(false);
            }
        };

        fetchModerators();
    }, [category, page]);

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
            setPage(0); // reload moderators
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to remove moderator.");
        }
    };

    if (initialLoading && !category) {
        return (
            <div className="flex justify-center items-center h-64">
                <Oval height={50} width={50} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={4} visible={true} />
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
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Moderators of {category?.name}</h1>

            {/* Search Bar */}
            <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search moderators..."
                className="w-full border p-2 rounded-md mb-6"
            />

            {/* Add Moderator */}
            {isOwner && (
                <div className="mb-6">
                    <button
                        onClick={() => setIsAddModeratorModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add Moderator
                    </button>
                </div>
            )}

            {/* Moderators List */}
            <ul className="space-y-4">
                {filteredModerators.length > 0 ? (
                    filteredModerators.map((moderator, index) => (
                        <li
                            key={moderator.id}
                            ref={index === filteredModerators.length - 1 ? lastModeratorRef : null}
                            className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-100 transition duration-300 group"
                        >
                            <div className="flex items-center gap-4">
                                <a href={`/users/${moderator.userDto?.username}`} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={moderator.userDto?.avatarUrl || defaultAvatar}
                                        alt={moderator.userDto?.username}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                </a>
                                <div className="flex flex-col">
                                    <a
                                        href={`/users/${moderator.userDto?.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg font-medium text-blue-600 hover:underline"
                                    >
                                        {moderator.userDto?.username}
                                    </a>
                                    {moderator.role === "OWNER" && (
                                        <span className="text-xs font-semibold text-orange-600">Owner</span>
                                    )}
                                </div>
                            </div>
                            {isOwner && moderator.userDto?.publicId !== user?.publicId && (
                                <button
                                    onClick={() => handleRemoveModerator(moderator.userDto?.publicId)}
                                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition duration-200"
                                >
                                    Remove
                                </button>
                            )}
                        </li>
                    ))
                ) : (
                    <div>No moderators found.</div>
                )}
            </ul>

            {/* Pagination Spinner */}
            {loading && (
                <div className="flex justify-center mt-4">
                    <Oval height={30} width={30} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={4} visible={true} />
                </div>
            )}

            {/* AddModerator Modal */}
            {isAddModeratorModalOpen && (
                <AddModeratorModal
                    categoryId={category?.id}
                    onClose={() => setIsAddModeratorModalOpen(false)}
                    onModeratorAdded={() => {
                        setPage(0);
                        setIsAddModeratorModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default CategoryModeratorsPage;