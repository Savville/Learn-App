import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

export async function sendWelcomeEmail(email) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: '🎉 Welcome to Learn Opportunities!',
      html: `
        <h2>Welcome to Learn Opportunities!</h2>
        <p>You've successfully subscribed to our Kenya-focused opportunities newsletter.</p>
        <p>You'll receive notifications about:</p>
        <ul>
          <li>📚 New Scholarships & Grants</li>
          <li>💼 Internship Opportunities</li>
          <li>📝 Call for Papers & Conferences</li>
          <li>⏰ Deadline Reminders (7 & 3 days before)</li>
        </ul>
        <p>Best of luck with your applications!</p>
      `
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email send error:', error.message);
  }
}

export async function sendNewOpportunityEmail(subscribers, opportunity) {
  try {
    const emails = subscribers.map(s => s.email);
    
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      bcc: emails,
      subject: `🎯 New ${opportunity.category} Opportunity: ${opportunity.title}`,
      html: `
        <h2>${opportunity.title}</h2>
        <p><strong>Provider:</strong> ${opportunity.provider}</p>
        <p><strong>Category:</strong> ${opportunity.category}</p>
        <p><strong>Location:</strong> ${opportunity.location}</p>
        <p><strong>Deadline:</strong> ${opportunity.deadline}</p>
        <p>${opportunity.description}</p>
        <a href="${process.env.FRONTEND_URL}/opportunity/${opportunity.id}" 
           style="background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          View Details & Apply
        </a>
      `
    });
    console.log(`✅ Sent opportunity notification to ${emails.length} subscribers`);
  } catch (error) {
    console.error('❌ Email send error:', error.message);
  }
}

export async function sendDeadlineReminder(email, opportunity, daysLeft) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: `⏰ Deadline Reminder: ${daysLeft} days left for ${opportunity.title}`,
      html: `
        <h2>Deadline Reminder!</h2>
        <p>You have <strong>${daysLeft} days</strong> left to apply for:</p>
        <h3>${opportunity.title}</h3>
        <p><strong>Provider:</strong> ${opportunity.provider}</p>
        <p><strong>Final Deadline:</strong> ${opportunity.deadline}</p>
        <a href="${process.env.FRONTEND_URL}/opportunity/${opportunity.id}"
           style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Apply Now
        </a>
      `
    });
  } catch (error) {
    console.error('❌ Email send error:', error.message);
  }
}
