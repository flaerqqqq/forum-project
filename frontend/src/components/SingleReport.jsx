import React, { useState } from 'react';

const SingleReport = ({ report, reportedEntityName }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => setIsExpanded(!isExpanded);

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Top summary row */}
            <div className="flex justify-between items-center cursor-pointer" onClick={toggleExpanded}>
                <div className="space-y-1">
                    <p className="text-sm text-gray-500">Reported:</p>
                    <p className="text-lg font-semibold text-gray-800">
                        {reportedEntityName || report.targetId}
                    </p>
                    <p className="text-sm text-gray-600">Reason: {report.reason}</p>
                </div>

                <div className="text-right">
                    <p
                        className={`font-medium 
                            ${report.status === 'OPEN' ? 'text-blue-600' : ''} 
                            ${report.status === 'UNDER_REVIEW' ? 'text-yellow-600' : ''} 
                            ${report.status === 'REJECTED' ? 'text-red-600' : ''} 
                            ${report.status === 'RESOLVED' ? 'text-green-600' : ''}`}
                    >
                        {report.status}
                    </p>
                    <button className="text-sm text-blue-500 hover:underline mt-2">
                        {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
                    </button>
                </div>
            </div>

            {/* Expanded info */}
            {isExpanded && (
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                    <div>
                        <span className="font-medium text-gray-600">Description:</span>
                        <p className="mt-1">{report.description}</p>
                    </div>

                    <div>
                        <span className="font-medium text-gray-600">Reported at:</span>
                        <p>{new Date(report.reportedAt).toLocaleString()}</p>
                    </div>

                    {report.moderatorId && (
                        <>
                            <div>
                                <span className="font-medium text-gray-600">Reviewed by Moderator:</span>
                                <p>{report.moderatorId}</p>
                            </div>

                            {report.moderatorNote && (
                                <div>
                                    <span className="font-medium text-gray-600">Moderator Note:</span>
                                    <p>{report.moderatorNote}</p>
                                </div>
                            )}

                            {report.reviewedAt && (
                                <div>
                                    <span className="font-medium text-gray-600">Reviewed at:</span>
                                    <p>{new Date(report.reviewedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SingleReport;