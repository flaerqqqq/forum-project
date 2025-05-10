import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import BannedUserItem from './BannedUserItem.jsx'; // Import the BannedUserItem component
import ManageBanModal from './ManageBanModal.jsx'; // Import the renamed modal
import ConfirmationModal from './ConfirmationModal.jsx'; // Import the new ConfirmationModal

// Define the number of banned users to fetch per page
const PAGE_SIZE = 10;
// Define a minimum loading time to prevent flickering on fast responses
const MIN_LOADING_TIME = 300;
// Define scroll threshold for infinite scrolling
const SCROLL_THRESHOLD = 500;

// Define a specific error message for 404 Not Found
const NOT_FOUND_ERROR_MESSAGE = "No banned users found matching the criteria.";


const BannedUsers = () => {
    // State to store the list of banned users
    const [bannedUsers, setBannedUsers] = useState([]);
    // State for the current page number for pagination
    const [page, setPage] = useState(0);
    // State to indicate if there are more pages to load
    const [hasMore, setHasMore] = useState(true);
    // State for loading state of subsequent pages
    const [loading, setLoading] = useState(false);
    // State for initial loading state (first page or search)
    const [initialLoading, setInitialLoading] = useState(true);
    // State to store any errors during fetching
    const [error, setError] = useState(null);
    // State for the username search query input value
    const [searchUsernameInput, setSearchUsernameInput] = useState('');
    // State for the actual search query used in the API call (debounced)
    const [searchUsernameQuery, setSearchUsernameQuery] = useState('');
    // State to indicate if a search is currently active
    const [isSearching, setIsSearching] = useState(false);

    // State to control the visibility of the ManageBanModal
    const [showManageBanModal, setShowManageBanModal] = useState(false);
    // State to store the ban data for the modal when updating
    const [banDataToManage, setBanDataToManage] = useState(null);
    // State to store the public ID of the user whose ban is being managed
    const [targetUserPublicId, setTargetUserPublicId] = useState(null);

    // State to control the visibility of the Unban Confirmation Modal
    const [showUnbanConfirmModal, setShowUnbanConfirmModal] = useState(false);
    // State to store the public ID of the user to be unbanned
    const [userToUnbanPublicId, setUserToUnbanPublicId] = useState(null);


    // Ref for the Intersection Observer
    const observer = useRef();
    // Ref for the main container to check scroll height
    const containerRef = useRef(null);


    // Callback ref for the last banned user element to trigger infinite scrolling
    const lastBannedUserRef = useCallback(node => {
        // If currently loading (any type), or no more data, don't observe
        if (loading || initialLoading || !hasMore) return;
        // Disconnect the previous observer if it exists
        if (observer.current) observer.current.disconnect();

        // Create a new IntersectionObserver
        observer.current = new IntersectionObserver(entries => {
            // If the last element is intersecting the viewport
            if (entries[0].isIntersecting) {
                // Increment the page number to trigger fetching the next page
                setPage(prevPage => prevPage + 1);
            }
        });

        // Start observing the node if it exists
        if (node) observer.current.observe(node);
    }, [loading, initialLoading, hasMore]); // Dependencies for useCallback


    // Function to fetch banned users from the backend
    const fetchBannedUsers = useCallback(async (pageNumber = 0, usernameQuery = searchUsernameQuery, append = true) => {
        // Set loading state based on whether it's the initial load/search or subsequent pages
        if (!append && pageNumber === 0) {
            setInitialLoading(true);
            setBannedUsers([]); // Clear list on initial load or new search
            setHasMore(true); // Assume more data until proven otherwise
        } else {
            setLoading(true); // Set loading state for subsequent pages
        }
        setError(null); // Clear any previous errors

        const startTime = Date.now(); // Record start time for minimum loading duration
        const token = Cookies.get('token'); // Get the JWT token

        // Ensure token is present for moderator endpoint
        if (!token) {
            setError("Authentication required to view banned users.");
            setInitialLoading(false);
            setLoading(false);
            setHasMore(false);
            setBannedUsers([]);
            return;
        }


        try {
            // Make the API call to fetch banned users
            const res = await axios.get(`http://localhost:8080/api/v1/users/banned`, {
                headers: { Authorization: `Bearer ${token}` }, // Include token
                params: {
                    page: pageNumber, // Pagination parameters
                    size: PAGE_SIZE,
                    // Include username parameter only if it's not empty
                    ...(usernameQuery && { username: usernameQuery })
                },
            });

            const fetchedBannedUsers = res.data.content || [];
            const isLast = res.data.last;

            // Append fetched users for pagination, or replace for the first page/search
            setBannedUsers(prev => (pageNumber === 0 ? fetchedBannedUsers : [...prev, ...fetchedBannedUsers]));

            // Update hasMore state based on the backend's 'last' flag
            let morePages = !isLast;

            // Additional check: if no users were fetched on a subsequent page, there are no more pages
            if (fetchedBannedUsers.length === 0 && pageNumber > 0) {
                morePages = false;
            }

            setHasMore(morePages);

        } catch (err) {
            // Handle errors during fetching
            console.error('Failed to load banned users:', err);
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                if (err.response?.status === 404) {
                    // Set a specific error message for 404, but DO NOT show a toast
                    setError(NOT_FOUND_ERROR_MESSAGE);
                    setBannedUsers([]); // Clear list on 404 as no results are found
                    setHasMore(false); // No more data on 404
                } else {
                    // For other errors, show toast and set generic error message
                    const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to load banned users.';
                    toast.error(errorMessage);
                    setError(errorMessage); // Set error state
                    setHasMore(false); // Stop pagination on error
                    if (pageNumber === 0) { // Clear list only on initial/search fetch error
                        setBannedUsers([]);
                    }
                }
                setInitialLoading(false);
                setLoading(false);
            }, remainingTime);
        }
    }, [searchUsernameQuery]); // Dependencies: re-fetch when searchUsernameQuery changes

    // Effect to trigger fetching when the component mounts, page changes, or searchUsernameQuery changes
    useEffect(() => {
        // When searchUsernameQuery changes, page is reset to 0 in the debounce effect,
        // so this useEffect will trigger the initial fetch for the new search.
        // When page changes (due to infinite scroll), this useEffect triggers fetching the next page.
        fetchBannedUsers(page); // Pass the current page number
    }, [page, fetchBannedUsers]); // Dependencies: page to trigger pagination, fetchBannedUsers useCallback

    // Effect for debouncing the search input and triggering fetch
    useEffect(() => {
        const handler = setTimeout(() => {
            // Only update the actual search query if the input value is different
            // This prevents unnecessary fetches when the user is just typing
            if (searchUsernameInput !== searchUsernameQuery) {
                setSearchUsernameQuery(searchUsernameInput);
                setPage(0); // Reset page to 0 on new search
                setIsSearching(!!searchUsernameInput); // Set searching state
            }
        }, 300); // Debounce delay

        // Cleanup function to clear the timeout if the input changes before the delay
        return () => {
            clearTimeout(handler);
        };
    }, [searchUsernameInput, searchUsernameQuery]); // Dependencies: re-run when input value changes

    // Effect for infinite scrolling - uses the scroll handler
    const handleScroll = useCallback(() => {
        // Prevent loading more if already fetching anything or no more data
        if (loading || initialLoading || !hasMore) {
            return;
        }

        // Get the position of the comments container
        const container = containerRef.current;
        if (!container) return; // Exit if the container ref is not set

        // Calculate the distance from the bottom of the container to the bottom of the viewport
        const containerBottom = container.getBoundingClientRect().bottom;
        const viewportHeight = window.innerHeight;

        // Check if the bottom of the container is within the SCROLL_THRESHOLD distance from the bottom of the viewport
        const isNearBottomOfContainer = containerBottom <= (viewportHeight + 500); // Using a fixed threshold

        if (isNearBottomOfContainer) {
            console.log("Scroll handler: Near bottom of container, fetching next page.");
            const nextPage = page + 1;
            setPage(nextPage); // Update page state to trigger the useEffect for fetching
        }
        // Also load more if content is not scrollable but there's more data (handles cases with few initial items)
        else if (!isContentScrollable && hasMore && bannedUsers.length > 0) {
            // Check if the container is actually shorter than the viewport
            const containerHeight = container.scrollHeight;
            const viewportHeight = window.innerHeight; // Recalculate viewport height
            const isContentShorterThanViewport = containerHeight <= viewportHeight;

            if (isContentShorterThanViewport) {
                console.log("Scroll handler: Content shorter than viewport, fetching next page.");
                const nextPage = page + 1;
                setPage(nextPage); // Update page state
            }
        }

    }, [hasMore, loading, page, bannedUsers.length, initialLoading]); // Dependencies: state values that affect scrolling logic

    useEffect(() => {
        // Add scroll event listener on mount
        window.addEventListener('scroll', handleScroll);
        // Clean up scroll event listener on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]); // Dependency on handleScroll useCallback


    // Determine overall loading state for disabling buttons/input
    const overallLoading = initialLoading || loading;


    // --- Action Handlers for BannedUserItem ---

    // Handler for the "Unban" action - now requests confirmation
    const handleUnbanClick = (targetPublicId) => {
        setUserToUnbanPublicId(targetPublicId); // Store the public ID of the user to unban
        setShowUnbanConfirmModal(true); // Show the confirmation modal
    };

    // Handler for confirming the unban action
    const confirmUnban = async () => {
        setShowUnbanConfirmModal(false); // Close the confirmation modal

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
            // Call the backend unban endpoint
            await axios.delete(`http://localhost:8080/api/v1/users/${userToUnbanPublicId}/unban`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            toast.success(`User ${userToUnbanPublicId} has been unbanned.`);
            // Remove the unbanned user from the list
            setBannedUsers(prevUsers => prevUsers.filter(banData => banData.bannedUser.publicId !== userToUnbanPublicId));

        } catch (err) {
            console.error('Error unbanning user:', err);
            const errorMessage = err.response?.data?.message || 'Failed to unban user.';
            toast.error(errorMessage);
        } finally {
            setUserToUnbanPublicId(null); // Clear the stored public ID
        }
    };

    // Handler to open the ManageBanModal in update mode
    const handleUpdateClick = (banData) => {
        setBanDataToManage(banData); // Set the ban data to be updated
        setTargetUserPublicId(banData.bannedUser.publicId); // Set the target user's public ID
        setShowManageBanModal(true); // Show the modal
    };

    // Handler for when the ban data is successfully updated in the modal
    const handleBanUpdateSuccess = (updatedBanData) => {
        // Find the updated ban data in the current list and replace it
        setBannedUsers(prevUsers =>
            prevUsers.map(banData =>
                banData.id === updatedBanData.id ? updatedBanData : banData
            )
        );
        // Clear the modal state
        setBanDataToManage(null);
        setTargetUserPublicId(null);
    };

    // Handler to close the ManageBanModal
    const handleManageBanModalClose = () => {
        setShowManageBanModal(false);
        // Clear the modal state when closing
        setBanDataToManage(null);
        setTargetUserPublicId(null);
    };

    const handleUnbanConfirmModalClose = () => {
        setShowUnbanConfirmModal(false);
        setUserToUnbanPublicId(null); // Clear the stored public ID
    };


    // --- End Action Handlers ---


    // Determine the message to show when no banned users are found
    const noBannedUsersMessage = isSearching
        ? `No banned users found matching "${searchUsernameQuery}".`
        : 'No banned users found.';


    return (
        <div className="mt-6 rounded-md text-black font-sans overflow-visible" ref={containerRef}>
            {/* Search Input */}
            <div className="mb-6">
                <label htmlFor="usernameSearch" className="block text-xs font-normal text-gray-medium mb-1 uppercase tracking-wide">Search by Username</label>
                <input
                    id="usernameSearch"
                    type="text"
                    placeholder="Enter username"
                    value={searchUsernameInput}
                    onChange={(e) => setSearchUsernameInput(e.target.value)}
                    className="block w-full sm:w-auto bg-transparent border-0 border-b border-border focus:outline-none focus:border-black py-2 text-sm text-gray-darker placeholder-gray-medium"
                />
            </div>

            {overallLoading && bannedUsers.length === 0 && !error ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                </div>
            ) : error === NOT_FOUND_ERROR_MESSAGE ? (
                <p className="text-gray-medium text-center py-10 text-base">
                    {noBannedUsersMessage}
                </p>
            ) : error ? (
                // Display red error message for other errors
                <div className="text-red-600 text-center py-10">
                    <p>{error}</p>
                </div>
            ) : bannedUsers.length === 0 ? (
                // Message when no banned users are found (initial load, no search, no 404 error)
                <p className="text-gray-medium text-center py-10 text-base">
                    {noBannedUsersMessage}
                </p>
            ) : (
                // List of banned users using the BannedUserItem component
                <ul className="space-y-1 overflow-visible">
                    {bannedUsers.map((banData, idx) => (
                        // Add a check to ensure banData is not null or undefined before rendering
                        banData ? (
                            <React.Fragment key={banData.id}>
                                {/* Add HR between items if not the first item */}
                                {idx !== 0 && <hr className="border-gray-300 my-1" />}
                                <BannedUserItem
                                    banData={banData}
                                    // Attach ref for infinite scrolling to the last item
                                    ref={idx === bannedUsers.length - 1 ? lastBannedUserRef : null}
                                    onUnbanClick={handleUnbanClick} // Pass the unban handler
                                    onUpdateClick={handleUpdateClick} // Pass the update handler
                                />
                            </React.Fragment>
                        ) : null // Render nothing if banData is null or undefined
                    ))}
                </ul>
            )}

            {/* Loading indicator for subsequent pages */}
            {loading && page > 0 && (
                <div className="flex justify-center py-6">
                    <Oval height={28} width={28} color="#6B7280" secondaryColor="#E5E7EB" strokeWidth={3} visible />
                </div>
            )}

            {/* Message for scrolling to load more */}
            {!overallLoading && hasMore && bannedUsers.length > 0 && !error && (
                <p className="text-gray-medium text-sm mt-8 text-center pb-4">
                    Scroll down for more banned users...
                </p>
            )}

            {/* Render the ManageBanModal */}
            {showManageBanModal && (
                <ManageBanModal
                    isOpen={showManageBanModal}
                    onClose={handleManageBanModalClose}
                    targetPublicId={targetUserPublicId} // Pass the target user's public ID
                    banData={banDataToManage} // Pass the ban data for update mode (null for create mode)
                    onUpdateSuccess={handleBanUpdateSuccess} // Pass the update success handler
                    // onBanSuccess is not needed here as this component only updates/unbans
                />
            )}

            {/* Render the Unban Confirmation Modal */}
            {showUnbanConfirmModal && userToUnbanPublicId && (
                <ConfirmationModal
                    isOpen={showUnbanConfirmModal}
                    onClose={handleUnbanConfirmModalClose}
                    onConfirm={confirmUnban} // Pass the confirm unban handler
                    title="Confirm Unban"
                    message={`Are you sure you want to unban user ${userToUnbanPublicId}? This action cannot be undone.`}
                    confirmButtonText="Unban"
                />
            )}
        </div>
    );
};

export default BannedUsers;