import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { X } from 'lucide-react'; // Assuming lucide-react for icons
import { Oval } from 'react-loader-spinner'; // Assuming react-loader-spinner

const BanUserModal = ({ isOpen, onClose, targetPublicId, onBanSuccess }) => {
    const [isPermanentBan, setIsPermanentBan] = useState(false);
    const [unbanAt, setUnbanAt] = useState(''); // Use string for input value
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const modalRef = useRef(null);

    // Effect to handle closing the modal with the Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Effect to reset form state when modal is opened
    useEffect(() => {
        if (isOpen) {
            setIsPermanentBan(false);
            setUnbanAt('');
            setReason('');
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    // Handle clicks outside the modal content
    const handleBackdropClick = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const token = Cookies.get('token');
        if (!token) {
            toast.error("Authentication token not found. Please log in.");
            setLoading(false);
            return;
        }

        // Validate input based on ban type
        if (!reason.trim()) {
            setError("Reason is required.");
            setLoading(false);
            return;
        }

        let finalUnbanAt = null;
        if (!isPermanentBan) {
            if (!unbanAt) {
                setError("Unban date and time are required for temporary bans.");
                setLoading(false);
                return;
            }
            try {
                // Convert the input string to LocalDateTime format expected by backend
                // Assuming the input format is compatible with LocalDateTime parsing (e.g., YYYY-MM-DDTHH:mm)
                finalUnbanAt = new Date(unbanAt).toISOString(); // Send as ISO string
            } catch (parseError) {
                setError("Invalid unban date or time format.");
                setLoading(false);
                console.error("Unban date parsing error:", parseError);
                return;
            }
        }

        const banRequestDto = {
            isPermanentBan: isPermanentBan,
            unbanAt: isPermanentBan ? null : finalUnbanAt, // Send null for permanent ban
            reason: reason.trim(),
        };

        try {
            const response = await axios.post(
                `http://localhost:8080/api/v1/users/${targetPublicId}/ban`,
                banRequestDto,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                toast.success(`User @${response.data.bannedUser.username} banned successfully.`);
                onClose(); // Close the modal on success
                if (onBanSuccess) {
                    onBanSuccess(); // Call parent success handler if provided
                }
            } else {
                // Handle unexpected status codes
                setError(`Unexpected server response: ${response.status}`);
                toast.error(`Failed to ban user: Unexpected server response.`);
            }

        } catch (err) {
            console.error('Error banning user:', err);
            let errorMessage = "An error occurred while trying to ban the user.";

            if (axios.isAxiosError(err)) {
                if (err.response) {
                    console.error("Response data:", err.response.data);
                    console.error("Response status:", err.response.status);
                    if (err.response.data && err.response.data.body.detail) {
                        errorMessage = `Failed to ban user: ${err.response.data.body.detail}`;
                    } else if (err.response.status === 403) {
                        errorMessage = "You do not have permission to ban users.";
                    } else if (err.response.status === 404) {
                        errorMessage = "Target user not found.";
                    } else {
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

            setError(errorMessage);
            toast.error(errorMessage);

        } finally {
            setLoading(false);
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
                    <h2 className="text-xl font-semibold text-gray-800">Ban User</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
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
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading && <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />}
                            Ban User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BanUserModal;