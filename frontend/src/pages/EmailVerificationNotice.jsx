const EmailVerificationNotice = () => {
    return (
        <div className="email-verification-notice">
            <h2>Verify Your Email!</h2>
            <p>
                Registration successful! Right now the login feature is blocked for you, to enable it you must to verify yourself first by confirming your email.
                Please check your email and click the link to verify your account before logging in.
                In case you don't verify your email within 24 hours, your account will be deleted.
            </p>

        </div>
    )
}

export default EmailVerificationNotice;