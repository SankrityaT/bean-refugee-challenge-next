# PDF Email Setup for CHALLENGE App

## Overview

This guide explains how the automatic PDF email delivery works when users click "View Final Summary" in the ethical reflection page.

## How It Works

1. When a user clicks "View Final Summary" in the ethical reflection page, the application silently generates a PDF of their work using Ethereal Mail (a testing service)
2. The PDF is temporarily hosted on Ethereal's servers, generating a preview URL
3. EmailJS is then used to send an email to sankritya09.02@gmail.com containing a link to view and download the PDF
4. The user is then redirected to the summary page as normal

## Setup Instructions

### 1. Configure EmailJS

To use EmailJS for sending emails:

1. Sign up for a free account at https://www.emailjs.com/
2. Create a new Email Service (Gmail, Outlook, etc.)
3. Create a new Email Template with the following parameters:
   - `to_email`: The recipient's email (will be set to sankritya09.02@gmail.com)
   - `from_name`: The sender's name (will be set to "CHALLENGE App")
   - `to_name`: The recipient's name (will be set to "Professor")
   - `subject`: The email subject
   - `message`: The email body
   - `student_name`: The student's name
   - `pdf_link`: The link to the PDF preview

4. Note your Service ID, Template ID, and Public Key

### 2. Update Environment Variables

Create or update your `.env.local` file with the following variables:

```
# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
```

### 3. Testing

To test if the email functionality is working:

1. Complete at least 3 reflection questions in the ethical reflection page
2. Click "View Final Summary"
3. You should see a toast notification indicating the summary was sent
4. For testing purposes, you'll also see a "PDF Preview" toast with a link to view the PDF directly
5. Check if sankritya09.02@gmail.com receives an email with a link to view the PDF

## Technical Implementation

- PDF generation happens on the server using jsPDF and Ethereal Mail
- Ethereal Mail provides a temporary preview URL for the PDF
- EmailJS sends an email with the preview URL to the professor
- No attachments are sent directly, avoiding email provider limitations
- The implementation is mostly silent - users only see a brief confirmation toast
