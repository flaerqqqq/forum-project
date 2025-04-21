import React, { useState } from 'react';
import ModeratorReviewModal from './ModeratorReviewModal';
import { isModerator } from '../utils/Auth';
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";

const SingleReport = ({ report, reportedEntityName }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [localReport, setLocalReport] = useState(report); // Use local copy of report

    const toggleExpanded = () => setIsExpanded(!isExpanded);

    const handleReviewSuccess = async () => {
        try {
            const token = Cookies.get('token');
            const res = await axios.get(`http://localhost:8080/api/v1/reports/${report.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLocalReport(res.data); // Update local report data
        } catch (e) {
            toast.error('Failed to refresh report after review');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center cursor-pointer" onClick={toggleExpanded}>
                <div className="space-y-1">
                    <p className="text-sm text-gray-500">Reported:</p>
                    <p className="text-lg font-semibold text-gray-800">
                        {reportedEntityName || localReport.targetId}
                    </p>
                    <p className="text-sm text-gray-500">Report ID: #{localReport.id}</p>
                    <p className="text-sm text-gray-600">Reason: {localReport.reason}</p>
                </div>

                <div className="text-right">
                    <p
                        className={`font-medium 
                            ${localReport.status === 'OPEN' ? 'text-blue-600' : ''} 
                            ${localReport.status === 'UNDER_REVIEW' ? 'text-yellow-600' : ''} 
                            ${localReport.status === 'REJECTED' ? 'text-red-600' : ''} 
                            ${localReport.status === 'RESOLVED' ? 'text-green-600' : ''}`}
                    >
                        {localReport.status}
                    </p>
                    <button className="text-sm text-blue-500 hover:underline mt-2">
                        {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                    <div>
                        <span className="font-medium text-gray-600">Description:</span>
                        <p className="mt-1">{localReport.description}</p>
                    </div>

                    <div>
                        <span className="font-medium text-gray-600">Reported at:</span>
                        <p>{new Date(localReport.reportedAt).toLocaleString()}</p>
                    </div>

                    {localReport.moderatorId && (
                        <>
                            <div>
                                <span className="font-medium text-gray-600">Reviewed by Moderator:</span>
                                <p>{localReport.moderatorId}</p>
                            </div>

                            {localReport.moderatorNote && (
                                <div>
                                    <span className="font-medium text-gray-600">Moderator Note:</span>
                                    <p>{localReport.moderatorNote}</p>
                                </div>
                            )}

                            {localReport.reviewedAt && (
                                <div>
                                    <span className="font-medium text-gray-600">Reviewed at:</span>
                                    <p>{new Date(localReport.reviewedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </>
                    )}

                    {isModerator() && (
                        <div className="pt-4">
                            <button
                                onClick={() => setModalOpen(true)}
                                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                Review Report
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
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