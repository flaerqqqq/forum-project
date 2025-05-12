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
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);

        toast.error(`Error: ${error.message || 'An unknown error occurred'}`);
    }

    render() {
        return (<>
            {this.props.children};
        </>);
    }
}

export default ErrorBoundary;