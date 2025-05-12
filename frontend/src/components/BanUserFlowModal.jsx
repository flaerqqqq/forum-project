import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Oval } from 'react-loader-spinner';
import { X, ArrowLeft } from 'lucide-react';

const getAvatarColorClass = (username) => {
    if (!username) return 'bg-gray-medium';
    const firstLetter = username.charAt(0).toUpperCase();
    const asciiCode = firstLetter.charCodeAt(0);
    const colorIndex = asciiCode % 10;
    const avatarColors = [
        'bg-accent-green', 'bg-gray-darker', 'bg-indigo-600', 'bg-blue-600',
        'bg-purple-600', 'bg-pink-600', 'bg-teal-600', 'bg-orange-600',
        'bg-red-600', 'bg-gray-medium',
    ];
    return avatarColors[colorIndex];
};

const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};


const BanUserFlowModal = ({ isOpen, onClose, categorySlug, onBanSuccess }) => {
    const [step, setStep] = useState(1); // 1: Search User, 2: Set Ban Details
    const [searchTerm, setSearchTerm] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [searchingUser, setSearchingUser] = useState(false);
    const [userSearchError, setUserSearchError] = useState(null);

    const [isPermanentBan, setIsPermanentBan] = useState(false);
    const [unbanAt, setUnbanAt] = useState('');
    const [reason, setReason] = useState('');
    const [submittingBan, setSubmittingBan] = useState(false);
    const [banSubmissionError, setBanSubmissionError] = useState(null);

    const modalRef = useRef(null);

    useEffect(() => {
        const handleClose = (e) => {
            if (modalRef.current && modalRef.current.contains(e.target)) {
                return;
            }
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
            if (e.type === "mousedown" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClose);
            document.addEventListener("keydown", handleClose);
        } else {
            document.removeEventListener("mousedown", handleClose);
            document.removeEventListener("keydown", handleClose);
        }


        return () => {
            document.removeEventListener("mousedown", handleClose);
            document.removeEventListener("keydown", handleClose);
        };
    }, [isOpen, onClose]);



    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSearchTerm("");
            setFoundUser(null);
            setSearchingUser(false);
            setUserSearchError(null);
            setIsPermanentBan(false);
            setUnbanAt('');
            setReason('');
            setSubmittingBan(false);
            setBanSubmissionError(null);
        }
    }, [isOpen]);


    const handleSearchUser = async () => {
        if (!searchTerm.trim()) return;
        setSearchingUser(true);
        setUserSearchError(null);
        setFoundUser(null);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/users/username/${searchTerm.trim()}`);
            setFoundUser(res.data);

        } catch (err) {
            console.error('User search failed:', err);
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setUserSearchError("User not found.");
            } else {
                setUserSearchError("An error occurred while searching for the user.");
            }
            setFoundUser(null);
        } finally {
            setSearchingUser(false);
        }
    };

    const handleKeyPressSearch = (e) => {
        if (e.key === "Enter" && !searchingUser) {
            handleSearchUser();
        }
    };

    const handleProceedToBanDetails = () => {
        if (foundUser) {
            setStep(2);
            setBanSubmissionError(null);
        }
    };

    const handleSubmitBan = async (e) => {
        e.preventDefault();
        setBanSubmissionError(null);
        setSubmittingBan(true);

        const token = Cookies.get('token');
        if (!token) {
            toast.error("Authentication token not found. Please log in.");
            setSubmittingBan(false);
            return;
        }

        if (!foundUser) {
            setBanSubmissionError("No target user selected.");
            setSubmittingBan(false);
            return;
        }

        if (!reason.trim()) {
            setBanSubmissionError("Reason is required.");
            setSubmittingBan(false);
            return;
        }

        let finalUnbanAt = null;
        if (!isPermanentBan) {
            if (!unbanAt) {
                setBanSubmissionError("Unban date and time are required for temporary bans.");
                setSubmittingBan(false);
                return;
            }
            try {

                const unbanDate = new Date(unbanAt);
                if (isNaN(unbanDate.getTime())) {
                    throw new Error("Invalid date");
                }

                finalUnbanAt = unbanDate.toISOString().slice(0, 19);

            } catch (parseError) {
                setBanSubmissionError("Invalid unban date or time format.");
                setSubmittingBan(false);
                console.error("Unban date parsing error:", parseError);
                return;
            }
        }

        const banRequestDto = {
            isPermanentBan: isPermanentBan,
            unbanAt: isPermanentBan ? null : finalUnbanAt,
            reason: reason.trim(),
        };


        const apiUrl = `http://localhost:8080/api/v1/categories/slug/${categorySlug}/ban/${foundUser.publicId}`;

        try {
            const response = await axios.post(
                apiUrl,
                banRequestDto,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                toast.success(`User @${foundUser.username} banned successfully in category ${categorySlug}.`);
                onClose();
                if (onBanSuccess) {
                    onBanSuccess();
                }
            } else {
                setBanSubmissionError(`Unexpected server response: ${response.status}`);
                toast.error(`Failed to ban user: Unexpected server response.`);
            }

        } catch (err) {
            console.error('Error banning user:', err);
            let errorMessage = "An error occurred while trying to ban the user.";

            if (axios.isAxiosError(err)) {
                if (err.response) {
                    console.error("Response data:", err.response.data);
                    console.error("Response status:", err.response.status);
                    const apiDetail = err.response.data?.detail || err.response.data?.message;
                    if (apiDetail) {
                        errorMessage = `Failed to ban user: ${apiDetail}`;
                    } else if (err.response.status === 403) {
                        errorMessage = "You do not have permission to ban users in this category.";
                    } else if (err.response.status === 404) {
                        errorMessage = "Category or target user not found.";
                    } else if (err.response.status === 400) {
                        errorMessage = `Invalid request: ${apiDetail || 'Check ban data'}`;
                    }
                    else {
                        errorMessage = `Failed to ban user: Server responded with status ${err.response.status}`;
                    }
                } else if (err.request) {
                    errorMessage = "No response received from server. Please try again.";
                } else {
                    errorMessage = `Error setting up request: ${err.message}`;
                }
            } else {
                errorMessage = `An unexpected error occurred: ${err.message}`;
            }

            setBanSubmissionError(errorMessage);
            toast.error(errorMessage);

        } finally {
            setSubmittingBan(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 my-8"
                onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing when clicking inside modal
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Ban User {categorySlug && `in ${categorySlug}`}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {step === 1 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Step 1: Find User</h3>
                        <div className="flex mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPressSearch}
                                placeholder="Enter username"
                                className="flex-grow border p-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSearchUser}
                                disabled={searchingUser || !searchTerm.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                            >
                                {searchingUser ? (
                                    <Oval height={20} width={20} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />
                                ) : "Search"}
                            </button>
                        </div>

                        {userSearchError && !searchingUser && (
                            <div className="text-center text-red-500 text-sm mb-4">
                                <p>{userSearchError}</p>
                            </div>
                        )}

                        {foundUser && (
                            <div className="flex items-center justify-between gap-4 mb-4 p-3 bg-gray-100 rounded-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                        {foundUser.avatarUrl ? (
                                            <img
                                                src={foundUser.avatarUrl}
                                                alt={foundUser.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className={`w-full h-full flex items-center justify-center text-white text-base font-bold ${getAvatarColorClass(foundUser.username)}`}
                                            >
                                                <span>{getInitials(foundUser.displayName || foundUser.username)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-base font-medium text-gray-800">{foundUser.username}</span>
                                </div>
                                <button
                                    onClick={handleProceedToBanDetails}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                >
                                    Proceed to Ban
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && foundUser && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Step 2: Set Ban Details</h3>
                            <button
                                onClick={() => setStep(1)}
                                className="text-gray-500 hover:text-gray-800 transition-colors"
                                aria-label="Back to user search"
                            >
                                <ArrowLeft size={20} /> {/* Back icon */}
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-gray-100 rounded-md">
                            <span className="text-base font-medium text-gray-800">Banning: @{foundUser.username}</span>
                        </div>


                        <form onSubmit={handleSubmitBan}>
                            <div className="mb-4">
                                <label className="flex items-center text-gray-700 text-sm">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                                        checked={isPermanentBan}
                                        onChange={(e) => setIsPermanentBan(e.target.checked)}
                                    />
                                    Permanent Ban
                                </label>
                            </div>

                            {!isPermanentBan && (
                                <div className="mb-4">
                                    <label htmlFor="unbanAt" className="block text-gray-700 text-sm font-medium mb-2">
                                        Unban At (Date and Time)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="unbanAt"
                                        className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={unbanAt}
                                        onChange={(e) => setUnbanAt(e.target.value)}
                                        required={!isPermanentBan}
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="reason" className="block text-gray-700 text-sm font-medium mb-2">
                                    Reason for Ban
                                </label>
                                <textarea
                                    id="reason"
                                    rows="4"
                                    className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                                    disabled={submittingBan}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={submittingBan}
                                >
                                    {submittingBan && <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />}
                                    Confirm Ban
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BanUserFlowModal;