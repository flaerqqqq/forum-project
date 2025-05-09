// components/PostCommentaries.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Commentary from './Commentary';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useUser } from "../contexts/UserContext.jsx";
import Cookies from "js-cookie";

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const getNormalizedTextLength = (html) => {
    if (!html) return 0;
    const div = document.createElement('div');
    div.innerHTML = html;
    let text = div.textContent || '';

    text = text.replace(/\s*\n\s*(?=\n)/g, '\n').trim();

    return text.length;
};

const CharacterCount = ({ max, current }) => {
    const counterColorClass = (max - current) < 100 ? 'text-red-500' : (max - current) < 200 ? 'text-yellow-600' : 'text-gray-500';

    return (
        <div className={`text-sm text-right ${counterColorClass}`}>
            <span>{current}/{max} characters</span>
        </div>
    );
};

const ROOT_COMMENTS_PER_PAGE = 10;
const SCROLL_THRESHOLD = 500;
const MAX_ROOT_COMMENTARY_TEXT_LENGTH = 1000;
// Define the sort parameters for root comments (matches backend expectation)
const SORT_PARAMS = {
    'newest': 'createdAt,desc',
    'oldest': 'createdAt,asc',
    // Add other sort options if needed, e.g., 'likes,desc': 'likes,desc'
};


const PostCommentaries = ({ postId, isUserCategoryModerator}) => {
    const { user } = useUser();

    const [rootComments, setRootComments] = useState([]);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true); // For first load
    const [isLoadingMore, setIsLoadingMore] = useState(false);   // For infinite scroll
    const [isRefetching, setIsRefetching] = useState(false);     // For sort changes or manual refresh

    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest'); // State to hold the selected sort key

    const isFetchingRef = useRef(false); // Still useful to prevent multiple concurrent fetches
    const pageRef = useRef(0);
    const hasMoreRef = useRef(true);
    const sortOrderRef = useRef('newest');
    const rootCommentariesRef = useRef(null); // *** Ref for the comments container ***


    const [showRootCommentaryInput, setShowRootCommentaryInput] = useState(false);
    const [rootCommentaryContent, setRootCommentaryContent] = useState('');
    const [submittingRootCommentary, setSubmittingRootCommentary] = useState(false);
    const rootCommentaryEditorRef = useRef(null);


    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const quillFormats = [
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ];

    // Update refs when state changes
    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    useEffect(() => {
        sortOrderRef.current = sortOrder;
    }, [sortOrder]);

    useEffect(() => {
        const editorElement = rootCommentaryEditorRef.current?.getEditor().container.querySelector('.ql-editor');
        if (editorElement) {
            editorElement.style.height = 'auto';
            editorElement.style.height = editorElement.scrollHeight + 'px';
            editorElement.style.minHeight = '100px';
        }
    }, [rootCommentaryContent, showRootCommentaryInput]);


    const fetchRootComments = useCallback(async (pageNumber = 0, append = true, currentSortKey) => {
        const activeSortKey = currentSortKey || sortOrderRef.current;
        const sortParam = SORT_PARAMS[activeSortKey] || SORT_PARAMS['newest'];

        if (isFetchingRef.current || (!hasMoreRef.current && append)) {
            if (append) return;
        }

        isFetchingRef.current = true;
        setError(null);

        if (!append && pageNumber === 0) {
            // This is a new list fetch (initial or sort change)
            if (rootComments.length === 0) {
                setIsLoadingInitial(true);
            } else {
                // This is a sort/refresh fetch while comments are visible
                setIsRefetching(true);
                // *** Capture and set min-height before fetch starts state update ***
                if (rootCommentariesRef.current) {
                    rootCommentariesRef.current.style.minHeight = `${rootCommentariesRef.current.clientHeight}px`;
                }
            }
            // DO NOT clear rootComments here yet
        } else if (append) {
            // This is a load more fetch
            setIsLoadingMore(true);
        }


        const params = {
            postId: postId,
            parentId: null,
            page: pageNumber,
            size: ROOT_COMMENTS_PER_PAGE,
            sort: sortParam,
        };

        console.log(`Workspaceing root comments for postId: ${postId} with params:`, params);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/commentaries`, { params });

            const fetchedComments = res.data.content;
            const hasMoreFromServer = !res.data.last;

            if (!append && pageNumber === 0) { // Fresh load (initial or sort change)
                console.log(`Fresh load for postId: ${postId}. Setting ${fetchedComments.length} root comments.`);
                // *** This is the line that replaces the old list AFTER fetch ***
                setRootComments(fetchedComments || []);
                setPage(0);
                pageRef.current = 0;
                setHasMore(hasMoreFromServer);
                hasMoreRef.current = hasMoreFromServer;

            } else { // Appending comments (infinite scroll)
                if (!fetchedComments || fetchedComments.length === 0) {
                    setHasMore(false);
                    hasMoreRef.current = false;
                } else {
                    setRootComments(prev => {
                        const existingCommentIds = new Set(prev.map(c => c.id));
                        const uniqueNewComments = fetchedComments.filter(c => !existingCommentIds.has(c.id));
                        return [...prev, ...uniqueNewComments];
                    });
                    setPage(pageNumber);
                    pageRef.current = pageNumber;
                    setHasMore(hasMoreFromServer);
                    hasMoreRef.current = hasMoreFromServer;
                }
            }

            // Handle no results on fresh load
            if (!append && pageNumber === 0 && (!fetchedComments || fetchedComments.length === 0)) {
                setRootComments([]); // Clear if the new result set is empty
                setHasMore(false);
                hasMoreRef.current = false;
            }


        } catch (err) {
            if (err.response?.status === 204) {
                setHasMore(false);
                hasMoreRef.current = false;
            }
            // If initial fetch failed, ensure comments list is empty
            if (!append && pageNumber === 0 && rootComments.length === 0) {
                setRootComments([]);
            }

        } finally {
            setIsLoadingInitial(false);
            setIsLoadingMore(false);
            setIsRefetching(false); // Hide the sorting spinner
            isFetchingRef.current = false;
            console.log(`Finished fetching root comments for postId: ${postId}.`);

            // *** Remove the min-height after the new comments have rendered ***
            // Use requestAnimationFrame to ensure DOM update has potentially happened
            requestAnimationFrame(() => {
                if (rootCommentariesRef.current) {
                    rootCommentariesRef.current.style.minHeight = ''; // Remove the min-height
                }
            });

        }
    }, [postId, rootComments.length]); // Dependency includes rootComments.length

    // Effect to fetch initial comments and re-fetch on postId or sortOrder change
    useEffect(() => {
        console.log(`useEffect triggered in PostCommentaries. postId: ${postId}, sortOrder: ${sortOrder}`);
        if (postId) {
            // Reset pagination state
            setPage(0);
            pageRef.current = 0;
            setHasMore(true);
            hasMoreRef.current = true;
            setError(null);
            // Fetch root comments with the current sort order (not appending)
            // This will trigger either isLoadingInitial or isRefetching state
            fetchRootComments(0, false, sortOrder);
        }
        // Dependencies: postId to fetch comments for the correct post,
        // sortOrder to refetch when sort changes, fetchRootComments because it's called here.
    }, [postId, sortOrder, fetchRootComments]);


    // Effect for infinite scrolling
    const handleScroll = useCallback(() => {
        // Only trigger if not already fetching anything
        if (isLoadingInitial || isLoadingMore || isRefetching || isFetchingRef.current || !hasMoreRef.current) {
            return;
        }

        const isNearBottom =
            window.innerHeight + window.scrollY >= document.body.offsetHeight - SCROLL_THRESHOLD;

        if (isNearBottom) {
            console.log("Scroll handler: Near bottom, fetching next page.");
            fetchRootComments(pageRef.current + 1, true, sortOrderRef.current);
        }
    }, [fetchRootComments, isLoadingInitial, isLoadingMore, isRefetching]); // Add loading states to dependencies


    useEffect(() => {
        console.log("Adding scroll listener.");
        window.addEventListener('scroll', handleScroll);
        return () => {
            console.log("Removing scroll listener.");
            window.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const handleSortChange = (newSortOrderKey) => {
        console.log(`Sort order change requested to: ${newSortOrderKey}`);
        if (newSortOrderKey !== sortOrder) {
            setSortOrder(newSortOrderKey); // Update the sortOrder state
            // The useEffect watching sortOrder will handle the refetch,
            // which will now trigger isRefetching state and the height fix.
        }
    };

    const handleSubmitRootCommentary = async () => {
        const normalizedPlainTextContent = getNormalizedTextLength(rootCommentaryContent);

        if (normalizedPlainTextContent === 0) {
            toast.error('Commentary content cannot be empty.');
            return;
        }
        if (normalizedPlainTextContent > MAX_ROOT_COMMENTARY_TEXT_LENGTH) {
            toast.error(`Commentary exceeds the maximum text length of ${MAX_ROOT_COMMENTARY_TEXT_LENGTH} characters after normalization.`);
            return;
        }

        if (submittingRootCommentary) return;

        try {
            setSubmittingRootCommentary(true);

            const payload = {
                postId: postId,
                parentId: null,
                content: rootCommentaryContent,
            };

            console.log("Submitting new root commentary.");
            const res = await axios.post('http://localhost:8080/api/v1/commentaries', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });

            if (res.status === 201) {
                toast.success('Commentary posted.');
                const newCommentary = {
                    ...res.data,
                    hasReplies: res.data.hasReplies ?? false,
                    repliesCount: res.data.repliesCount ?? 0,
                };

                setRootCommentaryContent('');
                setShowRootCommentaryInput(false);

                // After posting, decide how to update the list:
                if (sortOrder === 'newest') {
                    // Add the new comment to the top optimistically if sorting by newest
                    setRootComments(prev => [newCommentary, ...prev]);
                    // Reset pagination state as a new item is added to the first page
                    setPage(0);
                    pageRef.current = 0;
                    // We might still have more comments after this new one,
                    // setting hasMore to true is safer unless we know the total count.
                    // A full refetch is the safest for pagination accuracy, but we optimize for newest sort.
                    setHasMore(true); // Assume there might be more pages now
                    hasMoreRef.current = true;

                } else {
                    // If sorting by anything else, a full refetch is needed
                    console.log(`Posted new comment. Current sort is ${sortOrder}. Refetching root comments.`);
                    // Trigger a refetch for the first page, which handles loading and state reset
                    fetchRootComments(0, false, sortOrder);
                }

            } else {
                toast.error('Failed to post commentary.');
            }
        } catch (err) {
            console.error('Error submitting root commentary:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to post commentary.';
            toast.error(errorMessage);
        } finally {
            setSubmittingRootCommentary(false);
        }
    };

    const rootCommentaryTextLength = getNormalizedTextLength(rootCommentaryContent);

    // Combine loading states for disabling buttons/inputs
    const isLoading = isLoadingInitial || isLoadingMore || isRefetching || submittingRootCommentary;

    // Handler for when a comment (root or reply) is deleted anywhere in the tree
    const handleRootCommentDeleted = useCallback((deletedCommentId) => {
        console.log(`[PostCommentaries] Root comment deleted signal received for ID: ${deletedCommentId}. Removing from root comments list.`);
        setRootComments(prevRootComments => {
            const newRootComments = prevRootComments.filter(comment => comment.id !== deletedCommentId);
            console.log(`[PostCommentaries] Root comments count before filter: ${prevRootComments.length}, after filter: ${newRootComments.length}`);
            return newRootComments;
        });
    }, []);


    return (
        <div className="post-commentaries mt-8">
            {user && (
                <div className="mb-6">
                    {!showRootCommentaryInput ? (
                        <button
                            onClick={() => setShowRootCommentaryInput(true)}
                            className="w-full text-left text-gray-500 p-2 border border-gray-300 rounded-3xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-green transition-colors duration-200"
                        >
                            <span className="text-md font-normal px-2">Write a comment...</span>
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <div className="commentary-quill-wrapper">
                                <ReactQuill
                                    ref={rootCommentaryEditorRef}
                                    theme="snow"
                                    value={rootCommentaryContent}
                                    onChange={setRootCommentaryContent}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Write your comment..."
                                    className="commentary-quill"
                                />
                            </div>

                            <CharacterCount max={MAX_ROOT_COMMENTARY_TEXT_LENGTH} current={rootCommentaryTextLength} />

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => {
                                        setShowRootCommentaryInput(false);
                                        setRootCommentaryContent('');
                                    }}
                                    disabled={submittingRootCommentary}
                                    className="px-4 py-1 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitRootCommentary}
                                    disabled={submittingRootCommentary || rootCommentaryTextLength === 0 || rootCommentaryTextLength > MAX_ROOT_COMMENTARY_TEXT_LENGTH}
                                    className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {submittingRootCommentary ? (
                                        <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />
                                    ) : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sorting Options */}
            <div className="flex items-center space-x-1 mb-4 justify-end">
                <span className="text-sm text-gray-600">Sort By:</span>
                <button
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${sortOrder === 'newest' ? 'bg-accent-green text-white' : 'bg-gray-light text-gray-darker hover:bg-gray-medium'}`}
                    onClick={() => handleSortChange('newest')}
                    disabled={isLoading}
                >
                    Newest
                </button>
                <button
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${sortOrder === 'oldest' ? 'bg-accent-green text-white' : 'bg-gray-light text-gray-darker hover:bg-gray-medium'}`}
                    onClick={() => handleSortChange('oldest')}
                    disabled={isLoading}
                >
                    Oldest
                </button>
            </div>

            {/* Initial Loading Spinner - Only shown when comments list is empty on initial load */}
            {isLoadingInitial && rootComments.length === 0 && !error && (
                <div className="w-full flex items-center justify-center py-8">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} />
                </div>
            )}

            {/* No Comments Message - Only shown when NOT loading and list is empty */}
            {!isLoadingInitial && !isRefetching && rootComments.length === 0 && !error && (
                <div className="text-center text-gray-medium">
                    <hr className="my-4 border-gray-300" />
                    No comments yet. Be the first to comment!
                </div>
            )}

            {/* Render Comments List */}
            {/* *** Attach the ref here and conditionally render based on initial loading state *** */}
            <div ref={rootCommentariesRef} className="root-commentaries">
                {(!isLoadingInitial || rootComments.length > 0) && rootComments.map(commentary => (
                    <Commentary
                        key={commentary.id}
                        commentary={commentary}
                        postId={postId}
                        isInitialRender={true}
                        shouldExpandSmallTrees={true}
                        isUserCategoryModerator={isUserCategoryModerator}
                        onCommentDeleted={handleRootCommentDeleted}
                        sortOrder={SORT_PARAMS[sortOrder] || SORT_PARAMS['newest']}
                    />
                ))}
            </div>

            {/* Loading More Spinner - Shown at the bottom when scrolling */}
            {isLoadingMore && (
                <div className="w-full flex items-center justify-center py-8">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} />
                </div>
            )}

        </div>
    );
};

export default PostCommentaries;