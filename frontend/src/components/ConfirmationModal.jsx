import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react'; // Assuming lucide-react for icons

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText = 'Confirm', cancelButtonText = 'Cancel' }) => {
    const modalRef = useRef(null);

    // Effect to handle closing the modal with the Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Handle clicks outside the modal content
    const handleBackdropClick = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 my-8"
                onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing when clicking inside modal
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="text-gray-700 text-base mb-6">
                    <p>{message}</p>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;