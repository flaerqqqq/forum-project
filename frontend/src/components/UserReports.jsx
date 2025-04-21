import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import SingleReport from './SingleReport';
import { useUser } from '../contexts/UserContext';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { isModerator } from '../utils/Auth';
import { Oval } from 'react-loader-spinner';

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
const MIN_LOADING_TIME = 300;

const UserReports = () => {
    const { user } = useUser();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [reportId, setReportId] = useState('');

    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedReason, setSelectedReason] = useState('All');
    const [selectedTargetType, setSelectedTargetType] = useState('All');
    const [sortOption, setSortOption] = useState('reportedAt,DESC');

    const token = Cookies.get('token');
    const observer = useRef();
    const isModer = isModerator();

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
        const startTime = Date.now();
        let fetchedReports = [];
        let isLast = false;

        try {
            if (reportId.trim()) {
                const res = await axios.get(`http://localhost:8080/api/v1/reports/${reportId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchedReports = [res.data];
                isLast = true;
            } else {
                const url = isModer
                    ? 'http://localhost:8080/api/v1/reports'
                    : 'http://localhost:8080/api/v1/users/me/reports';

                const res = await axios.get(url, {
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

                fetchedReports = res.data.content || [];
                isLast = res.data.last;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.body?.detail?.split(':')[1] || 'Failed to load reports. Please try again.';
            if (err.response?.status !== 404 && err.response?.status !== 500) {
                toast.error(errorMessage);
            }
            fetchedReports = [];
            isLast = true;
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
            setTimeout(() => {
                setReports(prev => (page === 0 ? fetchedReports : [...prev, ...fetchedReports]));
                setHasMore(!isLast);
                setLoading(false);
                setInitialLoadDone(true);
            }, remainingTime);
        }
    }, [token, isModer, reportId, selectedStatus, selectedReason, selectedTargetType, sortOption, page]);

    useEffect(() => {
        if (!user) return;

        const timeout = setTimeout(() => {
            setPage(0);
            setReports([]);
            setHasMore(true);
            setInitialLoadDone(false);
            fetchReports();
        }, 300);

        return () => clearTimeout(timeout);
    }, [user, reportId, selectedStatus, selectedReason, selectedTargetType, sortOption]);

    return (
        <div className="mt-6 bg-white rounded-lg shadow p-6 text-gray-800">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{isModer ? '🛡️ Moderator Reports' : '🚨 My Reports'}</h2>

            <div className="flex gap-4 mb-4 flex-wrap">
                {isModer && (
                    <div className="flex flex-col">
                        <label htmlFor="reportId" className="text-sm font-semibold mb-1 text-gray-600">
                            Report ID
                        </label>
                        <input
                            id="reportId"
                            type="text"
                            className="px-4 py-2 rounded-md border"
                            placeholder="Enter Report ID"
                            value={reportId}
                            onChange={e => setReportId(e.target.value)}
                        />
                    </div>
                )}

                {[['Status', STATUSES, selectedStatus, e => setSelectedStatus(e.target.value), 'status'],
                    ['Reason', REASONS, selectedReason, e => setSelectedReason(e.target.value), 'reason'],
                    ['Target Type', TARGET_TYPES, selectedTargetType, e => setSelectedTargetType(e.target.value), 'targetType'],
                    ['Sort by', SORT_OPTIONS.map(opt => opt.label),
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
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>

            {!initialLoadDone ? (
                <div className="flex justify-center mt-4">
                    <Oval
                        height={40}
                        width={40}
                        color="#3b82f6"
                        secondaryColor="#dbeafe"
                        strokeWidth={4}
                        visible={true}
                    />
                </div>
            ) : reports.length === 0 ? (
                <p className="text-gray-500">No reports found.</p>
            ) : (
                <div className="space-y-4">
                    {reports.map((report, i) => (
                        <div key={report.id} ref={i === reports.length - 1 ? lastReportRef : null}>
                            <SingleReport report={report} reportedEntityName={report.targetId} />
                        </div>
                    ))}
                </div>
            )}

            {!loading && hasMore && reports.length > 0 && (
                <p className="text-gray-500 mt-4">Loading more reports...</p>
            )}
        </div>
    );
};

export default UserReports;