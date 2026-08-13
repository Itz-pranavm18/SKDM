package com.skm.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Async
    public void sendWelcomeEmail(String to, String name) {
        String subject = "Welcome to SKM College!";
        String body = buildWelcomeEmail(name);
        sendHtmlEmail(to, subject, body);
    }

    @Async
    public void sendPasswordResetEmail(String to, String name, String otp) {
        String subject = "Password Reset OTP — SKM College";
        String body = buildPasswordResetEmail(name, otp);
        sendHtmlEmail(to, subject, body);
    }

    @Async
    public void sendVerificationEmail(String to, String name, String otp) {
        String subject = "Verify Your Email — SKM College";
        String body = buildVerificationEmail(name, otp);
        sendHtmlEmail(to, subject, body);
    }

    @Async
    public void sendAdmissionApprovedEmail(String to, String name, String applicationNumber, String courseName) {
        String subject = "Admission Approved — SKM College";
        String body = buildAdmissionApprovedEmail(name, applicationNumber, courseName);
        sendHtmlEmail(to, subject, body);
    }

    @Async
    public void sendAdmissionRejectedEmail(String to, String name, String applicationNumber, String reason) {
        String subject = "Regarding Your Admission Application — SKM College";
        String body = buildAdmissionRejectedEmail(name, applicationNumber, reason);
        sendHtmlEmail(to, subject, body);
    }

    @Async
    public void sendContactAcknowledgement(String to, String name) {
        String subject = "We received your message — SKM College";
        String body = buildContactAckEmail(name);
        sendHtmlEmail(to, subject, body);
    }

    @Async
    public void sendContactReply(String to, String name, String originalSubject, String replyText) {
        String subject = "Re: " + (originalSubject != null && !originalSubject.isBlank() ? originalSubject : "Your Inquiry with SKM College");
        String body = emailWrapper(
            "<h2>Response to Your Inquiry</h2>" +
            "<p>Dear " + name + ",</p>" +
            "<p>Thank you for contacting <strong>Shiv Kumari Mahavidyalaya</strong>. Here is our response to your message:</p>" +
            "<div style='background:#f8fafc;padding:16px;border-left:4px solid #7A1F2B;margin:16px 0;border-radius:4px;'>" +
            "<p style='margin:0;white-space:pre-wrap;line-height:1.6;'>" + replyText + "</p>" +
            "</div>" +
            "<p>If you have further questions, feel free to reply directly to this email or visit our administrative office.</p>"
        );
        sendHtmlEmail(to, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // ── Email templates ───────────────────────────────────────────────────────

    private String buildWelcomeEmail(String name) {
        return emailWrapper(
            "<h2>Welcome to SKM College, " + name + "!</h2>" +
            "<p>Your account has been created successfully. We're delighted to have you with us at " +
            "<strong>Shiv Kumari Mahavidyalaya</strong>.</p>" +
            "<p>You can now log in and explore our courses, admissions, notices, and more.</p>" +
            "<p><em>\"सा विद्या या विमुक्तये\"</em> — That is true knowledge which liberates.</p>"
        );
    }

    private String buildPasswordResetEmail(String name, String otp) {
        return emailWrapper(
            "<h2>Password Reset Request</h2>" +
            "<p>Dear " + name + ",</p>" +
            "<p>We received a request to reset your password. Use the OTP below:</p>" +
            "<div style='text-align:center;margin:24px 0;'>" +
            "<span style='font-size:32px;font-weight:700;letter-spacing:10px;color:#7A1F2B;'>" + otp + "</span>" +
            "</div>" +
            "<p>This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.</p>"
        );
    }

    private String buildVerificationEmail(String name, String otp) {
        return emailWrapper(
            "<h2>Verify Your Email Address</h2>" +
            "<p>Dear " + name + ",</p>" +
            "<p>Use the OTP below to verify your email address:</p>" +
            "<div style='text-align:center;margin:24px 0;'>" +
            "<span style='font-size:32px;font-weight:700;letter-spacing:10px;color:#7A1F2B;'>" + otp + "</span>" +
            "</div>" +
            "<p>This OTP is valid for <strong>24 hours</strong>.</p>"
        );
    }

    private String buildAdmissionApprovedEmail(String name, String applicationNumber, String courseName) {
        return emailWrapper(
            "<h2>🎉 Congratulations! Your Admission is Approved</h2>" +
            "<p>Dear " + name + ",</p>" +
            "<p>We are delighted to inform you that your application for <strong>" + courseName + "</strong> has been <strong>APPROVED</strong>.</p>" +
            "<p><strong>Application Number:</strong> " + applicationNumber + "</p>" +
            "<p>Please visit the college campus with your original documents for final verification and fee payment.</p>" +
            "<p>Office hours: Monday to Saturday, 10:00 AM – 4:00 PM</p>"
        );
    }

    private String buildAdmissionRejectedEmail(String name, String applicationNumber, String reason) {
        return emailWrapper(
            "<h2>Application Status Update</h2>" +
            "<p>Dear " + name + ",</p>" +
            "<p>We regret to inform you that your application <strong>" + applicationNumber + "</strong> could not be approved at this time.</p>" +
            "<p><strong>Reason:</strong> " + (reason != null ? reason : "Please contact the admissions office for details.") + "</p>" +
            "<p>You are welcome to re-apply for the next session or contact our admissions office for further guidance.</p>"
        );
    }

    private String buildContactAckEmail(String name) {
        return emailWrapper(
            "<h2>We've Received Your Message</h2>" +
            "<p>Dear " + name + ",</p>" +
            "<p>Thank you for contacting <strong>Shiv Kumari Mahavidyalaya</strong>. We have received your message and will respond within 1-2 working days.</p>" +
            "<p>Office hours: Monday to Saturday, 10:00 AM – 4:00 PM</p>"
        );
    }

    private String emailWrapper(String content) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'>" +
               "<style>body{font-family:Arial,sans-serif;color:#333;margin:0;padding:0;}" +
               ".container{max-width:600px;margin:0 auto;padding:20px;}" +
               ".header{background:#1F2A44;color:#E8A33D;padding:20px;text-align:center;border-radius:8px 8px 0 0;}" +
               ".header h1{margin:0;font-size:20px;}" +
               ".body{background:#fff;padding:30px;border:1px solid #e4dac4;}" +
               ".footer{background:#f1eada;padding:15px;text-align:center;font-size:12px;color:#6b6656;border-radius:0 0 8px 8px;}" +
               "h2{color:#1F2A44;} p{line-height:1.6;}</style></head><body>" +
               "<div class='container'>" +
               "<div class='header'><h1>Shiv Kumari Mahavidyalaya</h1><p style='margin:4px 0 0;font-size:13px;'>सा विद्या या विमुक्तये</p></div>" +
               "<div class='body'>" + content + "</div>" +
               "<div class='footer'>Shiv Kumari Mahavidyalaya, Ashapur Village, Raniganj, Pratapgarh, UP<br>" +
               "info@skmahavidyalaya.ac.in | This is an automated email, please do not reply.</div>" +
               "</div></body></html>";
    }
}
