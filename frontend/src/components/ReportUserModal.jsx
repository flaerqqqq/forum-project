import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify'; // Importing toast for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const formatReason = (reason) => {
    return reason
        .replace('_', ' ') // Replace underscores with spaces
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase()); // Capitalize first letter of each word
};

const ReportUserModal = ({ targetUsername, onClose }) => {
    const [reasons, setReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (error) {
        throw error;
    }

    useEffect(() => {
        // Fetch report reasons from backend
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

        try {
            const response = await axios.post(
                `http://localhost:8080/api/v1/reports`,
                {
                    targetType: 'USER', // Assuming the target type is 'USER'
                    targetId: targetUsername,
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
                onClose(); // Close the modal after submitting the report
            }
        } catch (err) {
            const errorMessage = err.response?.data?.body?.detail || 'Error reporting user. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Close the modal when clicking outside
    const handleClickOutside = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        // Adding event listener to close the modal when clicking outside
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50"
            onClick={handleClickOutside}
        >
            <div className="bg-white p-6 rounded-lg w-80" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-700">Report User</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-gray-500 mt-2">Please select a reason for reporting {targetUsername}.</p>

                <div className="mt-4">
                    <select
                        className="w-full p-2 border rounded-md"
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                    >
                        <option value="">Select a reason</option>
                        {reasons.map((reason) => (
                            <option key={reason} value={reason}>
                                {formatReason(reason)} {/* Format the reason */}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedReason && (
                    <>
                        <div className="mt-4">
                            <textarea
                                className="w-full p-2 mt-4 border rounded-md"
                                placeholder="Enter your description..."
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                    </>
                )}

                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                    <button
                        onClick={handleReport}
                        disabled={loading || !description}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportUserModal;