import { useState, useEffect } from 'react';

const Notification = ({ type, title, message, onClose, duration = 2500 }) => {
    const [progress, setProgress] = useState(0);
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? '✅' : '❌';

    useEffect(() => {
        // Calculate how much to increase progress each 10ms to reach 100% in the specified duration
        const increment = 100 / (duration / 10);

        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(interval);
                    onClose(); // Call onClose when progress completes
                    return 100;
                }
                return prevProgress + increment;
            });
        }, 10); // Update progress every 10ms for smoother animation

        return () => clearInterval(interval);
    }, [duration, onClose]);

    return (
        <div
            className={`fixed top-16 left-0 right-0 mx-auto w-full max-w-sm ${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50`}
        >
            <span className="text-xl">{icon}</span>
            <div className="flex-1">
                <h3 className="font-semibold text-lg">{title}</h3>
                <p>{message}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200"> {/* Added a background for better visibility */}
                <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Notification;