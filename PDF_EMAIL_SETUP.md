# PDF Generation and Email Delivery Setup

## Overview

This document explains how the CHALLENGE application automatically generates and emails PDF summaries when users complete the simulation. The system is designed to silently create a comprehensive PDF report that includes:

- Selected policy packages
- User's reflection responses with AI-generated feedback
- Stakeholder perspectives from the negotiation phase

The PDF is automatically emailed to a predefined administrator email (not to the user) when they view the final summary page.

## How It Works

1. When a user navigates to the Summary page, a React useEffect hook triggers once
2. The hook collects all necessary data (policies, reflections, feedback, and stakeholder interactions)
3. This data is sent to a Next.js API endpoint (/api/send-summary)
4. The API endpoint generates a PDF using @react-pdf/renderer
5. The PDF is then attached to an email and sent via nodemailer to a predefined admin email
6. This process happens silently in the background without user intervention

## Setting Up Email Delivery

### 1. Create .env.local file

Copy the provided `.env.local.example` file to `.env.local` and fill in your email credentials:

```
# Email Configuration for Summary PDF Sending

# Email account to send from (e.g., Gmail account)
EMAIL_USERNAME=your-email@gmail.com

# App password for the email account
# For Gmail, you can generate an app password at: https://myaccount.google.com/apppasswords
EMAIL_PASSWORD=your-app-password

# Destination email where reports will be sent (NOT the user's email)
ADMIN_EMAIL=destination@example.com
```

### 2. Gmail Setup (If using Gmail)

1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to your Google Account
   - Select Security
   - Under "Signing in to Google," select App Passwords
   - Generate a new app password for "Mail" and "Other"
   - Use this password in your .env.local file

### 3. Test the Setup

The PDF generation and email sending occur automatically when a user views the Summary page. To test:

1. Run the application locally: `npm run dev`
2. Complete the simulation (or navigate directly to the Summary page)
3. Check the console logs for any errors
4. Check the admin email for the PDF attachment

## Troubleshooting

### Common Issues

- **Email Not Sending**: Check that your email credentials are correct and that the email provider allows sending from less secure apps or using app passwords.

- **PDF Generation Errors**: Check the browser console for any errors related to PDF generation. The @react-pdf/renderer library requires specific formatting.

- **SMTP Connection Issues**: Some networks block outgoing SMTP connections. Try testing on different networks or using a different email provider.

### Logs

The application logs important information to help debug any issues:

- PDF generation status is logged to the console
- Email sending status is logged to the console
- Any errors during the process are captured and logged

## Customizing the PDF

The PDF template is defined in `/src/lib/pdf-generator.tsx`. You can modify this file to change the appearance of the PDF, including:

- Layout and styling
- Content sections
- Fonts and colors
- Header and footer

The styling uses React PDF's StyleSheet API, which is similar to React Native's styling system.

## Security Considerations

- Email credentials are stored in .env.local, which should NEVER be committed to version control
- The API endpoint only sends PDFs to the predefined admin email, not to user-provided addresses
- No user-identifiable information is included in the PDF unless entered by the user in reflections

## Production Deployment

For production deployment, we recommend:

1. Using environment variables provided by your hosting platform (Vercel, Netlify, etc.)
2. Setting up proper error monitoring
3. Considering a dedicated email service like SendGrid, Mailgun, or AWS SES for more reliable delivery
