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
const MIN_LOADING_TIME = 300;

const SORT_PARAMS = {
    'newest': 'createdAt,desc',
    'oldest': 'createdAt,asc',
};


const PostCommentaries = ({ postId, isUserCategoryModerator}) => {
    const { user } = useUser();

    const [rootComments, setRootComments] = useState([]);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);

    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');

    const isFetchingRef = useRef(false);
    const pageRef = useRef(0);
    const hasMoreRef = useRef(true);
    const sortOrderRef = useRef('newest');
    const rootCommentariesRef = useRef(null);


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
        pageRef.current = page;
    }, [page]);


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
            if (rootComments.length === 0) {
                setIsLoadingInitial(true);
            } else {
                setIsRefetching(true);
            }
        } else if (append) {
            setIsLoadingMore(true);
        }

        setPage(pageNumber);

        const startTime = Date.now();

        const params = {
            postId: postId,
            parentId: null,
            page: pageNumber,
            size: ROOT_COMMENTS_PER_PAGE,
            sort: sortParam,
        };

        console.log(`Fetching root comments for postId: ${postId} with params:`, params);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/commentaries`, { params });


            const fetchedComments = res.status === 204 ? [] : res.data.content;
            const hasMoreFromServer = !res.data.last;

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                if (!append && pageNumber === 0) {
                    console.log(`Fresh load for postId: ${postId}. Setting ${fetchedComments.length} root comments.`);
                    setRootComments(fetchedComments || []);

                    setHasMore(hasMoreFromServer);
                    hasMoreRef.current = hasMoreFromServer;

                } else {
                    if (!fetchedComments || fetchedComments.length === 0) {
                        setHasMore(false);
                        hasMoreRef.current = false;
                    } else {
                        setRootComments(prev => {
                            const existingCommentIds = new Set(prev.map(c => c.id));
                            const uniqueNewComments = fetchedComments.filter(c => !existingCommentIds.has(c.id));
                            return [...prev, ...uniqueNewComments];
                        });

                        setHasMore(hasMoreFromServer);
                        hasMoreRef.current = hasMoreFromServer;
                    }
                }


                if (!append && pageNumber === 0 && (!fetchedComments || fetchedComments.length === 0)) {
                    setRootComments([]);
                    setHasMore(false);
                    hasMoreRef.current = false;
                }

                setIsLoadingInitial(false);
                setIsLoadingMore(false);
                setIsRefetching(false);
                isFetchingRef.current = false;
                console.log(`Finished fetching root comments for postId: ${postId}.`);

            }, remainingTime);


        } catch (err) {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                if (err.response?.status === 204) {
                    setHasMore(false);
                    hasMoreRef.current = false;
                }

                if (!append && pageNumber === 0 && rootComments.length === 0) {
                    setRootComments([]);
                }

                setIsLoadingInitial(false);
                setIsLoadingMore(false);
                setIsRefetching(false);
                isFetchingRef.current = false;
                console.error('Error fetching root comments:', err);
                const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to load comments.';
                setError(errorMessage);
                toast.error(errorMessage);
            }, remainingTime);
        }
    }, [postId, sortOrder]);


    useEffect(() => {
        console.log(`useEffect triggered in PostCommentaries. postId: ${postId}, sortOrder: ${sortOrder}`);
        if (postId) {
            setPage(0);
            pageRef.current = 0;
            setHasMore(true);
            hasMoreRef.current = true;
            setError(null);
            fetchRootComments(0, false, sortOrder);
        }
    }, [postId, sortOrder, fetchRootComments]);


    const handleScroll = useCallback(() => {
        if (isFetchingRef.current || !hasMoreRef.current) {
            return;
        }

        const container = rootCommentariesRef.current;
        if (!container) return;

        const containerBottom = container.getBoundingClientRect().bottom;
        const viewportHeight = window.innerHeight;

        const isNearBottomOfContainer = containerBottom <= (viewportHeight + SCROLL_THRESHOLD);

        if (isNearBottomOfContainer) {
            console.log("Scroll handler: Near bottom of container, fetching next page.");
            const nextPage = pageRef.current + 1;
            pageRef.current = nextPage;
            fetchRootComments(nextPage, true, sortOrderRef.current);
        }
    }, [fetchRootComments]);


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
            setSortOrder(newSortOrderKey);
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

                if (sortOrder === 'newest') {
                    setRootComments(prev => [newCommentary, ...prev]);
                    setPage(0);
                    pageRef.current = 0;
                    setHasMore(true);
                    hasMoreRef.current = true;

                } else {
                    console.log(`Posted new comment. Current sort is ${sortOrder}. Refetching root comments.`);
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

    const isLoading = isLoadingInitial || isLoadingMore || isRefetching || submittingRootCommentary;

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
                <hr className="border-gray-300 my-2" />

            <div ref={rootCommentariesRef} className={`${isLoadingInitial || isRefetching ? 'min-h-[200px]' : ''}`}>
                {(isLoadingInitial || isRefetching) && rootComments.length === 0 && !error ? (
                    <div className="w-full h-full flex items-center justify-center py-8"> {/* Use w-full h-full to fill min-height */}
                        <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} /> {/* Increased size */}
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-center py-10">
                        <p>{error}</p>
                    </div>
                ) : rootComments.length === 0 ? (
                    <div className="text-center text-gray-medium py-4"> {/* Added py-4 */}
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    <div className="root-commentaries"> {/* Keep the original root-commentaries div */}
                        {rootComments.map(commentary => (
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
                )}
            </div>

            {isLoadingMore && (
                <div className="w-full flex items-center justify-center py-8"> {/* Adjusted padding */}
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={5} /> {/* Increased size */}
                </div>
            )}

        </div>
    );
};

export default PostCommentaries;