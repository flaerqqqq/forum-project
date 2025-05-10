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
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [reportId, setReportId] = useState('');

    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedReason, setSelectedReason] = useState('All');
    const [selectedTargetType, setSelectedTargetType] = useState('All');
    const [sortOption, setSortOption] = useState('reportedAt,DESC');

    const token = Cookies.get('token');
    const observer = useRef();
    const isModer = isModerator();

    const lastReportRef = useCallback(
        node => {
            if (loading || initialLoading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prev => prev + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, initialLoading, hasMore]
    );

    const fetchReports = useCallback(async () => {
        if (page === 0) setInitialLoading(true);
        else setLoading(true);

        const startTime = Date.now();
        let fetchedReports = [];
        let isLast = false;

        try {
            if (reportId.trim()) {
                const res = await axios.get(`http://localhost:8080/api/v1/reports/${reportId}`, {
                    headers: { Authorization: `Bearer ${token}` },
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
            const errorMessage =
                err.response?.data?.body?.detail?.split(':')[1]?.trim() || 'Failed to load reports.';
            if (err.response?.status === 404 && reportId.trim()) {
                // Do nothing
            } else if (err.response?.status !== 404 && err.response?.status !== 500) {
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
                if (page === 0) setInitialLoading(false);
                else setLoading(false);
            }, remainingTime);
        }
    }, [
        token,
        isModer,
        reportId,
        selectedStatus,
        selectedReason,
        selectedTargetType,
        sortOption,
        page,
    ]);

    useEffect(() => {
        if (!user) return;
        const delay = page === 0 ? 100 : 0;
        const handler = setTimeout(() => {
            fetchReports();
        }, delay);
        return () => clearTimeout(handler);
    }, [user, reportId, selectedStatus, selectedReason, selectedTargetType, sortOption, page, fetchReports]);

    const handleStatusChange = e => {
        setSelectedStatus(e.target.value);
        setPage(0);
    };
    const handleReasonChange = e => {
        setSelectedReason(e.target.value);
        setPage(0);
    };
    const handleTargetTypeChange = e => {
        setSelectedTargetType(e.target.value);
        setPage(0);
    };
    const handleSortChange = e => {
        const selectedLabel = e.target.value;
        const selectedValue = SORT_OPTIONS.find(o => o.label === selectedLabel)?.value || 'reportedAt,DESC';
        setSortOption(selectedValue);
        setPage(0);
    };
    const handleReportIdChange = e => {
        setReportId(e.target.value);
        setPage(0);
    };

    return (
        <div className="mx-auto font-sans text-gray-900">
            <div className="flex flex-wrap gap-x-8 gap-y-6 mb-10">
                {isModer && (
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1 uppercase">Report ID</label>
                        <input
                            type="text"
                            className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-1 text-sm text-gray-800 placeholder-gray-400"
                            placeholder="Enter Report ID"
                            value={reportId}
                            onChange={handleReportIdChange}
                        />
                    </div>
                )}

                {[
                    ['Status', STATUSES, selectedStatus, handleStatusChange],
                    ['Reason', REASONS, selectedReason, handleReasonChange],
                    ['Target Type', TARGET_TYPES, selectedTargetType, handleTargetTypeChange],
                    ['Sort by', SORT_OPTIONS.map(o => o.label), sortOption, handleSortChange],
                ].map(([label, options, value, onChange], index) => {
                    const id = `filter-${index}`;
                    const displayValue =
                        label === 'Sort by' ? SORT_OPTIONS.find(o => o.value === value)?.label : value;

                    return (
                        <div key={id} className="flex flex-col">
                            <label className="text-xs font-medium text-gray-500 mb-1 uppercase">{label}</label>
                            <select
                                className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-1 text-sm text-gray-800"
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

            {initialLoading && reports.length === 0 ? (
                <div className="flex justify-center py-12">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                </div>
            ) : reports.length === 0 && !initialLoading ? (
                <p className="text-center text-gray-500 py-10 text-base">
                    {reportId.trim()
                        ? `Report with ID "${reportId}" not found.`
                        : 'No reports found matching your criteria.'}
                </p>
            ) : (
                <div className="space-y-6">
                    {reports.map((report, i) => (
                        <div key={report.id} ref={i === reports.length - 1 ? lastReportRef : null}>
                            <SingleReport report={report} reportedEntityName={report.targetId} />
                        </div>
                    ))}
                </div>
            )}

            {loading && reports.length > 0 && (
                <div className="flex justify-center py-6">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                </div>
            )}
        </div>
    );
};

export default UserReports;