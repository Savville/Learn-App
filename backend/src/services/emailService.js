import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ── Brevo SMTP Transporter ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || 'Opportunities Kenya <lead@opportunitieskenya.live>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://opportunitieskenya.live';
const LOGO_URL = `${FRONTEND_URL}/Opportunities%20Kenya%20Logo%203.png`;

// ── Shared Brand Components ───────────────────────────────────────────────────
const brandBanner = `
  <div style="
    background: linear-gradient(135deg, #0f2744 0%, #1a4a7a 50%, #0d1f36 100%);
    padding: 36px 24px 28px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  ">
    <img
      src="${LOGO_URL}"
      alt="Opportunities Kenya"
      width="64"
      height="64"
      style="display:block; margin: 0 auto 14px; width:64px; height:64px; object-fit:contain;"
    />
    <h1 style="
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 6px;
      letter-spacing: 0.04em;
      font-family: Arial, sans-serif;
    ">Opportunities Kenya</h1>
    <p style="
      color: #93c5fd;
      font-size: 13px;
      margin: 0;
      font-family: Arial, sans-serif;
    ">Your Gateway to Global Opportunities</p>
  </div>`;

const emailFooter = `
  <div style="
    background: #f8fafc;
    padding: 20px 24px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
    border-radius: 0 0 12px 12px;
  ">
    <p style="color: #94a3b8; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">
      © 2026 Opportunities Kenya &nbsp;·&nbsp;
      <a href="${FRONTEND_URL}/opportunities" style="color: #1a4a7a; text-decoration:none;">Browse Opportunities</a>
      &nbsp;·&nbsp;
      <a href="${FRONTEND_URL}/unsubscribe" style="color: #94a3b8; text-decoration:none;">Unsubscribe</a>
    </p>
  </div>`;

const wrapEmail = (body) => `
  <div style="
    background: #f1f5f9;
    padding: 32px 16px;
    font-family: Arial, sans-serif;
  ">
    <div style="
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      overflow: hidden;
    ">
      ${brandBanner}
      ${body}
      ${emailFooter}
    </div>
  </div>`;

const ctaButton = (text, url, color = '#1a4a7a') => `
  <a href="${url}" style="
    display: inline-block;
    background: linear-gradient(135deg, #0f2744, #1a4a7a);
    color: #ffffff;
    padding: 13px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    font-family: Arial, sans-serif;
    margin-top: 8px;
  ">${text}</a>`;

// ── Category badge colours ─────────────────────────────────────────────────
const categoryColours = {
  Internship:    { bg: '#dbeafe', text: '#1e40af' },
  Scholarship:   { bg: '#dcfce7', text: '#166534' },
  Grant:         { bg: '#fef9c3', text: '#854d0e' },
  Conference:    { bg: '#f3e8ff', text: '#6b21a8' },
  CallForPapers: { bg: '#ffe4e6', text: '#9f1239' },
  Hackathon:     { bg: '#ffedd5', text: '#9a3412' },
  Other:         { bg: '#f1f5f9', text: '#475569' },
};

const categoryBadge = (cat) => {
  const c = categoryColours[cat] || categoryColours.Other;
  return `<span style="
    background: ${c.bg};
    color: ${c.text};
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    font-family: Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  ">${cat}</span>`;
};

// ── Email Templates ───────────────────────────────────────────────────────────

const welcomeTemplate = (email) => wrapEmail(`
  <div style="padding: 32px 28px;">
    <h2 style="color: #0f2744; font-size: 20px; margin: 0 0 12px;">
      Welcome aboard! 🚀
    </h2>
    <p style="color: #475569; line-height: 1.7; margin: 0 0 16px;">
      You are now subscribed to <strong>Opportunities Kenya</strong> — your curated source
      for the best scholarships, internships, grants, fellowships and conferences
      for Kenyan and African students.
    </p>
    <p style="color: #475569; line-height: 1.7; margin: 0 0 8px;"><strong>You'll receive:</strong></p>
    <table cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; margin-bottom:24px;">
      ${[
        ['🎓', 'Scholarships', 'Local & international funding opportunities'],
        ['💼', 'Internships', 'Paid & fully funded work experience'],
        ['💰', 'Grants', 'Research and project funding'],
        ['🌍', 'Conferences', 'Summits, workshops & training programmes'],
        ['📋', 'Call for Papers', 'Research publication & fellowship calls'],
      ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding: 8px 0; width:36px; vertical-align:top; font-size:18px;">${icon}</td>
          <td style="padding: 8px 12px 8px 0; vertical-align:top;">
            <strong style="color:#0f2744; font-size:14px;">${title}</strong><br/>
            <span style="color:#64748b; font-size:13px;">${desc}</span>
          </td>
        </tr>`).join('')}
    </table>
    ${ctaButton('Browse All Opportunities →', `${FRONTEND_URL}/opportunities`)}
  </div>`);

const opportunityCard = (opp) => `
  <div style="
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 16px;
  ">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:6px;">
      ${categoryBadge(opp.category)}
      <span style="color: #ef4444; font-size: 12px; font-weight: 600; font-family:Arial,sans-serif;">
        ⏰ Deadline: ${opp.deadline === 'Rolling' ? 'Rolling — apply anytime' : opp.deadline}
      </span>
    </div>
    <h3 style="color: #0f2744; font-size: 16px; margin: 0 0 4px; font-family:Arial,sans-serif;">
      ${opp.title}
    </h3>
    <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; font-family:Arial,sans-serif;">
      ${opp.provider}${opp.location ? ` &nbsp;·&nbsp; ${opp.location}` : ''}
      ${opp.fundingType ? ` &nbsp;·&nbsp; <strong style="color:#166534;">${opp.fundingType}</strong>` : ''}
    </p>
    <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0 0 14px; font-family:Arial,sans-serif;">
      ${opp.description ? opp.description.substring(0, 140).trim() + '…' : ''}
    </p>
    <a href="${FRONTEND_URL}/opportunity/${opp.id}" style="
      color: #1a4a7a;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      font-family: Arial, sans-serif;
    ">View Details & Apply →</a>
  </div>`;

const digestTemplate = (opportunities) => wrapEmail(`
  <div style="padding: 32px 28px;">
    <h2 style="color: #0f2744; font-size: 20px; margin: 0 0 6px;">
      New Opportunities Just Added 🎯
    </h2>
    <p style="color: #64748b; font-size: 14px; margin: 0 0 24px; font-family:Arial,sans-serif;">
      ${opportunities.length} new opportunit${opportunities.length === 1 ? 'y' : 'ies'} curated for you this week.
    </p>
    ${opportunities.map(opportunityCard).join('')}
    ${ctaButton('See All Opportunities →', `${FRONTEND_URL}/opportunities`)}
  </div>`);

const deadlineReminderTemplate = (opportunity, daysLeft) => wrapEmail(`
  <div style="padding: 32px 28px;">
    <div style="
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
    ">
      <p style="color: #991b1b; font-size: 14px; font-weight: 700; margin: 0; font-family:Arial,sans-serif;">
        ⏰ Only <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong> left to apply!
      </p>
    </div>
    ${opportunityCard(opportunity)}
    ${ctaButton('Apply Now →', `${FRONTEND_URL}/opportunity/${opportunity.id}`, '#dc2626')}
  </div>`);

// ── Send Functions ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email) {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: '🎉 Welcome to Opportunities Kenya!',
      html: welcomeTemplate(email),
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Welcome email failed for ${email}:`, error.message);
  }
}

export async function sendNewOpportunityEmail(subscribers, opportunity) {
  try {
    const emails = subscribers.map(s => s.email);
    await transporter.sendMail({
      from: FROM,
      bcc: emails,
      subject: `🎯 New ${opportunity.category}: ${opportunity.title}`,
      html: digestTemplate([opportunity]),
    });
    console.log(`✅ Opportunity notification sent to ${emails.length} subscribers`);
  } catch (error) {
    console.error('❌ Opportunity email failed:', error.message);
  }
}

export async function sendDigestEmail(emails, opportunities) {
  const results = { success: 0, failed: 0 };
  for (const email of emails) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: email,
        subject: `🌟 ${opportunities.length} New Opportunities on Opportunities Kenya`,
        html: digestTemplate(opportunities),
      });
      results.success++;
      await new Promise(r => setTimeout(r, 150)); // avoid rate limit
    } catch (error) {
      console.error(`❌ Digest failed for ${email}:`, error.message);
      results.failed++;
    }
  }
  console.log(`📧 Digest: ${results.success} sent, ${results.failed} failed`);
  return results;
}

export async function sendDeadlineReminder(email, opportunity, daysLeft) {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `⏰ ${daysLeft} days left — ${opportunity.title}`,
      html: deadlineReminderTemplate(opportunity, daysLeft),
    });
    console.log(`✅ Deadline reminder sent to ${email}`);
  } catch (error) {
    console.error(`❌ Deadline reminder failed for ${email}:`, error.message);
  }
}
