import { Link } from "react-router-dom";

const UserNotFound = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>😕 User Not Found</h1>
            <p>The user you're looking for doesn't exist.</p>
            <Link to="/" style={{ color: "#007bff", textDecoration: "underline" }}>
                Go back to Home
            </Link>
        </div>
    );
};

export default UserNotFound;