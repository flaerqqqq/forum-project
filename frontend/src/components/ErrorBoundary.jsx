import { Component } from 'react';
import { X } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            showError: false
        };
        this.timeoutId = null;
    }

    static getDerivedStateFromError(error) {
        return { 
            hasError: true, 
            error,
            showError: true
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.showError && this.state.showError) {
            this.timeoutId = setTimeout(() => {
                this.handleDismiss();
            }, 2000);
        }
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    handleDismiss = () => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.setState({ showError: false });
    }

    render() {
        return (
            <>
                {this.state.hasError && this.state.showError && (
                    <div 
                        className="fixed top-20 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-right-2 duration-300"
                        onMouseEnter={() => {
                            if (this.timeoutId) {
                                clearTimeout(this.timeoutId);
                            }
                        }}
                        onMouseLeave={() => {
                            this.timeoutId = setTimeout(() => {
                               this.handleDismiss();
                            }, 4000);
                        }}
                    >
                        <div className="group bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 animate-in fade-in zoom-in duration-300 relative">
                            <div className="flex items-start pr-4">
                                <div className="flex-1">
                                    <h3 className="text-red-800 font-medium">
                                        Error
                                    </h3>
                                    <p className="text-red-600 text-sm mt-1">
                                        {this.state.error?.message || 'An unexpected error occurred'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={this.handleDismiss}
                                className="absolute top-3 focus:border-red-200 bg-red-50 right-3 text-transparent group-hover:text-gray-400 hover:!text-gray-600 focus:ring-0 focus:outline-red-200 transition-colors duration-200"
                                aria-label="Close error message"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}
                {this.props.children}
            </>
        );
    }
}

export default ErrorBoundary;