import React, { useState } from 'react';
import ModeratorReviewModal from './ModeratorReviewModal';
import { isModerator } from '../utils/Auth';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';

const SingleReport = ({ report, reportedEntityName }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [localReport, setLocalReport] = useState(report);

    const toggleExpanded = () => setIsExpanded(!isExpanded);

    const handleReviewSuccess = async () => {
        try {
            const token = Cookies.get('token');
            const res = await axios.get(`http://localhost:8080/api/v1/reports/${report.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLocalReport(res.data);
        } catch (e) {
            toast.error('Failed to refresh report after review');
        }
    };

    const statusColorMap = {
        OPEN: 'text-blue-600',
        UNDER_REVIEW: 'text-orange-500',
        REJECTED: 'text-red-500',
        RESOLVED: 'text-green-600',
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

                    {isModerator() && ['OPEN', 'UNDER_REVIEW'].includes(localReport.status) && (
                        <div className="pt-4">
                            <button
                                onClick={() => setModalOpen(true)}
                                className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                Review Report
                            </button>
                        </div>
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