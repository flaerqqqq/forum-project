import React, { useState } from 'react';
import ModeratorReviewModal from './ModeratorReviewModal';
import { isModerator } from '../utils/Auth';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import UserCommentaryItem from './UserCommentaryItem.jsx';


const SingleReport = ({ report, reportedEntityName }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [localReport, setLocalReport] = useState(report);
    const [isViewingEntity, setIsViewingEntity] = useState(false);
    const [fetchedCommentary, setFetchedCommentary] = useState(null);
    const [showFetchedCommentary, setShowFetchedCommentary] = useState(false);


    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        if (isExpanded) {
            setShowFetchedCommentary(false);
            setFetchedCommentary(null);
        }
    };

    const handleReviewSuccess = async () => {
        try {
            const token = Cookies.get('token');
            const res = await axios.get(`http://localhost:8080/api/v1/reports/${report.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLocalReport(res.data);
            toast.success('Report updated successfully.');
        } catch (e) {
            console.error('Failed to refresh report after review', e);
            toast.error('Failed to refresh report after review');
        }
    };

    const statusColorMap = {
        OPEN: 'text-blue-600',
        UNDER_REVIEW: 'text-orange-500',
        REJECTED: 'text-red-500',
        RESOLVED: 'text-green-600',
    };

    const handleViewEntityClick = async () => {
        if (!localReport?.targetId || isViewingEntity) {
            return;
        }

        if (localReport.targetType === 'COMMENTARY' && showFetchedCommentary) {
            setShowFetchedCommentary(false);
            setFetchedCommentary(null);
            return;
        }

        setIsViewingEntity(true);

        const token = Cookies.get('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            let url = '';
            let entityData = null;

            switch (localReport.targetType) {
                case 'USER':
                    const userRes = await axios.get(`http://localhost:8080/api/v1/users/${localReport.targetId}`, { headers });
                    entityData = userRes.data;
                    if (entityData?.username) {
                        url = `/users/${entityData.username}`;
                    } else {
                        toast.error('Could not find reported user.');
                    }
                    break;
                case 'CATEGORY':
                    const categoryRes = await axios.get(`http://localhost:8080/api/v1/categories/${localReport.targetId}`, { headers });
                    entityData = categoryRes.data;
                    if (entityData?.slug) {
                        url = `/categories/${entityData.slug}`;
                    } else {
                        toast.error('Could not find reported category.');
                    }
                    break;
                case 'POST':
                    const postRes = await axios.get(`http://localhost:8080/api/v1/posts/${localReport.targetId}`, { headers });
                    entityData = postRes.data;
                    if (entityData?.category?.slug && entityData?.id) {
                        url = `/categories/${entityData.category.slug}/posts/${entityData.id}`;
                    } else {
                        toast.error('Could not find reported post.');
                    }
                    break;
                case 'COMMENTARY':
                    const commentaryRes = await axios.get(`http://localhost:8080/api/v1/users/me/comments/${localReport.targetId}`, { headers });
                    entityData = commentaryRes.data;
                    if (entityData) {
                        setFetchedCommentary(entityData);
                        setShowFetchedCommentary(true);
                    } else {
                        toast.error('Could not find reported commentary.');
                    }
                    break;
                default:
                    toast.error('Unsupported report target type.');
                    break;
            }

            if (url) {
                window.open(url, '_blank');
            }

        } catch (err) {
            console.error('Failed to fetch reported entity details:', err);
            const errorMessage = err.response?.data?.message || 'Failed to load reported entity.';
            toast.error(errorMessage);
            if (localReport.targetType === 'COMMENTARY') {
                setShowFetchedCommentary(false);
                setFetchedCommentary(null);
            }
        } finally {
            setIsViewingEntity(false);
        }
    };


    return (
        <div className="border-b border-gray-200 py-5 text-sm font-sans text-gray-800">
            <div
                className="flex justify-between items-start cursor-pointer"
                onClick={toggleExpanded}
            >
                <div className="space-y-1 pr-4">
                    <p className="text-gray-500">Report ID: <span className="text-black font-medium">#{localReport.id}</span></p>
                    <p className="text-gray-500">Target Type: <span className="text-black font-medium">{localReport.targetType}</span></p>
                    <p className="text-gray-500">Reason: <span className="text-black font-medium">{localReport.reason}</span></p>
                    <p className="text-gray-500">
                        Reported Entity: <span className="text-black font-medium">{reportedEntityName || localReport.targetId}</span>
                    </p>
                </div>

                <div className="text-right flex-shrink-0 pl-4">
                    <p className={`font-semibold ${statusColorMap[localReport.status]}`}>
                        {localReport.status.replace('_', ' ')}
                    </p>
                    <button className="text-xs text-gray-500 hover:underline mt-1 focus:outline-none">
                        {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
                    <div>
                        <p className="font-medium text-gray-700">Description</p>
                        <p className="text-gray-600 mt-1">{localReport.description || 'No description provided.'}</p>
                    </div>

                    <div>
                        <p className="font-medium text-gray-700">Reported at</p>
                        <p className="text-gray-600">{new Date(localReport.reportedAt).toLocaleString()}</p>
                    </div>

                    {localReport.moderatorId && (
                        <>
                            <div>
                                <p className="font-medium text-gray-700">Reviewed by Moderator ID</p>
                                <p className="text-gray-600">{localReport.moderatorId}</p>
                            </div>

                            {localReport.moderatorNote && (
                                <div>
                                    <p className="font-medium text-gray-700">Moderator Note</p>
                                    <p className="text-gray-600">{localReport.moderatorNote}</p>
                                </div>
                            )}

                            {localReport.reviewedAt && (
                                <div>
                                    <p className="font-medium text-gray-700">Reviewed at</p>
                                    <p className="text-gray-600">{new Date(localReport.reviewedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </>
                    )}

                    {localReport?.targetId && (
                        <div className="pt-4">
                            <button
                                onClick={handleViewEntityClick}
                                disabled={isViewingEntity}
                                className="px-3 py-1.5 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isViewingEntity ? (
                                    <Oval height={16} width={16} color="#fff" secondaryColor="#EAEAEA" strokeWidth={5} />
                                ) : localReport.targetType === 'COMMENTARY' ? (
                                    showFetchedCommentary ? 'Hide Commentary' : 'Show Commentary'
                                ) : (
                                    `View ${localReport.targetType.charAt(0).toUpperCase() + localReport.targetType.slice(1).toLowerCase()}`
                                )}
                            </button>
                        </div>
                    )}

                    {isModerator() && ['OPEN', 'UNDER_REVIEW'].includes(localReport.status) && (
                        <button
                            onClick={() => setModalOpen(true)}
                            className="px-3 py-1.5 text-sm rounded-xl bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                            Review Report
                        </button>
                    )}

                    {localReport.targetType === 'COMMENTARY' && showFetchedCommentary && fetchedCommentary && (
                        <UserCommentaryItem commentary={fetchedCommentary} publicId={fetchedCommentary.creatorPublicId} avatarUrl={fetchedCommentary.creatorAvatarUrl} displayName={fetchedCommentary.creatorDisplayName}  onCommentDeleted={null} />
                    )}


                </div>
            )}

            <ModeratorReviewModal
                reportId={report.id}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={handleReviewSuccess}
            />
        </div>
    );
};

export default SingleReport;