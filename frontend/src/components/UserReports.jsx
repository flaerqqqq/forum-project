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
    const [loading, setLoading] = useState(false); // Used for pagination loading state
    const [initialLoading, setInitialLoading] = useState(true); // Used for initial load or new filter load state
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

    const lastReportRef = useCallback(node => {
        if (loading || initialLoading) return; // Prevent triggering while any loading is happening
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, initialLoading, hasMore]); // Include initialLoading in dependencies

    const fetchReports = useCallback(async () => {
        if (page === 0) {
            setInitialLoading(true); // Set initial loading for the first page (new query)
        } else {
            setLoading(true); // Set loading for subsequent pages (pagination)
        }

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
            isLast = true; // Treat errors as the end of data for current query
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
            setTimeout(() => {
                // Append reports for pagination, replace for new searches/filters
                setReports(prev => (page === 0 ? fetchedReports : [...prev, ...fetchedReports]));
                setHasMore(!isLast);
                if (page === 0) {
                    setInitialLoading(false); // End of initial/new query load
                } else {
                    setLoading(false); // End of pagination load
                }
            }, remainingTime);
        }
    }, [token, isModer, reportId, selectedStatus, selectedReason, selectedTargetType, sortOption, page]);

    // Effect to trigger data fetching when relevant state changes
    useEffect(() => {
        if (!user) return;

        // Use a timeout to debounce rapid state changes (e.g., multiple filter changes)
        // and to allow setPage(0) from handlers to take effect before fetching.
        const delay = page === 0 ? 100 : 0; // Debounce first page fetches

        const handler = setTimeout(() => {
            // State (page, filters, sort, reportId) is in desired state here.
            // fetchReports will fetch based on this state and manage its own loading state.
            fetchReports();
        }, delay);

        return () => clearTimeout(handler);

    }, [user, reportId, selectedStatus, selectedReason, selectedTargetType, sortOption, page, fetchReports]); // Dependencies

    // Handlers to update state and reset page on filter/sort/reportId changes
    const handleStatusChange = useCallback((e) => {
        setSelectedStatus(e.target.value);
        setPage(0); // Reset page on filter change
    }, []);

    const handleReasonChange = useCallback((e) => {
        setSelectedReason(e.target.value);
        setPage(0); // Reset page on filter change
    }, []);

    const handleTargetTypeChange = useCallback((e) => {
        setSelectedTargetType(e.target.value);
        setPage(0); // Reset page on filter change
    }, []);

    const handleSortChange = useCallback((e) => {
        const selectedLabel = e.target.value;
        const selectedValue = SORT_OPTIONS.find(o => o.label === selectedLabel)?.value || 'reportedAt,DESC';
        setSortOption(selectedValue);
        setPage(0); // Reset page on sort change
    }, []);

    const handleReportIdChange = useCallback((e) => {
        setReportId(e.target.value);
        setPage(0); // Reset page on report ID change
    }, []);


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
                            onChange={handleReportIdChange}
                        />
                    </div>
                )}

                {[['Status', STATUSES, selectedStatus, handleStatusChange, 'status'],
                    ['Reason', REASONS, selectedReason, handleReasonChange, 'reason'],
                    ['Target Type', TARGET_TYPES, selectedTargetType, handleTargetTypeChange, 'targetType'],
                    ['Sort by', SORT_OPTIONS.map(opt => opt.label),
                        sortOption, // Use the value from state
                        handleSortChange, // Use the specific handler
                        'sortBy'
                    ]
                ].map(([label, options, value, onChange, id], i) => {
                    // For display in the select, find the label corresponding to the current value
                    const displayValue = label === 'Sort by'
                        ? SORT_OPTIONS.find(o => o.value === value)?.label
                        : value;

                    return (
                        <div className="flex flex-col" key={id}> {/* Use id as key */}
                            <label htmlFor={id} className="text-sm font-semibold mb-1 text-gray-600">
                                {label}
                            </label>
                            <select
                                id={id}
                                className="px-4 py-2 rounded-md border"
                                value={displayValue} // Select element uses the display value (label)
                                onChange={onChange} // Use the appropriate handler
                            >
                                {options.map(opt => {
                                    // For sort options, the value of the option should be the label for the select element
                                    // For others, the option value is the status/reason/type string itself
                                    const optionValue = label === 'Sort by' ? opt : opt;

                                    return (
                                        <option key={optionValue} value={optionValue}>{opt}</option>
                                    );
                                })}
                            </select>
                        </div>
                    );
                })}
            </div>

            {/* Conditional Rendering for Initial/New Query Loading, No Results, or Reports List */}
            {initialLoading && reports.length === 0 ? ( // Show initial spinner only if initial loading and no reports loaded yet
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
            ) : reports.length === 0 && !initialLoading ? ( // Show "No reports found" if reports is empty and initial loading is done
                <p className="text-gray-500">No reports found.</p>
            ) : (
                // Reports list (only show if reports.length > 0)
                reports.length > 0 && (
                    <div className="space-y-4">
                        {reports.map((report, i) => (
                            // Use report.id for key, and ref the last element
                            <div key={report.id} ref={i === reports.length - 1 ? lastReportRef : null}>
                                <SingleReport report={report} reportedEntityName={report.targetId} />
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Pagination Spinner */}
            {loading && reports.length > 0 && ( // Show pagination spinner if loading AND there are already reports
                <div className="flex justify-center mt-4">
                    <Oval
                        height={30}
                        width={30}
                        color="#3b82f6"
                        secondaryColor="#dbeafe"
                        strokeWidth={3}
                        visible={true}
                    />
                </div>
            )}

            {/* "Scroll to load" message */}
            {!loading && hasMore && reports.length > 0 && !initialLoading && ( // Show message if not loading pagination, has more, reports exist, and initial load is done
                <p className="text-gray-500 mt-4 text-center">Scroll down to load more reports...</p>
            )}
        </div>
    );
};

export default UserReports;