import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import SingleReport from './SingleReport';
import { useUser } from '../contexts/UserContext';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const STATUSES = ['All', 'OPEN', 'UNDER_REVIEW', 'REJECTED', 'RESOLVED'];
const REASONS = ['All', 'SPAM', 'HARASSMENT', 'HATE_SPEECH', 'INAPPROPRIATE_CONTENT', 'OTHER'];
const TARGET_TYPES = ['All', 'USER', 'POST', 'COMMENT'];
const SORT_OPTIONS = [
    { label: 'Date (Newest)', value: 'reportedAt,DESC' },
    { label: 'Date (Oldest)', value: 'reportedAt,ASC' },
    { label: 'Status (A-Z)', value: 'status,ASC' },
    { label: 'Status (Z-A)', value: 'status,DESC' },
];

const PAGE_SIZE = 8;

const UserReports = () => {
    const { user } = useUser();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedReason, setSelectedReason] = useState('All');
    const [selectedTargetType, setSelectedTargetType] = useState('All');
    const [sortOption, setSortOption] = useState('reportedAt,DESC');

    const token = Cookies.get('token');
    const observer = useRef();

    const lastReportRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/users/me/reports`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    status: selectedStatus !== 'All' ? selectedStatus : undefined,
                    reason: selectedReason !== 'All' ? selectedReason : undefined,
                    targetType: selectedTargetType !== 'All' ? selectedTargetType : undefined,
                    sort: sortOption,
                    page,
                    size: PAGE_SIZE,
                },
            });

            const newReports = res.data.content || [];
            setReports(prev => (page === 0 ? newReports : [...prev, ...newReports]));
            setHasMore(!res.data.last);
        } catch (err) {
            const errorMessage = err.response?.data?.body?.detail.split(':')[1] || 'Failed to load reports. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [token, selectedStatus, selectedReason, selectedTargetType, sortOption, page]);

    useEffect(() => {
        if (user) fetchReports();
    }, [user, fetchReports]);

    // Reset on filters change
    useEffect(() => {
        setPage(0);
        setReports([]);
        setHasMore(true);
    }, [selectedStatus, selectedReason, selectedTargetType, sortOption]);

    return (
        <div className="mt-6 bg-white rounded-lg shadow p-6 text-gray-800">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">🚨 My Reports</h2>

            <div className="flex gap-4 mb-4 flex-wrap">
                {/* Filters */}
                {[
                    ['Status', STATUSES, selectedStatus, e => setSelectedStatus(e.target.value), 'status'],
                    ['Reason', REASONS, selectedReason, e => setSelectedReason(e.target.value), 'reason'],
                    ['Target Type', TARGET_TYPES, selectedTargetType, e => setSelectedTargetType(e.target.value), 'targetType'],
                    [
                        'Sort by',
                        SORT_OPTIONS.map(opt => opt.label),
                        sortOption,
                        e => setSortOption(SORT_OPTIONS.find(o => o.label === e.target.value)?.value || 'reportedAt,DESC'),
                        'sortBy'
                    ]
                ].map(([label, options, value, onChange, id], i) => {
                    const displayValue = label === 'Sort by'
                        ? SORT_OPTIONS.find(o => o.value === value)?.label
                        : value;

                    return (
                        <div className="flex flex-col" key={i}>
                            <label htmlFor={id} className="text-sm font-semibold mb-1 text-gray-600">
                                {label}
                            </label>
                            <select
                                id={id}
                                className="px-4 py-2 rounded-md border"
                                value={displayValue}
                                onChange={onChange}
                            >
                                {options.map(opt => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>

            {reports.length === 0 && !loading ? (
                <p className="text-gray-500">You haven't submitted any reports yet.</p>
            ) : (
                <div className="space-y-4">
                    {reports.map((report, i) => (
                        <div key={report.id} ref={i === reports.length - 1 ? lastReportRef : null}>
                            <SingleReport report={report} reportedEntityName={report.targetId} />
                        </div>
                    ))}
                </div>
            )}

            {loading && <p className="text-gray-500 mt-4">Loading more reports...</p>}
        </div>
    );
};

export default UserReports;