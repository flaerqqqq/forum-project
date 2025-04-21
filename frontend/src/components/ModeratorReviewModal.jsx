import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';

const STATUSES = ['UNDER_REVIEW', 'REJECTED', 'RESOLVED'];

const ModeratorReviewModal = ({ reportId, isOpen, onClose, onSuccess }) => {
    const [status, setStatus] = useState('UNDER_REVIEW');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if ((status === 'REJECTED' || status === 'RESOLVED') && note.trim() === '') {
            toast.error('Note is required for Rejected or Resolved status.');
            return;
        }

        setSubmitting(true);
        try {
            const token = Cookies.get('token');
            await axios.put(
                `http://localhost:8080/api/v1/reports/${reportId}`,
                { status, note },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('Report reviewed successfully.');
            onSuccess?.();
            handleClose();
        } catch (error) {
            const errMsg = error.response?.data?.body?.detail || 'Failed to review report.';
            toast.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setStatus('UNDER_REVIEW');
        setNote('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-4 text-gray-600 hover:text-gray-900 text-xl font-bold"
                >
                    &times;
                </button>

                <h2 className="text-xl font-semibold text-gray-800 mb-4">Review Report</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            {STATUSES.map((stat) => (
                                <option key={stat} value={stat}>
                                    {stat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(status === 'REJECTED' || status === 'RESOLVED') && (
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Note</label>
                            <textarea
                                rows="4"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full p-2 border rounded-md resize-none"
                                placeholder="Enter note for this action"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            disabled={submitting}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModeratorReviewModal;