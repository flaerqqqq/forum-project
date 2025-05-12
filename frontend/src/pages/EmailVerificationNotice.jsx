import {Navigate, useLocation} from "react-router-dom";

const EmailVerificationNotice = () => {
    const location = useLocation();

    if (!location.state?.fromRegister) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex justify-center items-center h-[calc(100vh-5.6rem)] bg-background-light-gray py-12 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center font-sans text-gray-800">
                <h2 className="text-2xl font-semibold text-black mb-4">
                    Verify Your Email!
                </h2>
                <p className="text-base mb-6 leading-relaxed">
                    Registration successful! Right now the login feature is blocked for you. To enable it, you must verify yourself first by confirming your email address.
                </p>
                <p className="text-base mb-6 leading-relaxed">
                    Please check your inbox and click the verification link.
                </p>
            </div>
        </div>
    );
}

export default EmailVerificationNotice;