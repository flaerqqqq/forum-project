import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { Oval } from 'react-loader-spinner';
import { format } from 'date-fns';

const ManageBanModal = ({ isOpen, onClose, targetPublicId, banData, onBanSuccess, onUpdateSuccess }) => {
    const [isPermanentBan, setIsPermanentBan] = useState(banData?.isPermanentBan || false);
    const [unbanAt, setUnbanAt] = useState(banData?.unbanAt ? format(new Date(banData.unbanAt), 'yyyy-MM-dd\'T\'HH:mm') : '');
    const [reason, setReason] = useState(banData?.reason || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isUpdateMode = !!banData;

    const modalRef = useRef(null);

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

    useEffect(() => {
        if (isOpen) {
            setIsPermanentBan(banData?.isPermanentBan || false);
            setUnbanAt(banData?.unbanAt ? format(new Date(banData.unbanAt), 'yyyy-MM-dd\'T\'HH:mm') : '');
            setReason(banData?.reason || '');
            setError(null);
            setLoading(false);
        }
    }, [isOpen, banData]);

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
                finalUnbanAt = new Date(unbanAt).toISOString();
            } catch (parseError) {
                setError("Invalid unban date or time format.");
                setLoading(false);
                console.error("Unban date parsing error:", parseError);
                return;
            }
        }

        const banRequestDto = {
            isPermanentBan: isPermanentBan,
            unbanAt: isPermanentBan ? null : finalUnbanAt,
            reason: reason.trim(),
        };

        try {
            let response;
            if (isUpdateMode) {
                response = await axios.put(
                    `http://localhost:8080/api/v1/users/${targetPublicId}/update`,
                    banRequestDto,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            } else {
                response = await axios.post(
                    `http://localhost:8080/api/v1/users/${targetPublicId}/ban`,
                    banRequestDto,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }


            if (response.status === 200) {
                const successMessage = isUpdateMode ? "Ban data updated successfully." : `User ${targetPublicId} banned successfully.`;
                toast.success(successMessage);
                onClose();
                if (isUpdateMode && onUpdateSuccess) {
                    onUpdateSuccess(response.data);
                } else if (!isUpdateMode && onBanSuccess) {
                    onBanSuccess(response.data);
                }
            } else {
                // Handle unexpected status codes
                setError(`Unexpected server response: ${response.status}`);
                toast.error(`Failed to ${isUpdateMode ? 'update ban' : 'ban user'}: Unexpected server response.`);
            }

        } catch (err) {
            console.error(`Error ${isUpdateMode ? 'updating ban' : 'banning user'}:`, err);
            let errorMessage = `An error occurred while trying to ${isUpdateMode ? 'update the ban' : 'ban the user'}.`;

            if (axios.isAxiosError(err)) {
                if (err.response) {
                    console.error("Response data:", err.response.data);
                    console.error("Response status:", err.response.status);
                    if (err.response.data && err.response.data.message) {
                        errorMessage = `Failed to ${isUpdateMode ? 'update ban' : 'ban user'}: ${err.response.data.message}`;
                    } else if (err.response.status === 403) {
                        errorMessage = `You do not have permission to ${isUpdateMode ? 'update this ban' : 'ban users'}.`;
                    } else if (err.response.status === 404) {
                        errorMessage = "Target user or ban data not found.";
                    } else {
                        errorMessage = `Failed to ${isUpdateMode ? 'update ban' : 'ban user'}: Server responded with status ${err.response.status}`;
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
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{isUpdateMode ? 'Update Ban Data' : 'Ban User'}</h2>
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

                    {error && (
                        <div className="mb-4 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

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
                            className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isUpdateMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                            disabled={loading}
                        >
                            {loading && <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />}
                            {isUpdateMode ? 'Update Ban' : 'Ban User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageBanModal;