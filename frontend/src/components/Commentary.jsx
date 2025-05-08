import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../contexts/UserContext.jsx";
import Cookies from "js-cookie";
import DOMPurify from 'dompurify';
import { DeletedCommentsContext } from '../contexts/DeletedCommentsContext';

// --- Helper Functions ---
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

// --- Constants ---
const REPLIES_PER_PAGE = 5;
const LOAD_ALL_THRESHOLD = 4;
const MAX_COMMENTARY_TEXT_LENGTH = 1000;
const DEFAULT_REPLY_SORT = 'createdAt,asc'; // Define a default sort for replies

// --- React-Quill Imports ---
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// --- Commentary Component ---
const Commentary = ({ commentary, postId, isInitialRender = true, shouldExpandSmallTrees = true, depth = 0, onCommentDeleted, sortOrder }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { deletedCommentIds, addDeletedCommentId } = useContext(DeletedCommentsContext);

    // Check if the current comment has been marked as deleted
    const isDeleted = deletedCommentIds.includes(commentary.id);

    // If the comment is deleted, render nothing
    if (isDeleted) {
        return null;
    }

    // --- State Variables ---
    const [commentaryDisplayContent, setCommentaryContent] = useState(commentary.content);
    const [currentRepliesCount, setCurrentRepliesCount] = useState(commentary.repliesCount || 0);
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyPage, setReplyPage] = useState(0);
    const [hasMoreReplies, setHasMoreReplies] = useState(commentary.hasReplies && !(Array.isArray(commentary.replies) && commentary.replies.length > 0));
    const [errorReplies, setErrorReplies] = useState(null);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false); // Tracks if initial replies (if any) were processed
    const [isEditing, setIsEditing] = useState(false);
    const [editingContent, setEditingContent] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // --- Refs ---
    const dropdownRef = useRef(null);
    const replyEditorRef = useRef(null);
    const editingEditorRef = useRef(null);
    const prevSortOrderRef = useRef(sortOrder); // Ref to track previous sortOrder


    // --- Quill Modules and Formats ---
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

    // --- Effects ---

    // Effect for initial load or when initial replies are provided
    useEffect(() => {
        if (Array.isArray(commentary.replies) && commentary.replies.length > 0) {
            const initialReplies = commentary.replies.filter(reply => !deletedCommentIds.includes(reply.id));
            setReplies(initialReplies);
            setHasMoreReplies(false); // If initial replies were provided, there's no more to fetch initially

            if (isInitialRender && shouldExpandSmallTrees) {
                setShowReplies(true);
            }

            setInitialLoadDone(true); // Mark initial load (processing of initial replies) as done
        } else {
            setInitialLoadDone(true); // Also mark as done if no initial replies
        }
        // Dependencies: Only run when initial replies or deleted status changes on mount/initial render
        // Added dependency on commentary.id as this effect is tied to the specific comment
    }, [commentary.replies, deletedCommentIds, isInitialRender, shouldExpandSmallTrees, commentary.id]);


    // Effect to handle clicking outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    // Effects to auto-resize Quill editors
    useEffect(() => {
        const editorElement = replyEditorRef.current?.getEditor().container.querySelector('.ql-editor');
        if (editorElement) {
            editorElement.style.height = 'auto';
            editorElement.style.height = editorElement.scrollHeight + 'px';
            editorElement.style.minHeight = '80px';
        }
    }, [replyContent, isReplying]);

    useEffect(() => {
        const editorElement = editingEditorRef.current?.getEditor().container.querySelector('.ql-editor');
        if (editorElement) {
            editorElement.style.height = 'auto';
            editorElement.style.height = editorElement.scrollHeight + 'px';
            editorElement.style.minHeight = '80px';
        }
    }, [editingContent, isEditing]);


    // Function to fetch replies with dynamic sorting
    const fetchReplies = useCallback(async (pageNumber = 0, size = REPLIES_PER_PAGE) => {
        setLoadingReplies(true);
        setErrorReplies(null);

        // Use the sortOrder prop, with a fallback to the default sort if it's not a valid string
        const currentSortOrder = (typeof sortOrder === 'string' && sortOrder.length > 0) ? sortOrder : DEFAULT_REPLY_SORT;

        const params = {
            postId: postId,
            parentId: commentary.id,
            page: pageNumber,
            size: size,
            sort: currentSortOrder,
        };

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/commentaries`, {
                params: params
            });

            if (res.status === 204 || res.data.content.length === 0) {
                if (pageNumber === 0) {
                    setReplies([]);
                }
                setHasMoreReplies(false);
            } else {
                const fetchedReplies = res.data.content.filter(reply => !deletedCommentIds.includes(reply.id));

                setReplies(prev => {
                    const existingIds = new Set(prev.map(r => r.id));
                    const uniqueNewReplies = fetchedReplies.filter(r => !existingIds.has(r.id));
                    // Note: Sorting happens on the backend. We just need to ensure uniqueness and append for pagination.
                    return [...prev, ...uniqueNewReplies];
                });
                setReplyPage(pageNumber);
                setHasMoreReplies(!res.data.last);
            }
        } catch (err) {
            console.error('Error fetching replies:', err);
            setErrorReplies('Failed to load replies.');
            toast.error('Failed to load replies.');
            setHasMoreReplies(false);
        } finally {
            setLoadingReplies(false);
        }
    }, [commentary.id, postId, deletedCommentIds, sortOrder]); // sortOrder is a dependency here

    // Effect for auto-loading small reply trees on initial render
    useEffect(() => {
        // Only auto-load if initial processing is done, criteria met, and replies haven't been fetched yet
        if (initialLoadDone && // Ensure initial replies (if any) have been processed
            isInitialRender &&
            shouldExpandSmallTrees &&
            commentary.hasReplies &&
            currentRepliesCount > 0 &&
            replies.length === 0 &&
            !loadingReplies &&
            currentRepliesCount < LOAD_ALL_THRESHOLD) {

            // Fetch with the current sortOrder
            fetchReplies(0, currentRepliesCount);
            setShowReplies(true);
            // No need to set initialLoadDone here, it's already true
        }
        // Dependencies include fetchReplies which depends on sortOrder, and initialLoadDone
    }, [initialLoadDone, isInitialRender, shouldExpandSmallTrees, commentary.id, commentary.hasReplies, currentRepliesCount, replies.length, loadingReplies, fetchReplies, depth, sortOrder]);


    // Effect to re-fetch replies when sortOrder changes
    useEffect(() => {
        // Only trigger a re-fetch if the sortOrder has actually changed
        // AND the comment is expected to have replies (either initially has replies or has a count > 0)
        // We check initialLoadDone to avoid unnecessary fetches on the very first render cycle
        if (initialLoadDone && prevSortOrderRef.current !== sortOrder && (commentary.hasReplies || currentRepliesCount > 0)) {
            // Reset reply state to clear existing replies fetched with the old sort
            setReplies([]);
            setReplyPage(0);
            setHasMoreReplies(commentary.hasReplies || currentRepliesCount > 0); // Reset based on potential replies

            // Fetch the first page with the new sort order
            fetchReplies(0, REPLIES_PER_PAGE);
        }

        // Update the ref to the current sortOrder after the effect runs
        prevSortOrderRef.current = sortOrder;

        // Dependencies: sortOrder must be here. fetchReplies is a dependency
        // because we call it. commentary.hasReplies, currentRepliesCount, and initialLoadDone
        // are needed to decide *if* to fetch. showReplies is not needed as a condition here
        // as the logic is based on potential replies, not just current visibility.
    }, [sortOrder, commentary.id, commentary.hasReplies, currentRepliesCount, fetchReplies, initialLoadDone]);


    // --- Event Handlers ---
    const handleToggleReplies = useCallback(() => {
        const newShowReplies = !showReplies;
        setShowReplies(newShowReplies);

        // If we are now showing replies AND the current replies state is empty,
        // and the comment is expected to have replies and not currently loading,
        // trigger a fetch of the first page with the *current* sort order.
        if (newShowReplies && replies.length === 0 && (commentary.hasReplies || currentRepliesCount > 0) && !loadingReplies) {
            fetchReplies(0, REPLIES_PER_PAGE);
        }
        // Dependencies: Include state/props used in the logic or effects triggered.
        // fetchReplies is a dependency because it's called conditionally.
        // sortOrder is included because fetchReplies depends on it.
    }, [showReplies, replies.length, commentary.hasReplies, currentRepliesCount, loadingReplies, fetchReplies, sortOrder]);


    const handleLoadMoreReplies = () => {
        if (!loadingReplies && hasMoreReplies) {
            fetchReplies(replyPage + 1, REPLIES_PER_PAGE);
        }
    };

    const handleReplyClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        const newState = !isReplying;
        setIsReplying(newState);
        if (!newState) {
            setReplyContent('');
        }
        setShowDropdown(false);
        setIsEditing(false);
    };

    const handleSubmitReply = async () => {
        const normalizedPlainTextReplyContent = getNormalizedTextLength(replyContent);

        if (normalizedPlainTextReplyContent === 0) {
            toast.error('Reply content cannot be empty.');
            return;
        }
        if (normalizedPlainTextReplyContent > MAX_COMMENTARY_TEXT_LENGTH) {
            toast.error(`Reply exceeds the maximum text length of ${MAX_COMMENTARY_TEXT_LENGTH} characters after normalization.`);
            return;
        }

        if (submittingReply) return;

        try {
            setSubmittingReply(true);

            const payload = {
                postId,
                parentId: commentary.id,
                content: replyContent,
            };

            const res = await axios.post('http://localhost:8080/api/v1/commentaries', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get('token')}`,
                },
            });

            if (res.status === 201) {
                toast.success('Reply posted.');

                const newReply = {
                    ...res.data,
                    hasReplies: res.data.hasReplies ?? false,
                    repliesCount: res.data.repliesCount ?? 0,
                };

                setReplyContent('');
                setIsReplying(false);

                // Optimistically add the new reply for immediate feedback.
                // For Reddit style, new replies usually appear at the top of the replies list
                // if sorting by newest, or are fetched into the correct position.
                // Let's refetch the first page to ensure correct order.
                // setReplies(prev => [...prev, newReply]); // Removed optimistic append

                // Increment the displayed reply count
                setCurrentRepliesCount(prevCount => prevCount + 1);

                // Ensure replies are shown and trigger a refetch of the first page
                // to get the accurate list sorted by the current sortOrder, including the new reply.
                setShowReplies(true);
                // Reset replies and fetch the first page with the current sort order
                setReplies([]);
                setReplyPage(0);
                setHasMoreReplies(commentary.hasReplies || currentRepliesCount > 0 || true); // Assume it might have more replies after adding one
                fetchReplies(0, REPLIES_PER_PAGE);


            } else {
                toast.error('Failed to post reply.');
            }
        } catch (err) {
            console.error('Error submitting reply:', err);
            if (err.response?.data?.body?.detail) {
                toast.error(`Failed to post reply: ${err.response.data.body.detail}`);
            } else {
                toast.error('Failed to post reply.');
            }
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleDropdownItemClick = useCallback((action) => {
        setShowDropdown(false);

        switch (action) {
            case 'edit':
                setIsEditing(true);
                setEditingContent(commentaryDisplayContent);
                setIsReplying(false);
                break;
            case 'delete':
                if (window.confirm("Are you sure you want to delete this comment?")) {
                    handleDeleteComment();
                }
                break;
            case 'report':
                toast.info('Report functionality not implemented yet.');
                break;
            default:
                break;
        }
    }, [commentaryDisplayContent]); // Dependency: commentaryDisplayContent used in 'edit' case

    const handleSaveEdit = async () => {
        const normalizedPlainTextContent = getNormalizedTextLength(editingContent);

        if (normalizedPlainTextContent === 0) {
            toast.error('Edited content cannot be empty.');
            return;
        }
        if (normalizedPlainTextContent > MAX_COMMENTARY_TEXT_LENGTH) {
            toast.error(`Edited content exceeds the maximum text length of ${MAX_COMMENTARY_TEXT_LENGTH} characters after normalization.`);
            return;
        }

        if (savingEdit) return;
        setSavingEdit(true);

        try {
            const payload = {
                content: editingContent,
            };

            const res = await axios.put(`http://localhost:8080/api/v1/commentaries/${commentary.id}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get('token')}`,
                },
            });

            if (res.status === 200) {
                toast.success('Comment updated.');
                setCommentaryContent(res.data.content);
                setIsEditing(false);

            } else {
                toast.error('Failed to update comment.');
            }
        } catch (err) {
            console.error('Error updating comment:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to update comment.';
            toast.error(errorMessage);
        } finally {
            setSavingEdit(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingContent('');
    };

    const handleDeleteComment = async () => {
        try {
            const res = await axios.delete(`http://localhost:8080/api/v1/commentaries/${commentary.id}`, {
                headers: {
                    Authorization: `Bearer ${Cookies.get('token')}`,
                },
            });

            if (res.status === 204) {
                toast.success('Comment deleted.');
                // Add the deleted comment ID to the global context
                addDeletedCommentId(commentary.id);
                // Signal to the parent component that this comment was deleted
                // This allows the parent (if it's a commentary) to decrement its reply count
                if (onCommentDeleted) {
                    onCommentDeleted(commentary.id);
                }

            } else {
                toast.error('Failed to delete comment.');
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to delete comment.';
            toast.error(errorMessage);
        }
    };


    // --- Derived State ---
    const replyTextLength = getNormalizedTextLength(replyContent);
    const editingTextLength = getNormalizedTextLength(editingContent);

    const createSafeHTML = (htmlContent) => {
        const contentString = String(htmlContent || '');
        return {
            __html: DOMPurify.sanitize(contentString)
        };
    };

    // The count displayed on the button should preferably show the total expected replies
    // when hidden, and the currently loaded count when shown, but currentRepliesCount
    // is the most reliable source for the backend's total count.
    const displayedRepliesCount = showReplies ? replies.length : currentRepliesCount;


    const isAuthor = user && user.id === commentary.userId;

    // --- Render ---
    return (
        // Main container for a single comment and its replies
        // Added conditional padding-left based on depth for indentation
        // Added relative positioning for the vertical line
        <div
            className={`commentary-item py-2 ${depth > 0 ? 'ml-4 md:ml-6 relative' : ''}`}
            style={{ '--depth': depth }} // Use a CSS variable for depth
        >
            {/* Vertical line for replies */}
            {/* Only show line for comments that are replies (depth > 0) */}
            {depth > 0 && (
                <div
                    className="absolute top-0 left-0 right-0 bottom-0 w-[2px] bg-gray-300"
                ></div>
            )}

            {/* Content wrapper for the current comment */}
            {/* Added padding-left to make space for the vertical line */}
            <div className={`${depth > 0 ? 'pl-2 md:pl-3' : ''}`}>
                {/* User Info and Timestamp */}
                <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1"> {/* Adjusted spacing and text size */}
                    <img
                        src={commentary.userAvatarUrl || 'https://placehold.co/40x40/EAEAEA/A0A0A0?text=User'}
                        alt={commentary.username}
                        className="w-8 h-8 rounded-full object-cover" // Smaller avatar
                    />
                    <span
                        onClick={() => navigate(`/users/${commentary.username}`)}
                        className="font-semibold text-gray-800 cursor-pointer hover:underline"
                    >
                        {commentary.userDisplayName || commentary.username}
                    </span>
                    <span className="mx-1">•</span> {/* Adjusted spacing */}
                    <span>{formatDistanceToNow(new Date(commentary.createdAt), { addSuffix: true })}</span>
                </div>

                {/* Comment Content */}
                <div className="commentary-content pl-10 text-gray-800 break-words text-[16px]" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}> {/* Adjusted text size */}
                    {isEditing ? (
                        <div className="editing-quill-wrapper  mb-2"> {/* Added border and margin */}
                            <ReactQuill
                                ref={editingEditorRef}
                                theme="snow" // Keep snow theme for editor look
                                value={editingContent}
                                onChange={setEditingContent}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Edit your comment..."
                                className="editing-quill"
                            />
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={createSafeHTML(commentaryDisplayContent)}></div>
                    )}
                </div>


                {/* Action Buttons (Reply, View Replies, Options) */}
                <div className="text-sm text-gray-600 flex items-center relative mt-1 pl-7"> {/* Adjusted text size, spacing, and margin-top */}
                    {!isEditing && (
                        <button
                            onClick={handleReplyClick}
                            className="flex text-sm items-center hover:underline hover:bg-gray-200 rounded-3xl py-1 px-3 text-gray-600 hover:text-gray-900" // Styled like a text link
                        >
                            Reply
                        </button>
                    )}

                    {/* Only show View Replies button if there are replies (initial count or loaded count)
                         and not editing or replying */}
                    {(commentary.hasReplies || currentRepliesCount > 0) && !isEditing && !isReplying && (
                        <button
                            onClick={handleToggleReplies}
                            className="flex items-center text-sm py-1 px-3 hover:bg-gray-200 rounded-3xl hover:underline text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed" // Styled like a text link
                            disabled={loadingReplies}
                        >
                            {showReplies ? (
                                <>
                                    Hide Replies {currentRepliesCount > 0 && `(${currentRepliesCount})`} <ChevronUp size={14} className="ml-1" /> {/* Smaller icon */}
                                </>
                            ) : (
                                <>
                                    View Replies ({currentRepliesCount})
                                    <ChevronDown size={14} className="ml-1" /> {/* Smaller icon */}
                                </>
                            )}
                        </button>
                    )}


                    {!isEditing && !isReplying && (
                        <div ref={dropdownRef} className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="p-1 rounded-full hover:bg-gray-200"
                                aria-label="Comment actions"
                            >
                                <MoreHorizontal size={16} />
                            </button>

                            {showDropdown && (
                                <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"> {/* Adjusted position to left-0 */}
                                    {isAuthor && (
                                        <>
                                            <button
                                                onClick={() => handleDropdownItemClick('edit')}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDropdownItemClick('delete')}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    {!isAuthor && (
                                        <button
                                            onClick={() => handleDropdownItemClick('report')}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Report
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Reply Input Area */}
                {isReplying && (
                    <div className="mt-3 space-y-2"> {/* Adjusted margin-top */}
                        <div className="reply-quill-wrapper pl-10 border-gray-300 "> {/* Added border */}
                            <ReactQuill
                                ref={replyEditorRef}
                                theme="snow" // Keep snow theme
                                value={replyContent}
                                onChange={setReplyContent}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="What are your thoughts?" // Reddit style placeholder
                                className="reply-quill"
                            />
                        </div>

                        <CharacterCount max={MAX_COMMENTARY_TEXT_LENGTH} current={replyTextLength} />

                        <div className="flex justify-end"> {/* Align button right */}
                            <button
                                onClick={handleSubmitReply}
                                disabled={submittingReply || replyTextLength === 0 || replyTextLength > MAX_COMMENTARY_TEXT_LENGTH}
                                className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm" // Styled like Reddit post button
                            >
                                {submittingReply ? (
                                    <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />
                                ) : 'Reply'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Editing Action Buttons */}
                {isEditing && (
                    <div className="flex justify-end space-x-2 mt-2">
                        <button
                            onClick={handleCancelEdit}
                            disabled={savingEdit}
                            className="px-3 py-1 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            disabled={savingEdit || editingTextLength === 0 || editingTextLength > MAX_COMMENTARY_TEXT_LENGTH}
                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm" // Styled like Reddit post button
                        >
                            {savingEdit ? (
                                <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />
                            ) : 'Save'}
                        </button>
                    </div>
                )}

            </div> {/* End of content wrapper */}


            {/* Replies Section */}
            {showReplies && !isEditing && !isReplying && (
                <div className={`commentary-replies ${depth === 0 ? 'pl-4' : 'pl-7' } mt-2`}>
                    {/* Filter replies based on deletedCommentIds before mapping */}
                    {replies.filter(reply => !deletedCommentIds.includes(reply.id)).map(reply => (
                        <Commentary
                            key={reply.id}
                            commentary={reply}
                            postId={postId}
                            isInitialRender={false} // Replies are not initial renders of the main list
                            shouldExpandSmallTrees={shouldExpandSmallTrees} // Pass down the setting
                            depth={depth + 1} // Increment depth for nested replies
                            // Pass a NEW onCommentDeleted callback for replies
                            onCommentDeleted={(deletedReplyId) => {
                                // Filter the replies state of the current comment
                                setReplies(prevReplies => prevReplies.filter(r => r.id !== deletedReplyId));
                                // Decrement the parent comment's displayed reply count
                                setCurrentRepliesCount(prevCount => Math.max(0, prevCount - 1));
                                // Also signal up the tree (for root comment or higher level replies)
                                if (onCommentDeleted) {
                                    onCommentDeleted(deletedReplyId);
                                }
                            }}
                            sortOrder={sortOrder} // Pass the sortOrder prop down to nested replies
                        />
                    ))}

                    {loadingReplies && (
                        <div className="w-full flex items-center justify-center py-2">
                            <Oval height={20} width={20} color="#1DB954" secondaryColor="#EAEAEA" strokeWidth={5} />
                        </div>
                    )}

                    {!loadingReplies && hasMoreReplies && (
                        <button
                            onClick={handleLoadMoreReplies}
                            className="text-sm text-blue-500 hover:underline mt-2 disabled:opacity-50 disabled:cursor-not-allowed" // Styled link
                            disabled={loadingReplies}
                        >
                            Load More Replies
                        </button>
                    )}

                    {errorReplies && (
                        <div className="text-sm text-red-500 mt-2">
                            {errorReplies}
                        </div>
                    )}
                </div>
            )}
        </div> // End of main container
    );
};

export default Commentary;