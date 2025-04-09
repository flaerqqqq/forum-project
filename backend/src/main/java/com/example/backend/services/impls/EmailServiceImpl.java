package com.example.backend.services.impls;

import com.example.backend.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    @Value("${gmail.username}")
    private String from;

    private final JavaMailSender mailSender;

    @Override
    public void sendConfirmEmail(String receiverEmail, String token) {
        String subject = "Email Confirmation ! ! !";
        String body = """
                    <!DOCTYPE html>
                    <html>
                    <body>
                        <p>Hello there!</p>
                        <p>Click the button below to confirm your email address:</p>
                        <form action="http://localhost:8080/api/v1/confirm" method="GET">
                            <input type="hidden" name="token" value="%s">
                            <button style="background-color: #007bff; color: white; border: none; padding: 10px 20px; cursor: pointer;" type="submit">
                                Confirm Email
                            </button>
                        </form>
                    </body>
                    </html>
                """.formatted(token);
        sendEmail(receiverEmail,subject,body);
    }

    private void sendEmail(String to, String subject, String body) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper mimeHelper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED);
            mimeHelper.setFrom(from);
            mimeHelper.setTo(to);
            mimeHelper.setSubject(subject);
            mimeHelper.setText(body, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}