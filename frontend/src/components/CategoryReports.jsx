import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import SingleReport from './SingleReport';
import { useUser } from '../contexts/UserContext';
import { useModeratedCategories } from '../contexts/ModeratedCategoriesContext'; // Import the moderated categories context
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { isModerator } from '../utils/Auth';
import { Oval } from 'react-loader-spinner';

// Define allowed target types for Category Reports
const CATEGORY_REPORT_TARGET_TYPES = ['All', 'POST', 'COMMENTARY']; // Changed 'COMMENT' to 'COMMENTARY' to match backend/other components

const STATUSES = ['All', 'OPEN', 'UNDER_REVIEW', 'REJECTED', 'RESOLVED'];
const REASONS = ['All', 'SPAM', 'HARASSMENT', 'HATE_SPEECH', 'INAPPROPRIATE_CONTENT', 'OTHER'];
const SORT_OPTIONS = [
    { label: 'Date (Newest)', value: 'reportedAt,DESC' },
    { label: 'Date (Oldest)', value: 'reportedAt,ASC' },
    { label: 'Status (A-Z)', value: 'status,ASC' },
    { label: 'Status (Z-A)', value: 'status,DESC' },
];
const PAGE_SIZE = 8;
const MIN_LOADING_TIME = 300;

const CategoryReports = ({categorySlug}) => {
    const { user, loading: userLoading } = useUser();
    const { moderatedCategorySlugs, loadingModeratedCategories } = useModeratedCategories(); // Use the moderated categories context

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedReason, setSelectedReason] = useState('All');
    const [selectedTargetType, setSelectedTargetType] = useState('All'); // Use the limited target types
    const [sortOption, setSortOption] = useState('reportedAt,DESC');

    const token = Cookies.get('token');
    const observer = useRef();
    const isAuthModerator = isModerator(); // Check if the authenticated user has the global MODERATOR role


    // Check if the user is a moderator of *any* category based on the context
    const isCategoryModerator = isAuthModerator || (Array.isArray(moderatedCategorySlugs) && moderatedCategorySlugs.length > 0);


    const lastReportRef = useCallback(
        node => {
            // Only observe if not loading (any type), and there is more data, and user is a category moderator
            if (loading || initialLoading || !hasMore || !isCategoryModerator) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prev => prev + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, initialLoading, hasMore, isCategoryModerator] // Add isCategoryModerator to dependencies
    );

    const fetchReports = useCallback(async () => {
        // Only fetch if user is a category moderator and moderated categories are loaded
        if (!isCategoryModerator || loadingModeratedCategories) {
            setInitialLoading(false);
            setLoading(false);
            setHasMore(false);
            setReports([]); // Clear reports if not authorized or still loading moderated categories
            return;
        }

        if (page === 0) setInitialLoading(true);
        else setLoading(true);

        const startTime = Date.now();
        let fetchedReports = [];
        let isLast = false;

        try {
            // Fetch reports for moderated categories
            const url = `http://localhost:8080/api/v1/categories/slug/${categorySlug}/reports`;
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    status: selectedStatus !== 'All' ? selectedStatus : undefined,
                    reason: selectedReason !== 'All' ? selectedReason : undefined,
                    // Pass the selected target type if it's not 'All'
                    targetType: selectedTargetType !== 'All' ? selectedTargetType : undefined,
                    sort: sortOption,
                    page,
                    size: PAGE_SIZE,
                },
            });
            fetchedReports = res.data.content || [];
            isLast = res.data.last;

        } catch (err) {
            const errorMessage =
                err.response?.data?.body?.detail?.split(':')[1]?.trim() || 'Failed to load reports.';
            // Only show toast for non-404/500 errors if not initial load (to avoid spam)
            if (page > 0 && err.response?.status !== 404 && err.response?.status !== 500) {
                toast.error(errorMessage);
            } else if (page === 0 && err.response?.status !== 404 && err.response?.status !== 500 && err.response?.status !== 403) {
                // Show toast for initial load errors except 403 (handled by permission message)
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
        isCategoryModerator, // Add isCategoryModerator to dependencies
        loadingModeratedCategories, // Add loadingModeratedCategories to dependencies
        selectedStatus,
        selectedReason,
        selectedTargetType,
        sortOption,
        page,
    ]);

    useEffect(() => {
        // Fetch reports when user, moderated categories, or filters/pagination change
        if (!userLoading && !loadingModeratedCategories) {
            const delay = page === 0 ? 100 : 0; // Small delay for initial fetch on mount
            const handler = setTimeout(() => {
                fetchReports();
            }, delay);
            return () => clearTimeout(handler);
        }
    }, [userLoading, loadingModeratedCategories, selectedStatus, selectedReason, selectedTargetType, sortOption, page, fetchReports]); // Add userLoading and loadingModeratedCategories to dependencies

    const handleStatusChange = e => {
        setSelectedStatus(e.target.value);
        setPage(0); // Reset pagination on filter change
    };
    const handleReasonChange = e => {
        setSelectedReason(e.target.value);
        setPage(0); // Reset pagination on filter change
    };
    const handleTargetTypeChange = e => {
        setSelectedTargetType(e.target.value);
        setPage(0); // Reset pagination on filter change
    };
    const handleSortChange = e => {
        const selectedLabel = e.target.value;
        const selectedValue = SORT_OPTIONS.find(o => o.label === selectedLabel)?.value || 'reportedAt,DESC';
        setSortOption(selectedValue);
        setPage(0); // Reset pagination on sort change
    };

    // Determine overall loading state
    const overallLoading = initialLoading || loading || userLoading || loadingModeratedCategories;


    // Render unauthorized message if the user is not a category moderator after loading
    if (!overallLoading && !isCategoryModerator) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-gray-900">
                <h1 className="text-3xl font-heading text-black mb-8 text-center">Category Reports</h1>
                <p className="text-center text-gray-500 py-10 text-base">
                    You do not have permission to view Category Reports.
                </p>
            </div>
        );
    }


    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-gray-900">
            {(userLoading || loadingModeratedCategories) && (
                <div className="flex justify-center py-12">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                </div>
            )}

            {!initialLoading && isCategoryModerator && (
                <>
                    <div className="flex flex-wrap gap-x-8 gap-y-6 mb-10">
                        {[
                            ['Status', STATUSES, selectedStatus, handleStatusChange],
                            ['Reason', REASONS, selectedReason, handleReasonChange],
                            ['Target Type', CATEGORY_REPORT_TARGET_TYPES, selectedTargetType, handleTargetTypeChange], // Use limited types
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
                                        disabled={overallLoading} // Disable filters while loading
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

                    {(initialLoading || (loading && reports.length === 0)) ? (
                        <div className="flex justify-center py-12">
                            <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                        </div>
                    ) : reports.length === 0 ? (
                        <p className="text-center text-gray-500 py-10 text-base">
                            No reports found matching your criteria in categories you moderate.
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

                    {loading && page > 0 && (
                        <div className="flex justify-center py-6">
                            <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryReports;