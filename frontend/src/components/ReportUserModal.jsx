import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X } from 'lucide-react';

const formatReason = (reason) => {
    if (!reason) return '';
    return reason
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
};

const ReportUserModal = ({ targetPublicId, onClose }) => {
    const [reasons, setReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const modalRef = useRef(null);

    if (error) {
        throw error;
    }

    useEffect(() => {
        const fetchReasons = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/reports/reasons');
                setReasons(response.data);
            } catch (err) {
                setError(new Error('Failed to fetch report reasons.'));
                toast.error('Failed to load report reasons.');
            }
        };
        fetchReasons();
    }, []);

    const handleReport = async () => {
        setLoading(true);
        setError(null);

        const token = Cookies.get('token');
        if (!token) {
            toast.error("Authentication token not found. Please log in.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/api/v1/reports`,
                {
                    targetType: 'USER',
                    targetId: targetPublicId,
                    reason: selectedReason,
                    description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 201) {
                toast.success("Report Submitted! We'll review your report shortly.");
                onClose();
            }
        } catch (err) {
            console.error('Error reporting user:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Error reporting user. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose]);


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
            <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Report User</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors" aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">Please select a reason for reporting this user.</p>

                <div className="mt-2">
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                    >
                        <option value="">Select a reason</option>
                        {reasons.map((reason) => (
                            <option key={reason} value={reason}>
                                {formatReason(reason)}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedReason && (
                    <div className="mt-4">
                         <textarea
                             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y"
                             placeholder="Provide a detailed description (optional)"
                             rows="4"
                             value={description}
                             onChange={(e) => setDescription(e.target.value)}
                         ></textarea>
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReport}
                        disabled={loading || !selectedReason}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />
                        ) : 'Submit Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportUserModal;