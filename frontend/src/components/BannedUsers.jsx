import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import BannedUserItem from './BannedUserItem.jsx';
import ManageBanModal from './ManageBanModal.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PAGE_SIZE = 10;
const MIN_LOADING_TIME = 300;
const SCROLL_THRESHOLD = 500;

const NOT_FOUND_ERROR_MESSAGE = "No banned users found matching the criteria.";

const BannedUsers = () => {
    const [bannedUsers, setBannedUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchUsernameInput, setSearchUsernameInput] = useState('');
    const [searchUsernameQuery, setSearchUsernameQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [showManageBanModal, setShowManageBanModal] = useState(false);
    const [banDataToManage, setBanDataToManage] = useState(null);
    const [targetUserPublicId, setTargetUserPublicId] = useState(null);

    const [showUnbanConfirmModal, setShowUnbanConfirmModal] = useState(false);
    const [userToUnbanPublicId, setUserToUnbanPublicId] = useState(null);

    const [banTypeFilter, setBanTypeFilter] = useState('all');
    const [unbanTimeStart, setUnbanTimeStart] = useState(null);
    const [unbanTimeEnd, setUnbanTimeEnd] = useState(null);


    const observer = useRef();
    const containerRef = useRef(null);


    const lastBannedUserRef = useCallback(node => {
        if (loading || initialLoading || !hasMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, initialLoading, hasMore]);


    const fetchBannedUsers = useCallback(async (pageNumber = 0, usernameQuery = searchUsernameQuery) => {
        const isNewFilter = pageNumber === 0;

        if (isNewFilter) {
            setInitialLoading(true);
            setBannedUsers([]);
            setHasMore(true);
            setError(null);
        } else {
            setLoading(true);
            setError(null);
        }

        const startTime = Date.now();
        const token = Cookies.get('token');

        if (!token) {
            setError("Authentication required to view banned users.");
            setInitialLoading(false);
            setLoading(false);
            setHasMore(false);
            setBannedUsers([]);
            return;
        }

        const params = {
            page: pageNumber,
            size: PAGE_SIZE,
        };

        if (usernameQuery) {
            params.username = usernameQuery;
        }

        if (banTypeFilter !== 'all') {
            params.isPermanentBan = banTypeFilter === 'permanent';
        }

        if (banTypeFilter === 'temporary') {
            if (unbanTimeStart) {
                params.unbanTimeStart = unbanTimeStart.toISOString().slice(0, 19);
            }
            if (unbanTimeEnd) {
                params.unbanTimeEnd = unbanTimeEnd.toISOString().slice(0, 19);
            }
        }


        try {
            const res = await axios.get(`http://localhost:8080/api/v1/users/banned`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params,
            });

            const fetchedBannedUsers = res.data.content || [];
            const isLast = res.data.last;

            setBannedUsers(prev => (pageNumber === 0 ? fetchedBannedUsers : [...prev, ...fetchedBannedUsers]));

            let morePages = !isLast;

            if (fetchedBannedUsers.length === 0 && pageNumber > 0) {
                morePages = false;
            }

            setHasMore(morePages);

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                setInitialLoading(false);
                setLoading(false);
            }, remainingTime);


        } catch (err) {
            console.error('Failed to load banned users:', err);
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                if (err.response?.status === 404) {
                    setError(NOT_FOUND_ERROR_MESSAGE);
                    setBannedUsers([]);
                    setHasMore(false);
                } else {
                    const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to load banned users.';
                    toast.error(errorMessage);
                    setError(errorMessage);
                    setHasMore(false);
                    if (pageNumber === 0) {
                        setBannedUsers([]);
                    }
                }
                setInitialLoading(false);
                setLoading(false);
            }, remainingTime);
        }
    }, [searchUsernameQuery, banTypeFilter, unbanTimeStart, unbanTimeEnd]);


    useEffect(() => {
        fetchBannedUsers(page);
    }, [page, fetchBannedUsers]);


    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchUsernameInput !== searchUsernameQuery) {
                setSearchUsernameQuery(searchUsernameInput);
                setPage(0);
                setIsSearching(!!searchUsernameInput);
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchUsernameInput, searchUsernameQuery]);

    const handleScroll = useCallback(() => {
        if (loading || initialLoading || !hasMore) {
            return;
        }

        const container = containerRef.current;
        if (!container) return;

        const containerBottom = container.getBoundingClientRect().bottom;
        const viewportHeight = window.innerHeight;

        const isNearBottomOfContainer = containerBottom <= (viewportHeight + SCROLL_THRESHOLD);

        if (isNearBottomOfContainer) {
            const nextPage = page + 1;
            setPage(nextPage);
        } else {
            const containerHeight = container.scrollHeight;
            const isContentShorterThanViewport = containerHeight <= viewportHeight;
            if (isContentShorterThanViewport && hasMore && bannedUsers.length > 0) {
                const nextPage = page + 1;
                setPage(nextPage);
            }
        }

    }, [hasMore, loading, page, bannedUsers.length, initialLoading]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);


    const overallLoading = initialLoading || loading;


    const handleUnbanClick = (targetPublicId) => {
        setUserToUnbanPublicId(targetPublicId);
        setShowUnbanConfirmModal(true);
    };

    const confirmUnban = async () => {
        setShowUnbanConfirmModal(false);

        if (!userToUnbanPublicId) {
            console.error("User public ID not set for unban confirmation.");
            toast.error("An error occurred. Please try again.");
            return;
        }

        const token = Cookies.get('token');
        if (!token) {
            toast.error("Authentication token not found. Please log in.");
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/v1/users/${userToUnbanPublicId}/unban`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            toast.success(`User ${userToUnbanPublicId} has been unbanned.`);
            setBannedUsers(prevUsers => prevUsers.filter(banData => banData.bannedUser.publicId !== userToUnbanPublicId));

        } catch (err) {
            console.error('Error unbanning user:', err);
            const errorMessage = err.response?.data?.message || 'Failed to unban user.';
            toast.error(errorMessage);
        } finally {
            setUserToUnbanPublicId(null);
        }
    };

    const handleUpdateClick = (banData) => {
        setBanDataToManage(banData);
        setTargetUserPublicId(banData.bannedUser.publicId);
        setShowManageBanModal(true);
    };

    const handleBanUpdateSuccess = (updatedBanData) => {
        setBannedUsers(prevUsers =>
            prevUsers.map(banData =>
                banData.id === updatedBanData.id ? updatedBanData : banData
            )
        );
        setBanDataToManage(null);
        setTargetUserPublicId(null);
    };

    const handleManageBanModalClose = () => {
        setShowManageBanModal(false);
        setBanDataToManage(null);
        setTargetUserPublicId(null);
    };

    const handleUnbanConfirmModalClose = () => {
        setShowUnbanConfirmModal(false);
        setUserToUnbanPublicId(null);
    };

    const handleBanTypeChange = (event) => {
        setBanTypeFilter(event.target.value);
        setPage(0);
        setUnbanTimeStart(null);
        setUnbanTimeEnd(null);
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setUnbanTimeStart(start);
        setUnbanTimeEnd(end);
        setPage(0);
    };


    const noBannedUsersMessage = isSearching
        ? `No banned users found matching "${searchUsernameQuery}".`
        : 'No banned users found.';


    return (
        <div className="mt-6 rounded-md text-black font-sans overflow-visible" ref={containerRef}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
                <div className="flex-grow">
                    <label htmlFor="usernameSearch" className="block text-xs font-normal text-gray-medium mb-1 uppercase tracking-wide">Search by Username</label>
                    <input
                        id="usernameSearch"
                        type="text"
                        placeholder="Enter username"
                        value={searchUsernameInput}
                        onChange={(e) => setSearchUsernameInput(e.target.value)}
                        className="block w-full bg-transparent border-0 border-b border-border focus:outline-none focus:border-black py-2 text-sm text-gray-darker placeholder-gray-medium"
                    />
                </div>

                <div>
                    <label htmlFor="banTypeFilter" className="block text-xs font-normal text-gray-medium mb-1 uppercase tracking-wide">Filter by Ban Type</label>
                    <select
                        id="banTypeFilter"
                        value={banTypeFilter}
                        onChange={handleBanTypeChange}
                        className="block w-full bg-transparent border-0 border-b border-border focus:outline-none focus:border-black py-2 text-sm text-gray-darker"
                    >
                        <option value="all">All Bans</option>
                        <option value="permanent">Permanent Bans</option>
                        <option value="temporary">Temporary Bans</option>
                    </select>
                </div>

                {banTypeFilter === 'temporary' && (
                    <div className="flex-grow">
                        <label htmlFor="unbanTimeFilter" className="block text-xs font-normal text-gray-medium mb-1 uppercase tracking-wide">Filter by Unban Time</label>
                        <DatePicker
                            id="unbanTimeFilter"
                            selectsRange={true}
                            startDate={unbanTimeStart}
                            endDate={unbanTimeEnd}
                            onChange={handleDateChange}
                            isClearable={true}
                            placeholderText="Select unban date range"
                            className="block w-full bg-transparent border-0 border-b border-border focus:outline-none focus:border-black py-2 text-sm text-gray-darker placeholder-gray-medium"
                            calendarClassName="rasta-stripes"
                            showTimeInput
                            dateFormat="yyyy-MM-dd'T'HH:mm:ss"
                            wrapperClassName="w-full" // Ensure the wrapper takes full width of its flex container
                        />
                    </div>
                )}
            </div>

            {(initialLoading && bannedUsers.length === 0 && !error) && (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                </div>
            )}

            {!initialLoading && !loading && error === NOT_FOUND_ERROR_MESSAGE && (
                <p className="text-gray-medium text-center py-10 text-base">
                    {noBannedUsersMessage}
                </p>
            )}
            {!initialLoading && !loading && error && error !== NOT_FOUND_ERROR_MESSAGE && (
                <div className="text-red-600 text-center py-10">
                    <p>{error}</p>
                </div>
            )}

            {!initialLoading && !loading && !error && bannedUsers.length === 0 && (
                <p className="text-gray-medium text-center py-10 text-base">
                    {noBannedUsersMessage}
                </p>
            )}


            {bannedUsers.length > 0 && !initialLoading && !error && (
                <ul className="space-y-1 overflow-visible">
                    {bannedUsers.map((banData, idx) => (
                        banData ? (
                            <React.Fragment key={banData.id}>
                                {idx !== 0 && <hr className="border-gray-300 my-1" />}
                                <BannedUserItem
                                    banData={banData}
                                    ref={idx === bannedUsers.length - 1 ? lastBannedUserRef : null}
                                    onUnbanClick={handleUnbanClick}
                                    onUpdateClick={handleUpdateClick}
                                />
                            </React.Fragment>
                        ) : null
                    ))}
                </ul>
            )}


            {loading && page > 0 && bannedUsers.length > 0 && !error && (
                <div className="flex justify-center py-6">
                    <Oval height={28} width={28} color="#6B7280" secondaryColor="#E5E7EB" strokeWidth={3} visible />
                </div>
            )}

            {!overallLoading && hasMore && bannedUsers.length > 0 && !error && (
                <p className="text-gray-medium text-sm mt-8 text-center pb-4">
                    Scroll down for more banned users...
                </p>
            )}

            {showManageBanModal && (
                <ManageBanModal
                    isOpen={showManageBanModal}
                    onClose={handleManageBanModalClose}
                    targetPublicId={targetUserPublicId}
                    banData={banDataToManage}
                    onUpdateSuccess={handleBanUpdateSuccess}
                />
            )}

            {showUnbanConfirmModal && userToUnbanPublicId && (
                <ConfirmationModal
                    isOpen={showUnbanConfirmModal}
                    onClose={handleUnbanConfirmModalClose}
                    onConfirm={confirmUnban}
                    title="Confirm Unban"
                    message={`Are you sure you want to unban user ${userToUnbanPublicId}? This action cannot be undone.`}
                    confirmButtonText="Unban"
                />
            )}
        </div>
    );
};

export default BannedUsers;