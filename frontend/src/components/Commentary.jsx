import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import {ChevronDown, ChevronUp, MessageCircle, MoreHorizontal, PlusCircle} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from "../contexts/UserContext.jsx";
import Cookies from "js-cookie";
import DOMPurify from 'dompurify';
import { DeletedCommentsContext } from '../contexts/DeletedCommentsContext';

import UserHoverCard from './UserHoverCard';

const getAvatarColorClass = (username) => {
    if (!username) return 'bg-gray-medium';
    const firstLetter = username.charAt(0).toUpperCase();
    const asciiCode = firstLetter.charCodeAt(0);
    const colorIndex = asciiCode % 10;

    const avatarColors = [
        'bg-accent-green',
        'bg-gray-darker',
        'bg-indigo-600',
        'bg-blue-600',
        'bg-purple-600',
        'bg-pink-600',
        'bg-teal-600',
        'bg-orange-600',
        'bg-red-600',
        'bg-gray-medium',
    ];
    return avatarColors[colorIndex];
};

const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};


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

const REPLIES_PER_PAGE = 5;
const LOAD_ALL_THRESHOLD = 4;
const MAX_COMMENTARY_TEXT_LENGTH = 1000;
const DEFAULT_REPLY_SORT = 'createdAt,asc';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ReportContentModal from "./ReportContentModal.jsx";

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 overflow-hidden"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-lg p-6 max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


const Commentary = ({ commentary, postId, categoryId, isUserCategoryModerator, isInitialRender = true, shouldExpandSmallTrees = true, depth = 0, onCommentDeleted, sortOrder, isParentShowing = true, onReplyAdded }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { deletedCommentIds, addDeletedCommentId } = useContext(DeletedCommentsContext);

    const isDeleted = deletedCommentIds.includes(commentary.id);

    if (isDeleted) {
        return null;
    }

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
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingContent, setEditingContent] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const [showHoverCard, setShowHoverCard] = useState(false);
    const hoverTimeoutRef = useRef(null);
    const showDelay = 500;


    const dropdownRef = useRef(null);
    const replyEditorRef = useRef(null);
    const editingEditorRef = useRef(null);
    const prevSortOrderRef = useRef(sortOrder);

    const isGlobalModerator = user?.roles?.some(role => role.name === 'ROLE_MODERATOR') || false;
    const isAuthor = user && user.username === commentary.username;
    const canEditComment = isAuthor;
    const canDeleteComment = isAuthor || isGlobalModerator || isUserCategoryModerator;
    const canReportComment = !isAuthor;

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

    // Handler to show the report modal
    const handleReportClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDropdown(false);
        setShowReportModal(true); // Set state to true to show the modal
    };

    const handleReportModalClose = () => {
        setShowReportModal(false);
    };


    useEffect(() => {
        if (Array.isArray(commentary.replies) && commentary.replies.length > 0) {
            const initialReplies = commentary.replies.filter(reply => !deletedCommentIds.includes(reply.id));
            setReplies(initialReplies);
            setHasMoreReplies(false);

            if (isInitialRender && shouldExpandSmallTrees) {
                setShowReplies(true);
            }
            setInitialLoadDone(true);
        } else {
            setInitialLoadDone(true);
        }
    }, [commentary.replies, deletedCommentIds, isInitialRender, shouldExpandSmallTrees, commentary.id]);

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

    const fetchReplies = useCallback(async (pageNumber = 0, size = REPLIES_PER_PAGE) => {
        setLoadingReplies(true);
        setErrorReplies(null);
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
    }, [commentary.id, postId, deletedCommentIds, sortOrder]);

    useEffect(() => {
        const shouldTriggerFetch = (initialLoadDone || showReplies) &&
            (commentary.hasReplies || currentRepliesCount > 0) &&
            replies.length === 0 &&
            !loadingReplies &&
            currentRepliesCount > 0 &&
            currentRepliesCount < LOAD_ALL_THRESHOLD &&
            shouldExpandSmallTrees && depth < 2;


        if (shouldTriggerFetch) {
            if (!showReplies) {
                setShowReplies(true);
            }
            fetchReplies(0, currentRepliesCount);
        }

    }, [initialLoadDone, showReplies, commentary.id, commentary.hasReplies, currentRepliesCount, replies.length, loadingReplies, fetchReplies, shouldExpandSmallTrees, LOAD_ALL_THRESHOLD]);


    useEffect(() => {
        if (initialLoadDone && prevSortOrderRef.current !== sortOrder && (commentary.hasReplies || currentRepliesCount > 0)) {
            setReplies([]);
            setReplyPage(0);
            setHasMoreReplies(commentary.hasReplies || currentRepliesCount > 0);
            fetchReplies(0, REPLIES_PER_PAGE);
        }
        prevSortOrderRef.current = sortOrder;
    }, [sortOrder, commentary.id, commentary.hasReplies, currentRepliesCount, fetchReplies, initialLoadDone]);

    const handleReplySuccess = useCallback((newReplyData) => {
        setCurrentRepliesCount(prevCount => prevCount + 1);
        setShowReplies(true);
        setReplies([]);
        setReplyPage(0);
        setHasMoreReplies(true);

        if (onReplyAdded) {
            onReplyAdded(commentary.id, newReplyData);
        }

        fetchReplies(0, REPLIES_PER_PAGE);
    }, [commentary.id, onReplyAdded, fetchReplies]);


    const handleToggleReplies = useCallback(() => {
        const newShowReplies = !showReplies;
        setShowReplies(newShowReplies);
        if (newShowReplies && replies.length === 0 && (commentary.hasReplies || currentRepliesCount > 0) && !loadingReplies) {
            fetchReplies(0, REPLIES_PER_PAGE);
        }
    }, [showReplies, replies.length, commentary.hasReplies, currentRepliesCount, loadingReplies, fetchReplies]);

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

    const handleCancelReply = () => {
        setReplyContent('');
        setIsReplying(false);
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
                handleReplySuccess(newReply);

            } else {
                toast.error('Failed to post reply.');
            }
        } catch (err) {
            console.error('Error submitting reply:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to post reply.';
            toast.error(errorMessage);
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleDropdownItemClick = useCallback((action) => {
        setShowDropdown(false);
        switch (action) {
            case 'edit':
                if (canEditComment) {
                    setIsEditing(true);
                    setEditingContent(commentaryDisplayContent);
                    setIsReplying(false);
                }
                break;
            case 'delete':
                if (canDeleteComment) {
                    setShowDeleteModal(true);
                }
                break;
            case 'report':
                if (!isAuthor && user) {
                    setShowReportModal(true);
                } else if (!user) {
                    toast.info('You must be logged in to report a comment.');
                }
                break;
            default:
                break;
        }
    }, [commentaryDisplayContent, canEditComment, canDeleteComment, canReportComment, user]);

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
                addDeletedCommentId(commentary.id);
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

    const confirmDelete = () => {
        handleDeleteComment();
        setShowDeleteModal(false);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
    };

    const replyTextLength = getNormalizedTextLength(replyContent);
    const editingTextLength = getNormalizedTextLength(editingContent);

    const createSafeHTML = (htmlContent) => {
        const contentString = String(htmlContent || '');
        return {
            __html: DOMPurify.sanitize(contentString)
        };
    };

    const handleMouseEnter = () => {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHoverCard(true);
        }, showDelay);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHoverCard(false);
        }, 100);
    };

    useEffect(() => {
        return () => {
            clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const handleChildReplyAdded = useCallback((childCommentId, newReplyData) => {
        // Find the child comment in THIS comment's replies state and update its count/hasReplies flag
        setReplies(prevReplies => {
            return prevReplies.map(reply => {
                if (reply.id === childCommentId) {
                    return {
                        ...reply,
                        repliesCount: (reply.repliesCount || 0) + 1,
                        hasReplies: true,
                    };
                }
                return reply;
            });
        });
        // Do NOT increment THIS comment's direct reply count here, as the new reply was to a child


        // If this comment has a parent, inform the parent that one of its children received a reply
        if (onReplyAdded) {
            onReplyAdded(commentary.id, newReplyData);
        }
    }, [setReplies, commentary.id, onReplyAdded]);


    return (
        <div
            className={`commentary-item py-2 ${depth > 0 ? 'ml-4 md:ml-6 relative' : ''}`}
            style={{ '--depth': depth }}
        >
            {depth > 0 && (
                <div
                    className="absolute top-0 left-0 right-0 bottom-0 w-[2px] bg-gray-300"
                ></div>
            )}

            <div className={`${depth > 0 ? 'pl-2 md:pl-2' : ''}`}>
                <div
                    className="flex items-center space-x-2 text-xs text-gray-600 mb-1 relative"
                >
                    {commentary.userAvatarUrl ? (
                        <img
                            src={commentary.userAvatarUrl}
                            alt={commentary.username}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0 ${getAvatarColorClass(commentary.username)}`}
                        >
                            <span>{getInitials(commentary.userDisplayName || commentary.username)}</span>
                        </div>
                    )}
                    <Link
                        to={`/users/${commentary.username}`}
                        className="font-semibold text-gray-800 cursor-pointer hover:underline"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {commentary.userDisplayName || commentary.username}
                    </Link>
                    <span className="mx-1">•</span>
                    <span>{formatDistanceToNow(new Date(commentary.createdAt), { addSuffix: true })}</span>

                    {showHoverCard && (
                        <UserHoverCard username={commentary.username} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
                    )}
                </div>

                <div className="commentary-content pl-10 text-gray-800 break-words text-[16px]" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {isEditing ? (
                        <div className="editing-quill-wrapper  mb-2">
                            <ReactQuill
                                ref={editingEditorRef}
                                theme="snow"
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

                <div className="text-sm text-gray-600 flex items-center relative mt-1 pl-7">
                    {!isEditing && (
                        <button
                            onClick={handleReplyClick}
                            className="flex text-sm items-center hover:underline hover:bg-gray-200 rounded-3xl py-1 px-3 text-gray-600 hover:text-gray-900"
                        >
                            <MessageCircle size={14} className="mr-1" />
                            Reply
                        </button>
                    )}

                    {(commentary.hasReplies || currentRepliesCount > 0) && !isEditing && !isReplying && (
                        <button
                            onClick={handleToggleReplies}
                            className="flex items-center text-sm py-1 px-3 hover:bg-gray-200 rounded-3xl hover:underline text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loadingReplies}
                        >
                            {showReplies ? (
                                <>
                                    Hide Replies {currentRepliesCount > 0 && `(${currentRepliesCount})`} <ChevronUp size={14} className="ml-1" />
                                </>
                            ) : (
                                <>
                                    View Replies ({currentRepliesCount})
                                    <ChevronDown size={14} className="ml-1" />
                                </>
                            )}
                        </button>
                    )}

                    {(canEditComment || canDeleteComment || canReportComment) && (
                        <div ref={dropdownRef} className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="p-1 rounded-full hover:bg-gray-200"
                                aria-label="Comment actions"
                            >
                                <MoreHorizontal size={16} />
                            </button>

                            {showDropdown && (
                                <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {canEditComment && (
                                        <button
                                            onClick={() => handleDropdownItemClick('edit')}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Update
                                        </button>
                                    )}
                                    {canDeleteComment && (
                                        <button
                                            onClick={() => handleDropdownItemClick('delete')}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Delete
                                        </button>
                                    )}
                                    {canReportComment && (
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

                {isReplying && (
                    <div className="mt-3 space-y-2">
                        <div className="reply-quill-wrapper pl-10 border-gray-300 ">
                            <ReactQuill
                                ref={replyEditorRef}
                                theme="snow"
                                value={replyContent}
                                onChange={setReplyContent}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="What are your thoughts?"
                                className="reply-quill"
                            />
                        </div>

                        <CharacterCount max={MAX_COMMENTARY_TEXT_LENGTH} current={replyTextLength} />

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCancelReply}
                                disabled={submittingReply}
                                className="px-4 py-1 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReply}
                                disabled={submittingReply || replyTextLength === 0 || replyTextLength > MAX_COMMENTARY_TEXT_LENGTH}
                                className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                            >
                                {submittingReply ? (
                                    <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />
                                ) : 'Reply'}
                            </button>
                        </div>
                    </div>
                )}

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
                            className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                        >
                            {savingEdit ? (
                                <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />
                            ) : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {showReplies && !isEditing && !isReplying && (
                <div className={`commentary-replies ${depth === 0 ? 'pl-4' : 'pl-6' } mt-2`}>
                    {replies.filter(reply => !deletedCommentIds.includes(reply.id)).map(reply => (
                        <Commentary
                            key={reply.id}
                            commentary={reply}
                            postId={postId}
                            categoryId={categoryId}
                            isUserCategoryModerator={isUserCategoryModerator}
                            isInitialRender={false}
                            shouldExpandSmallTrees={shouldExpandSmallTrees}
                            depth={depth + 1}
                            onCommentDeleted={(deletedReplyId) => {
                                setReplies(prevReplies => prevReplies.filter(r => r.id !== deletedReplyId));
                                setCurrentRepliesCount(prevCount => Math.max(0, prevCount - 1));
                                if (onCommentDeleted) {
                                    onCommentDeleted(deletedReplyId);
                                }
                            }}
                            sortOrder={sortOrder}
                            isParentShowing={showReplies}
                            onReplyAdded={handleChildReplyAdded}
                        />
                    ))}

                    {loadingReplies && (
                        <div className="w-full flex items-center justify-center py-2">
                            <Oval height={20} width={20} color="#1DB950" secondaryColor="#EAEAEA" strokeWidth={5} />
                        </div>
                    )}

                    {!loadingReplies && hasMoreReplies && (
                        <button
                            onClick={handleLoadMoreReplies}
                            className="flex items-center text-sm pl-[18px] text-gray-500 hover:underline  mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loadingReplies}
                        >
                            {currentRepliesCount - replies.length > 5 ? (
                                <>
                                    <PlusCircle size={14} className="mr-1" /> next 5 replies from {currentRepliesCount - replies.length}
                                </>
                            ) : (
                            <>
                                <PlusCircle size={14} className="mr-1" /> {currentRepliesCount - replies.length} more replies
                            </>)
                            }
                        </button>
                    )}

                    {errorReplies && (
                        <div className="text-sm text-red-500 mt-2">
                            {errorReplies}
                        </div>
                    )}
                </div>
            )}

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                message="Are you sure you want to delete this comment?"
            />


            {showReportModal && commentary.id && (
                <ReportContentModal
                    targetType="COMMENTARY" // Specify the target type as 'POST'
                    targetId={commentary.id} // Pass the post's ID as the targetId
                    onClose={handleReportModalClose} // Use the dedicated close handler
                />
            )}
        </div>
    );
};
export default Commentary;