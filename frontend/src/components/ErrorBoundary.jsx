import { Component } from 'react';
import { toast } from "react-toastify";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state to indicate an error has occurred
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error for debugging purposes (optional)
        console.error('Error caught by boundary:', error, errorInfo);

        // Show the toast notification for the error
        toast.error(`Error: ${error.message || 'An unknown error occurred'}`);
    }

    render() {
        return (<>
            {this.props.children};
        </>);
    }
}

export default ErrorBoundary;