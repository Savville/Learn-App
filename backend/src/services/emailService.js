import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const toSlug = (title) => title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

// Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'Opportunities Kenya <lead@opportunitieskenya.live>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://opportunitieskenya.live';

// Images served from Vercel public folder
const BANNER_URL = `${FRONTEND_URL}/Email%20Banner.png`;
const FOOTER_URL  = `${FRONTEND_URL}/Email%20Footer.png`;

// Shared HTML wrapper
const wrapEmail = (body) => `
  <div style="background:#f1f5f9; padding:32px 16px; font-family:Arial,sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.08); overflow:hidden;">
      <img src="${BANNER_URL}" alt="Opportunities Kenya" width="600" style="display:block; width:100%; height:auto;" />
      ${body}
      <img src="${FOOTER_URL}" alt="" width="600" style="display:block; width:100%; height:auto;" />
    </div>
  </div>`;

const ctaButton = (text, url) => `
  <a href="${url}" style="
    display:inline-block;
    background:linear-gradient(135deg,#0f2744,#1a4a7a);
    color:#ffffff; padding:13px 28px; border-radius:8px;
    text-decoration:none; font-weight:700; font-size:14px;
    font-family:Arial,sans-serif; margin-top:8px;
  ">${text}</a>`;

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
  return `<span style="background:${c.bg};color:${c.text};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;">${cat}</span>`;
};

const welcomeTemplate = () => wrapEmail(`
  <div style="padding:32px 28px;">
    <h2 style="color:#0f2744;font-size:20px;margin:0 0 12px;">Welcome aboard!</h2>
    <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
      You are now subscribed to <strong>Opportunities Kenya</strong>  your curated source
      for the best scholarships, internships, grants, fellowships and conferences for Kenyan and African students.
    </p>
    <p style="color:#475569;line-height:1.7;margin:0 0 8px;"><strong>You'll receive:</strong></p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${[
        ['Scholarships','Local & international funding opportunities'],
        ['Internships','Paid & fully funded work experience'],
        ['Grants','Research and project funding'],
        ['Conferences','Summits, workshops & training programmes'],
        ['Call for Papers','Research publication & fellowship calls'],
      ].map(([title,desc]) => `
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;">
            <strong style="color:#0f2744;font-size:14px;">${title}</strong><br/>
            <span style="color:#64748b;font-size:13px;">${desc}</span>
          </td>
        </tr>`).join('')}
    </table>
    ${ctaButton('Browse All Opportunities', `${FRONTEND_URL}/opportunities`)}
  </div>`);

const opportunityCard = (opp) => `
  <div style="border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:16px;">
    <div style="margin-bottom:10px;">
      ${categoryBadge(opp.category)}
      <span style="color:#ef4444;font-size:12px;font-weight:600;font-family:Arial,sans-serif;margin-left:8px;">
        Deadline: ${opp.deadline === 'Rolling' ? 'Rolling  apply anytime' : opp.deadline}
      </span>
    </div>
    <h3 style="color:#0f2744;font-size:16px;margin:0 0 4px;font-family:Arial,sans-serif;">${opp.title}</h3>
    <p style="color:#64748b;font-size:13px;margin:0 0 8px;font-family:Arial,sans-serif;">
      ${opp.provider}${opp.location ? '  ' + opp.location : ''}
      ${opp.fundingType ? '  <strong style="color:#166534;">' + opp.fundingType + '</strong>' : ''}
    </p>
    <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 14px;font-family:Arial,sans-serif;">
      ${opp.description ? opp.description.substring(0, 140).trim() + '...' : ''}
    </p>
    <a href="${FRONTEND_URL}/opportunity/${toSlug(opp.title)}" style="color:#1a4a7a;font-size:13px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">
      View Details & Apply
    </a>
  </div>`;

const digestTemplate = (opportunities) => wrapEmail(`
  <div style="padding:32px 28px;">
    <h2 style="color:#0f2744;font-size:20px;margin:0 0 6px;">New Opportunities Just Added</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;font-family:Arial,sans-serif;">
      ${opportunities.length} new opportunit${opportunities.length === 1 ? 'y' : 'ies'} curated for you.
    </p>
    ${opportunities.map(opportunityCard).join('')}
    ${ctaButton('See All Opportunities', `${FRONTEND_URL}/opportunities`)}
  </div>`);

const deadlineReminderTemplate = (opportunity, daysLeft) => wrapEmail(`
  <div style="padding:32px 28px;">
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
      <p style="color:#991b1b;font-size:14px;font-weight:700;margin:0;font-family:Arial,sans-serif;">
        Only <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong> left to apply!
      </p>
    </div>
    ${opportunityCard(opportunity)}
    ${ctaButton('Apply Now', `${FRONTEND_URL}/opportunity/${toSlug(opportunity.title)}`)}
  </div>`);

// Send helpers
async function sendEmail({ to, subject, html }) {
  return resend.emails.send({
    from: FROM,
    to,
    reply_to: 'lead@opportunitieskenya.live',
    subject,
    html,
  });
}

export async function sendWelcomeEmail(email) {
  try {
    await sendEmail({ to: email, subject: 'Welcome to Opportunities Kenya!', html: welcomeTemplate() });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`Welcome email failed for ${email}:`, error.message);
  }
}

export async function sendAdminSubmissionNotification(reporter, opportunity) {
  const adminEmails = ['lead@opportunitieskenya.live', 'opportunitieskenyalive@gmail.com'];
  try {
    const html = wrapEmail(`
      <div style="padding:32px 28px;">
        <h2 style="color:#0f2744;font-size:20px;margin:0 0 12px;">New Opportunity Submission</h2>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          A new opportunity has been submitted via the <strong>Post With Us</strong> page and is waiting for your verification.
        </p>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:24px;">
          <p style="margin:0 0 8px; font-size:14px;"><strong>Submitted By:</strong> ${reporter.name} (${reporter.email})</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Organization:</strong> ${reporter.organization || 'Not provided'}</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Role:</strong> ${reporter.role || 'Not provided'}</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Phone:</strong> ${reporter.telephone || 'Not provided'}</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Website / Social:</strong> ${reporter.websiteOrSocial || 'Not provided'}</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Title:</strong> ${opportunity.title}</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Provider:</strong> ${opportunity.provider}</p>
          <p style="margin:0; font-size:14px;"><strong>Category:</strong> ${opportunity.category}</p>
        </div>
        <div style="text-align:center; margin-top:20px;">
          ${ctaButton('Go to Verification Inbox', `${FRONTEND_URL}/admin/dashboard`)}
        </div>
      </div>
    `);

    for (const email of adminEmails) {
      await sendEmail({
        to: email,
        subject: `[New Submission] ${opportunity.title}`,
        html: html
      });
    }
    console.log(`Admin notification sent for submission: ${opportunity.title}`);
  } catch (error) {
    console.error(`Admin submission notification failed:`, error.message);
  }
}

export async function sendPosterApprovalEmail(posterEmail, opportunity) {
  try {
    const html = wrapEmail(`
      <div style="padding:32px 28px;">
        <h2 style="color:#0f2744;font-size:20px;margin:0 0 12px;">Congratulations! Your Opportunity is Live</h2>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Great news! The opportunity you shared, <strong>${opportunity.title}</strong>, has been reviewed and is now live on 
          <strong>Opportunities Kenya</strong>.
        </p>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          It is now visible to thousands of students and change-makers across the platform. Thank you for contributing to our community.
        </p>
        <div style="text-align:center; margin-top:20px;">
          ${ctaButton('View Your Live Post', `${FRONTEND_URL}/opportunity/${toSlug(opportunity.title)}`)}
        </div>
      </div>
    `);

    await sendEmail({
      to: posterEmail,
      subject: `Your opportunity "${opportunity.title}" is now published!`,
      html: html
    });
    console.log(`Approval notification sent to poster: ${posterEmail}`);
  } catch (error) {
    console.error(`Poster approval email failed for ${posterEmail}:`, error.message);
  }
}

export async function sendPosterAcknowledgementEmail(posterEmail, posterName, opportunityTitle) {
  try {
    const html = wrapEmail(`
      <div style="padding:32px 28px;">
        <h2 style="color:#0f2744;font-size:20px;margin:0 0 12px;">We've Received Your Submission!</h2>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Hello ${posterName},
        </p>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Thank you for sharing your opportunity: <strong>${opportunityTitle}</strong>. 
          We have indeed received it and our team is already working on verifying the details.
        </p>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Once it is approved and published on <strong>Opportunities Kenya</strong>, we will send you another notification with the live link.
        </p>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Thank you for contributing to Kenya's leading student opportunities platform.
        </p>
        <div style="text-align:center; margin-top:20px;">
          <a href="${FRONTEND_URL}/opportunities" style="color:#1a4a7a;font-weight:700;text-decoration:none;">Browse Other Opportunities</a>
        </div>
      </div>
    `);

    await sendEmail({
      to: posterEmail,
      subject: `We've got your submission: ${opportunityTitle}`,
      html: html
    });
    console.log(`Acknowledgement email sent to ${posterEmail}`);
  } catch (error) {
    console.error(`Acknowledgement email failed for ${posterEmail}:`, error.message);
  }
}

export async function sendNewOpportunityEmail(subscribers, opportunity) {
  try {
    const bcc = subscribers.map(s => s.email);
    await resend.emails.send({
      from: FROM,
      to: FROM,
      bcc,
      reply_to: 'lead@opportunitieskenya.live',
      subject: `New ${opportunity.category}: ${opportunity.title}`,
      html: digestTemplate([opportunity]),
    });
    console.log(`Opportunity notification sent to ${bcc.length} subscribers`);
  } catch (error) {
    console.error('Opportunity email failed:', error.message);
  }
}

export async function sendDigestEmail(emails, opportunities) {
  const results = { success: 0, failed: 0 };
  for (const email of emails) {
    try {
      await sendEmail({
        to: email,
        subject: `${opportunities.length} New Opportunities on Opportunities Kenya`,
        html: digestTemplate(opportunities),
      });
      results.success++;
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.error(`Digest failed for ${email}:`, error.message);
      results.failed++;
    }
  }
  console.log(`Digest: ${results.success} sent, ${results.failed} failed`);
  return results;
}

export async function sendPersonalizedDigestEmail(email, opportunities, isPersonalized = true) {
  try {
    const subject = isPersonalized
      ? `${opportunities.length} Opportunit${opportunities.length === 1 ? 'y' : 'ies'} Matching Your Interests`
      : `${opportunities.length} New Opportunities on Opportunities Kenya`;
    await sendEmail({ to: email, subject, html: digestTemplate(opportunities) });
    return true;
  } catch (error) {
    console.error(`Personalized digest failed for ${email}:`, error.message);
    return false;
  }
}

export async function sendDeadlineReminder(email, opportunity, daysLeft) {
  try {
    await sendEmail({
      to: email,
      subject: `${daysLeft} days left  ${opportunity.title}`,
      html: deadlineReminderTemplate(opportunity, daysLeft),
    });
    console.log(`Deadline reminder sent to ${email}`);
  } catch (error) {
    console.error(`Deadline reminder failed for ${email}:`, error.message);
  }
}

export async function sendEepEmail(subscribers) {
  try {
    const subject = 'CORRECTION: Got an idea? The EEP fund is looking for you.';
    console.log(`Starting EEP broadcast to ${subscribers.length} subscribers.`);
    await sendPersonalizedBroadcastEmail(subscribers, subject, eepTemplate);
    console.log('✅ EEP broadcast successfully completed.');
    return { success: true };
  } catch (error) {
    console.error('❌ EEP broadcast email failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendPersonalizedBroadcastEmail(subscribers, subject, htmlGenerator) {
  const results = { success: 0, failed: 0 };
  for (const subscriber of subscribers) {
    try {
      const html = htmlGenerator(subscriber.name);
      await sendEmail({ to: subscriber.email, subject, html });
      results.success++;
      // Added a small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    } catch (error) {
      console.error(`Personalized broadcast failed for ${subscriber.email}:`, error.message);
      results.failed++;
    }
  }
  console.log(`Personalized Broadcast: ${results.success} sent, ${results.failed} failed`);
  return results;
}

// ── YESIST Hackathon Broadcast ───────────────────────────────────────────────

const yesistTemplate = () => wrapEmail(`
  <div style="padding:32px 28px;font-family:Arial,sans-serif;">

    <!-- Hook box -->
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:18px 20px;margin-bottom:28px;">
      <p style="color:#92400e;font-size:16px;font-weight:700;margin:0 0 6px;font-family:Arial,sans-serif;">This hackathon was built for IEEE members.</p>
      <p style="color:#78350f;font-size:14px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
        The <strong>IEEE Africa Entrepreneurship Summit Hackathon 2026</strong> was co-organised by IEEE Africa
        and IEEE YESIST12 specifically for students and young innovators across Africa.
        As a KU IEEE member, you are the exact target participant.
        The deadline is <strong>tomorrow &mdash; 10 March 2026.</strong>
      </p>
    </div>

    <!-- Body -->
    <p style="color:#1e293b;font-size:15px;line-height:1.8;margin:0 0 12px;font-family:Arial,sans-serif;">
      This is not a general open call. The hackathon was co-organised by IEEE Africa and IEEE YESIST12 &mdash;
      two of the most prominent IEEE bodies on the continent &mdash; with the explicit purpose of mobilising
      IEEE student members to develop scalable, technology-driven solutions for Africa&rsquo;s most pressing challenges.
    </p>
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
      Top teams will receive <strong>fully funded travel grants</strong> covering transport, accommodation,
      and all related costs to present their solutions at <strong>IEEE YESIST12 2026 in Indonesia.</strong>
      This is a rare opportunity to represent your university and your country on a global IEEE stage.
    </p>

    <!-- Stats box — no emojis -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px 22px;margin-bottom:28px;">
      <h3 style="color:#1e40af;font-size:15px;margin:0 0 14px;font-family:Arial,sans-serif;">Key Details</h3>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 12px 8px 0;color:#64748b;font-size:13px;font-weight:700;width:150px;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">Deadline</td>
          <td style="padding:8px 0;color:#1e293b;font-size:13px;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;"><strong>10 March 2026 &mdash; Tomorrow</strong></td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;color:#64748b;font-size:13px;font-weight:700;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">Team Size</td>
          <td style="padding:8px 0;color:#1e293b;font-size:13px;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">3 to 5 members</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;color:#64748b;font-size:13px;font-weight:700;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">Funding</td>
          <td style="padding:8px 0;color:#1e293b;font-size:13px;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;"><strong>Fully funded</strong> &mdash; travel and accommodation to Indonesia for top teams</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;color:#64748b;font-size:13px;font-weight:700;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">Finals Venue</td>
          <td style="padding:8px 0;color:#1e293b;font-size:13px;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">IEEE YESIST12 2026, Indonesia</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;color:#64748b;font-size:13px;font-weight:700;font-family:Arial,sans-serif;">Organiser Contact</td>
          <td style="padding:8px 0;color:#1e293b;font-size:13px;font-family:Arial,sans-serif;">
            <a href="mailto:kipngeno.koech@ieee.org" style="color:#1a4a7a;text-decoration:none;">kipngeno.koech@ieee.org</a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Thematic areas — 1 emoji each -->
    <h2 style="color:#0f2744;font-size:17px;margin:0 0 8px;font-family:Arial,sans-serif;">Five Thematic Areas</h2>
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 16px;font-family:Arial,sans-serif;">
      Your solution must address one of the following five thematic areas:
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
      <tr>
        <td style="width:50%;padding:8px 6px;font-size:13px;color:#1e293b;font-family:Arial,sans-serif;">🌿 Climate &amp; Sustainable Agriculture</td>
        <td style="width:50%;padding:8px 6px;font-size:13px;color:#1e293b;font-family:Arial,sans-serif;">⚡ Clean Energy &amp; Sustainable Infrastructure</td>
      </tr>
      <tr>
        <td style="padding:8px 6px;font-size:13px;color:#1e293b;font-family:Arial,sans-serif;">🏥 HealthTech &amp; Well-being</td>
        <td style="padding:8px 6px;font-size:13px;color:#1e293b;font-family:Arial,sans-serif;">🎓 Education &amp; Digital Inclusion</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:8px 6px;font-size:13px;color:#1e293b;font-family:Arial,sans-serif;">💼 Economic Empowerment &amp; Smart Communities</td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      ${ctaButton('Apply Now', 'https://opportunitieskenya.live/opportunity/ieee-africa-entrepreneurship-summit-hackathon-2026')}
    </div>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

    <!-- Urgency close -->
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 12px;font-family:Arial,sans-serif;">
      You have until midnight tomorrow. Form a team today &mdash; reach out to your fellow IEEE KU members,
      lab partners, and classmates. A team of three with a well-defined idea is all it takes to enter.
    </p>
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
      For queries, contact the organiser directly at
      <a href="mailto:kipngeno.koech@ieee.org" style="color:#1a4a7a;font-weight:700;text-decoration:none;">kipngeno.koech@ieee.org</a>.
    </p>

    <!-- View all -->
    <p style="color:#475569;font-size:13px;margin:0 0 24px;font-family:Arial,sans-serif;">
      View all opportunities at:
      <a href="${FRONTEND_URL}" style="color:#1a4a7a;font-weight:700;text-decoration:none;">${FRONTEND_URL}</a>
    </p>

    <!-- Socials + contact -->
    <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;">
      <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 10px;font-family:Arial,sans-serif;">Connect With Us</p>
      <p style="margin:0;font-size:13px;color:#475569;line-height:2.4;font-family:Arial,sans-serif;">
        📸 <a href="https://www.instagram.com/opportunitieskenyalive/" style="color:#1a4a7a;text-decoration:none;">@opportunitieskenyalive</a> on Instagram<br/>
        💬 <a href="https://whatsapp.com/channel/0029Vb7NnTREVccCzjHtYz07" style="color:#1a4a7a;text-decoration:none;">Join our WhatsApp Channel</a><br/>
        📞 <a href="tel:+254108176677" style="color:#1a4a7a;text-decoration:none;">0108 176 677</a>
        &nbsp;&nbsp;✉️ <a href="mailto:lead@opportunitieskenya.live" style="color:#1a4a7a;text-decoration:none;">lead@opportunitieskenya.live</a>
      </p>
    </div>

  </div>`);

// ── Seangapo Broadcast ──────────────────────────────────────────────────────

const seangapoTemplate = () => wrapEmail(`
  <div style="padding:32px 28px;font-family:Arial,sans-serif;">

    <!-- Meme hook -->
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:18px 20px;margin-bottom:28px;">
      <p style="color:#92400e;font-size:16px;font-weight:700;margin:0 0 6px;font-family:Arial,sans-serif;">You've seen the memes. 😅</p>
      <p style="color:#78350f;font-size:14px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
        <strong>Seangapo. Sinkapo. Singapool. Sea-ngapo. Sinkapore...</strong><br/>
        The dream of turning Nairobi into the &ldquo;Singapore of Africa&rdquo; has, thanks to yet another round
        of heavy rains and catastrophic flooding, become a tragic joke. Streets turned into rivers,
        cars swept away, lives lost, properties destroyed.
      </p>
    </div>

    <!-- Accountability -->
    <p style="color:#1e293b;font-size:15px;line-height:1.8;margin:0 0 12px;font-family:Arial,sans-serif;">
      We can&rsquo;t keep watching our capital drown while leaders promise miracles but deliver excuses.
      The recent floods aren&rsquo;t just &ldquo;bad weather&rdquo; &mdash; they&rsquo;re the direct result of
      <strong>blocked drains, unmaintained infrastructure, and zero accountability.</strong>
      Enough is enough.
    </p>
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
      But here&rsquo;s the thing: while we can&rsquo;t single-handedly fix the entire city&rsquo;s drainage overnight,
      there <em>are</em> solvable water problems we <strong>CAN</strong> tackle right now &mdash; problems that are
      technical, fixable with innovation and skills, and don&rsquo;t require waiting for political will.
    </p>

    <!-- NRW stats box -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px 22px;margin-bottom:28px;">
      <h3 style="color:#1e40af;font-size:15px;margin:0 0 14px;font-family:Arial,sans-serif;">
        💧 One massive, solvable crisis: <strong>Non-Revenue Water (NRW) at NCWSC</strong>
      </h3>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:7px 0;color:#1e293b;font-size:13px;line-height:1.6;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">🔴&nbsp; Nairobi loses nearly <strong>half (44–54%)</strong> of all treated water before it reaches a single tap</td></tr>
        <tr><td style="padding:7px 0;color:#1e293b;font-size:13px;line-height:1.6;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">🔴&nbsp; Estimated <strong>Ksh 11–12 billion</strong> lost every year through leaks, theft, broken meters &amp; billing failures</td></tr>
        <tr><td style="padding:7px 0;color:#1e293b;font-size:13px;line-height:1.6;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">🔴&nbsp; Over <strong>10,000+ illegal connections</strong> in informal settlements</td></tr>
        <tr><td style="padding:7px 0;color:#1e293b;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">🔴&nbsp; Hundreds of millions billed &mdash; <strong>zero collected.</strong> No enforcement. No disconnections.</td></tr>
      </table>
      <p style="color:#1d4ed8;font-size:13px;font-weight:700;margin:14px 0 0;font-family:Arial,sans-serif;">
        This isn&rsquo;t fate. It&rsquo;s a solvable engineering, tech, and management problem.
      </p>
    </div>

    <!-- Challenge brief -->
    <h2 style="color:#0f2744;font-size:18px;margin:0 0 8px;font-family:Arial,sans-serif;">🏗️ Industry Challenge Brief &mdash; Nairobi Water Crisis</h2>
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 4px;font-family:Arial,sans-serif;">
      The Nairobi City Water &amp; Sewerage Company (NCWSC) is battling a 44–54% Non-Revenue Water crisis.<br/>
      <strong>Can you help fix it?</strong>
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0 20px;">
      <tr><td style="padding:5px 0;color:#1e293b;font-size:14px;font-family:Arial,sans-serif;">✅&nbsp; Use it as your <strong>final year project</strong> or capstone</td></tr>
      <tr><td style="padding:5px 0;color:#1e293b;font-size:14px;font-family:Arial,sans-serif;">✅&nbsp; Build it into your <strong>research paper</strong> or thesis</td></tr>
      <tr><td style="padding:5px 0;color:#1e293b;font-size:14px;font-family:Arial,sans-serif;">✅&nbsp; Prototype a solution for your <strong>capstone or hackathon</strong></td></tr>
    </table>
    <p style="color:#475569;font-size:13px;margin:0 0 6px;font-family:Arial,sans-serif;"><strong>No application needed.</strong> Just your skills and curiosity.</p>

    <p style="color:#0f2744;font-size:13px;font-weight:700;margin:16px 0 10px;font-family:Arial,sans-serif;">Explore 6 key problem areas:</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
      <tr>
        <td style="width:50%;padding:5px 4px;font-size:13px;color:#374151;font-family:Arial,sans-serif;">🔧 Leak detection technologies</td>
        <td style="width:50%;padding:5px 4px;font-size:13px;color:#374151;font-family:Arial,sans-serif;">📡 Smart metering systems</td>
      </tr>
      <tr>
        <td style="padding:5px 4px;font-size:13px;color:#374151;font-family:Arial,sans-serif;">🗺️ GIS mapping for infrastructure</td>
        <td style="padding:5px 4px;font-size:13px;color:#374151;font-family:Arial,sans-serif;">🤖 AI analytics for loss prediction</td>
      </tr>
      <tr>
        <td style="padding:5px 4px;font-size:13px;color:#374151;font-family:Arial,sans-serif;">⚡ Illegal connection monitoring</td>
        <td style="padding:5px 4px;font-size:13px;color:#374151;font-family:Arial,sans-serif;">♻️ Wastewater reuse systems</td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      ${ctaButton('👉 Read the Full Challenge Brief', `${FRONTEND_URL}/opportunity/non-revenue-water-crisis-can-you-help-nairobi-fix-it`)}
    </div>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

    <!-- Closing -->
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 12px;font-family:Arial,sans-serif;">
      Forward this to students, engineers, techies, researchers, startups &mdash; anyone who can turn
      frustration into innovation. Let&rsquo;s channel the energy from these <em>Seangapo memes</em> into
      real action on what we <strong>CAN</strong> solve.
    </p>
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
      While the government must be held accountable for the floods and infrastructure failures,
      we don&rsquo;t have to wait passively.
      <strong>We can start fixing the fixable today.</strong>
    </p>

    <!-- View all -->
    <p style="color:#475569;font-size:13px;margin:0 0 24px;font-family:Arial,sans-serif;">
      🌐 View all opportunities at:
      <a href="${FRONTEND_URL}" style="color:#1a4a7a;font-weight:700;text-decoration:none;">${FRONTEND_URL}</a>
    </p>

    <!-- Socials + contact -->
    <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;">
      <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 10px;font-family:Arial,sans-serif;">Connect With Us</p>
      <p style="margin:0;font-size:13px;color:#475569;line-height:2.4;font-family:Arial,sans-serif;">
        📸 <a href="https://www.instagram.com/opportunitieskenyalive/" style="color:#1a4a7a;text-decoration:none;">@opportunitieskenyalive</a> on Instagram<br/>
        💬 <a href="https://whatsapp.com/channel/0029Vb7NnTREVccCzjHtYz07" style="color:#1a4a7a;text-decoration:none;">Join our WhatsApp Channel</a><br/>
        📞 <a href="tel:+254108176677" style="color:#1a4a7a;text-decoration:none;">0108 176 677</a>
        &nbsp;&nbsp;✉️ <a href="mailto:lead@opportunitieskenya.live" style="color:#1a4a7a;text-decoration:none;">lead@opportunitieskenya.live</a>
      </p>
    </div>

  </div>`);

export async function sendBroadcastEmail(emails, subject, html) {
  const results = { success: 0, failed: 0 };
  for (const email of emails) {
    try {
      await sendEmail({ to: email, subject, html });
      results.success++;
      await new Promise(r => setTimeout(r, 200));
    } catch (error) {
      console.error(`Broadcast failed for ${email}:`, error.message);
      results.failed++;
    }
  }
  console.log(`Broadcast: ${results.success} sent, ${results.failed} failed`);
  return results;
}

// ── EEP Broadcast ────────────────────────────────────────────────────────────

const eepTemplate = (name = 'Innovator') => wrapEmail(`
  <div style="padding:32px 28px;font-family:Arial,sans-serif;">

    <!-- Story Hook -->
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:18px 20px;margin-bottom:28px;">
      <p style="color:#15803d;font-size:16px;font-weight:700;margin:0 0 6px;font-family:Arial,sans-serif;">Tired of seeing the same problems with no solutions?</p>
      <p style="color:#166534;font-size:14px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
        Mambo ${name}, we all have that one friend in the village, maybe in shagz, who has a brilliant idea but lacks the cash to make it happen. Ama it's you? You see a problem in your community—maybe it's access to clean water, maybe it's farm produce going to waste—and you know a tech solution could fix it. But pesa nani atatoa?
      </p>
    </div>

    <!-- The 'Why' -->
    <p style="color:#1e293b;font-size:15px;line-height:1.8;margin:0 0 12px;font-family:Arial,sans-serif;">
     This is your chance to stop complaining and start building. The <strong>EEP (Empowering Engineers Program)</strong> isn't just another fund. It’s a challenge to you to look around your community, pinpoint a real-world problem, and propose a solution that works.
    </p>
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
      Think about it. That project you discussed with your friends after class, the one that could help farmers in Makueni get weather alerts, or a simple system to manage waste collection in your estate in Nairobi. That’s what EEP is for. They provide the funding and support; you bring the idea, the passion, and the technical skills.
    </p>

    <!-- EEP Image -->
    <div style="margin-bottom:28px;text-align:center;">
        <img src="${FRONTEND_URL}/images/opportunities/EEP.png" alt="EEP Opportunity" style="max-width:100%;height:auto;border-radius:12px;" />
    </div>

    <!-- The 'How' -->
    <h2 style="color:#0f2744;font-size:18px;margin:0 0 8px;font-family:Arial,sans-serif;">Here's a Story for You...</h2>
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 16px;font-family:Arial,sans-serif;">
     Last year, a group of students from a university not so different from yours noticed that local clinics were struggling to keep vaccines at the right temperature during power outages. Instead of just talking about it, they designed a low-cost, solar-powered refrigeration unit. They documented their idea, outlined the community impact, and applied for EEP funding. Today, their solution is being piloted in three clinics, saving lives.
    </p>
    <p style="color:#1e293b;font-size:15px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
        <strong>What problem will you solve?</strong>
    </p>

    <!-- Key Details -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px 22px;margin-bottom:28px;">
      <h3 style="color:#1e40af;font-size:15px;margin:0 0 14px;font-family:Arial,sans-serif;">Key Focus Areas</h3>
       <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:7px 0;color:#1e293b;font-size:13px;line-height:1.6;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">🌱&nbsp; Agri-Tech &amp; Food Security</td></tr>
        <tr><td style="padding:7px 0;color:#1e293b;font-size:13px;line-height:1.6;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">💧&nbsp; Water, Sanitation &amp; Hygiene (WASH)</td></tr>
        <tr><td style="padding:7px 0;color:#1e293b;font-size:13px;line-height:1.6;border-bottom:1px solid #dbeafe;font-family:Arial,sans-serif;">⚡&nbsp; Renewable Energy &amp; Smart Grids</td></tr>
        <tr><td style="padding:7px 0;color:#1e293b;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">🏥&nbsp; Health-Tech &amp; Telemedicine</td></tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      ${ctaButton('Learn More & Apply for EEP', 'https://opportunitieskenya.live/opportunity/eep-africa-call-for-proposals-2026')}
    </div>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

    <!-- Closing -->
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 12px;font-family:Arial,sans-serif;">
      This is a direct call to you, the innovators, the problem-solvers, the ones who can. Don't let your ideas gather dust.
    </p>
    
    <!-- View all -->
    <p style="color:#475569;font-size:13px;margin:0 0 24px;font-family:Arial,sans-serif;">
      🌐 View all opportunities at:
      <a href="${FRONTEND_URL}" style="color:#1a4a7a;font-weight:700;text-decoration:none;">${FRONTEND_URL}</a>
    </p>

    <!-- Socials + contact -->
    <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;">
      <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 10px;font-family:Arial,sans-serif;">Connect With Us</p>
      <p style="margin:0;font-size:13px;color:#475569;line-height:2.4;font-family:Arial,sans-serif;">
        📸 <a href="https://www.instagram.com/opportunitieskenyalive/" style="color:#1a4a7a;text-decoration:none;">@opportunitieskenyalive</a> on Instagram<br/>
        💬 <a href="https://whatsapp.com/channel/0029Vb7NnTREVccCzjHtYz07" style="color:#1a4a7a;text-decoration:none;">Join our WhatsApp Channel</a><br/>
        📞 <a href="tel:+254108176677" style="color:#1a4a7a;text-decoration:none;">0108 176 677</a>
        &nbsp;&nbsp;✉️ <a href="mailto:lead@opportunitieskenya.live" style="color:#1a4a7a;text-decoration:none;">lead@opportunitieskenya.live</a>
      </p>
    </div>

  </div>`);

export async function sendOTPEmail(email, otp) {
  try {
    const html = wrapEmail(`
      <div style="padding:32px 28px;">
        <h2 style="color:#0f2744;font-size:24px;margin:0 0 12px;font-family:Arial,sans-serif;">Your Verification Code</h2>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;font-family:Arial,sans-serif;">
          Use the 4-digit code below to securely access your data on Opportunities Kenya.
        </p>
        <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:12px; padding:24px; text-align:center; margin-bottom:32px;">
          <h1 style="color:#0f2744;font-size:42px;letter-spacing:0.2em;margin:0;font-family:monospace;">${otp}</h1>
        </div>
        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;font-family:Arial,sans-serif;">
          This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `);

    const data = await resend.emails.send({
      from: 'Opportunities Kenya Security <security@opportunitieskenya.live>',
      to: [email],
      subject: `Your Login Code: ${otp}`,
      html,
    });
    console.log(`[Email] OTP sent to ${email}`, data.id);
  } catch (error) {
    console.error(`[Email Error] Failed to send OTP to ${email}:`, error);
  }
}

export async function sendOrganizationVerificationRequest(request) {
  const adminEmails = ['lead@opportunitieskenya.live', 'opportunitieskenyalive@gmail.com'];
  try {
    const html = wrapEmail(`
      <div style="padding:32px 28px;">
        <h2 style="color:#0f2744;font-size:20px;margin:0 0 12px;">🏢 Organization Verification Request</h2>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          A new request has been received from an organization wishing to post officially on Opportunities Kenya.
        </p>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:24px;">
          <p style="margin:0 0 8px; font-size:14px;"><strong>Contact Person:</strong> ${request.name}</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Organization:</strong> ${request.organization}</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Email:</strong> ${request.email}</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Phone:</strong> ${request.telephone || 'Not provided'}</p>
          <p style="margin:0; font-size:14px;"><strong>Description:</strong> ${request.description || 'No description provided'}</p>
        </div>
        <p style="color:#475569;font-size:14px;">
          Once verified, you can add this email to the verified organizations list in the database to enable official attribution.
        </p>
      </div>
    `);

    for (const email of adminEmails) {
      await sendEmail({
        to: email,
        subject: `[Org Request] ${request.organization}`,
        html: html
      });
    }
    console.log(`Admin notified of Org request from: ${request.organization}`);
  } catch (error) {
    console.error('Error sending org request notification:', error);
  }
}

export async function sendOrganizationRequestAcknowledgement(request) {
  try {
    const html = wrapEmail(`
      <div style="padding:32px 28px;">
        <h2 style="color:#0f2744;font-size:20px;margin:0 0 12px;">Request Received</h2>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Hello ${request.name},
        </p>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Thank you for your interest in posting as an organization on <strong>Opportunities Kenya</strong>. We have received your request for <strong>${request.organization}</strong>.
        </p>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Our team is currently reviewing your details. You will receive a follow-up email shortly with the verification procedure and next steps.
        </p>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Best regards,<br/>
          Opportunities Kenya Team
        </p>
      </div>
    `);

    await sendEmail({
      to: request.email,
      subject: `Verification Request Received: ${request.organization}`,
      html: html
    });
    console.log(`Acknowledgement sent to: ${request.email}`);
  } catch (error) {
    console.error('Error sending org request acknowledgement:', error);
  }
}

export async function sendOrganizationApprovalEmail(request) {
  try {
    const html = wrapEmail(`
      <div style="padding:32px 28px;">
        <h2 style="color:#0f2744;font-size:20px;margin:0 0 12px;">✅ Verification Confirmed</h2>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Hello ${request.name},
        </p>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          Great news! <strong>${request.organization}</strong> is now verified as an official organization on <strong>Opportunities Kenya</strong>.
        </p>
        <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
          From now on, whenever you submit an opportunity using <strong>${request.email}</strong>, it will be automatically attributed to your organization with an <strong>Official Verified Badge</strong>.
        </p>
        <div style="text-align:center; margin-top:30px;">
          ${ctaButton('Start Posting Officially', `${FRONTEND_URL}/post-with-us`)}
        </div>
      </div>
    `);

    await sendEmail({
      to: request.email,
      subject: `Your Organization is Now Verified!`,
      html: html
    });
    console.log(`Approval email sent to: ${request.email}`);
  } catch (error) {
    console.error('Error sending org approval email:', error);
  }
}

// ── ACES Broadcast ────────────────────────────────────────────────────────────

const acesTemplate = (name = 'Engineer') => wrapEmail(`
  <div style="padding:32px 28px;font-family:Arial,sans-serif;">
    
    <div style="background:#e0f2fe;border-left:4px solid #0284c7;border-radius:0 8px 8px 0;padding:18px 20px;margin-bottom:28px;">
      <p style="color:#0369a1;font-size:16px;font-weight:700;margin:0 0 6px;font-family:Arial,sans-serif;">🏗️ Calling all ACES Members!</p>
      <p style="color:#075985;font-size:14px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
        Hello ${name}, as a member of the <strong>Association of Civil Engineering Students (ACES)</strong>, 
        we are calling on you to participate in the project programme for the upcoming <strong>CivExpo 2026</strong>.
      </p>
    </div>

    <p style="color:#1e293b;font-size:15px;line-height:1.8;margin:0 0 12px;font-family:Arial,sans-serif;">
      This is a unique opportunity for students from the <strong>Class of 2021 and above</strong> 
      (including those currently working on their 5th-year projects) to bridge the gap between 
      academic theory and professional industry practice.
    </p>

    <div style="margin-bottom:28px;text-align:center;">
        <img src="${FRONTEND_URL}/images/opportunities/aces_civexpo.jpeg" alt="ACES CivExpo" style="max-width:100%;height:auto;border-radius:12px;" />
    </div>

    <h3 style="color:#0f2744;font-size:17px;margin:0 0 12px;font-family:Arial,sans-serif;">The Three Participation Tracks</h3>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
          <strong style="color:#0f2744;display:block;">🏗️ Industry Skills & Workflow</strong>
          <span style="color:#64748b;font-size:13px;">Master Revit, Civil 3D, and EPANET on real projects.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">
          <strong style="color:#0f2744;display:block;">💻 Tech & Automation</strong>
          <span style="color:#64748b;font-size:13px;">Explore AI, Machine Learning, and Python in Civil Engineering.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <strong style="color:#0f2744;display:block;">🚀 Innovation & Business</strong>
          <span style="color:#64748b;font-size:13px;">Solve community crises and pitch your projects to VCs.</span>
        </td>
      </tr>
    </table>

    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
      We have partnered with <strong>Opportunities Kenya</strong> to ensure your projects get the 
      traction and industry visibility they deserve. Don't let your research gather dust—make it count.
    </p>

    <div style="text-align:center;margin-bottom:32px;">
      ${ctaButton('Sign Up for Participation', 'https://docs.google.com/forms/d/e/1FAIpQLSdg83mA2Sw9gtzUYZxiEkf-N3tg9TpLzVQZsgOqHR3UBkK4aQ/viewform?usp=dialog')}
    </div>

    <p style="color:#64748b;font-size:12px;text-align:center;">
      Association of Civil Engineering Students (ACES - KU)<br/>
      In partnership with Opportunities Kenya
    </p>

  </div>`);

export async function sendAcesEmail(email, name, cc = []) {
  try {
    const subject = '🏗️ ACES: Call for Project Participation – CivExpo 2026';
    await resend.emails.send({
      from: FROM,
      to: email,
      cc: cc,
      reply_to: 'lead@opportunitieskenya.live',
      subject,
      html: acesTemplate(name),
    });
    console.log(`ACES Project email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`ACES Project email failed for ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ── WorldQuant BRAIN Broadcast ───────────────────────────────────────────────

const worldQuantTemplate = (name = 'Member') => wrapEmail(`
  <div style="padding:32px 28px;font-family:Arial,sans-serif;">
    
    <div style="background:#f8fafc;border-left:4px solid #1e293b;border-radius:0 8px 8px 0;padding:18px 20px;margin-bottom:28px;">
      <p style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 6px;font-family:Arial,sans-serif;">🧠 Can you build the best Alpha?</p>
      <p style="color:#334155;font-size:14px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
        Hello ${name}, as an <strong>IEEE Member</strong>, you are already part of the technical elite. 
        We are bringing the <strong>WorldQuant BRAIN IQC 2026</strong> directly to your radar because it 
        demands the exact mathematical and algorithmic rigor you possess.
      </p>
    </div>

    <p style="color:#1e293b;font-size:15px;line-height:1.8;margin:0 0 12px;font-family:Arial,sans-serif;">
      WorldQuant has launched the <strong>International Quant Championship (IQC) 2026</strong>. 
      This is a three-stage, global competition where you translate your predictive models into 
      financial signals (Alphas) using their proprietary simulation platform.
    </p>

    <div style="margin-bottom:28px;text-align:center;">
        <img src="https://images.unsplash.com/photo-1611974714014-48f706d32aa6?auto=format&fit=crop&q=80&w=800" alt="WorldQuant BRAIN" style="max-width:100%;height:auto;border-radius:12px;" />
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;background:#f1f5f9;border-radius:10px;padding:20px;">
      <tr>
        <td style="padding-bottom:12px;font-size:14px;color:#1e293b;font-family:Arial,sans-serif;">🏆 <strong>$100,000</strong> Global Prize Pool</td>
      </tr>
      <tr>
        <td style="padding-bottom:12px;font-size:14px;color:#1e293b;font-family:Arial,sans-serif;">📈 <strong>Quant Fast-Track:</strong> Top performers considered for researcher roles</td>
      </tr>
      <tr>
        <td style="font-size:14px;color:#1e293b;font-family:Arial,sans-serif;">🌍 <strong>Global Stage:</strong> Compete with 100+ countries</td>
      </tr>
    </table>

    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
      This isn't just finance; it's high-level <strong>Data Science</strong> and <strong>Algorithmic Strategy</strong>. 
      We've curated all the competition details, tracks, and requirements on our platform to help you get started.
    </p>

    <div style="text-align:center;margin-bottom:32px;">
      ${ctaButton('View IQC 2026 Details & Apply', 'https://opportunitieskenya.live/opportunity/worldquant-brain-international-quant-championship-iqc-2026')}
    </div>

    <p style="color:#64748b;font-size:13px;text-align:center;">
      Brought to you by <strong>Opportunities Kenya</strong><br/>
      Empowering the next generation of Quants.
    </p>

  </div>`);

export async function sendWorldQuantEmail(email, name, cc = []) {
  try {
    const subject = '🧠 Can you build the best Alpha? WorldQuant BRAIN IQC 2026';
    await resend.emails.send({
      from: FROM,
      to: email,
      cc: cc,
      reply_to: 'lead@opportunitieskenya.live',
      subject,
      html: worldQuantTemplate(name),
    });
    console.log(`WorldQuant email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`WorldQuant email failed for ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ── PowerAfrica Broadcast ───────────────────────────────────────────────

const powerAfricaTemplate = (name = 'Member') => wrapEmail(`
  <div style="padding:32px 28px;font-family:Arial,sans-serif;">
    
    <div style="background:#fefce8;border-left:4px solid #eab308;border-radius:0 8px 8px 0;padding:18px 20px;margin-bottom:28px;">
      <p style="color:#854d0e;font-size:16px;font-weight:700;margin:0 0 6px;font-family:Arial,sans-serif;">⚡ Deadline Approaching: 2026 IEEE PowerAfrica Call for Papers</p>
      <p style="color:#713f12;font-size:14px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
        Hello ${name}, the deadline for paper submissions to the <strong>2026 IEEE PES/IAS PowerAfrica Conference</strong> is fast approaching on <strong>April 5, 2026</strong>.
      </p>
    </div>

    <p style="color:#1e293b;font-size:15px;line-height:1.8;margin:0 0 12px;font-family:Arial,sans-serif;">
      As an IEEE Member, this is a prime opportunity to showcase your research, highlight your capstone projects, and connect with professionals working on solving the energy and power systems challenges across the continent. 
    </p>

    <div style="text-align:center;margin-bottom:32px;margin-top:20px;">
      ${ctaButton('Read Guidelines & Submit Paper', 'https://opportunitieskenya.live/opportunity/2026-ieee-pesias-powerafrica-conference-call-for-papers')}
    </div>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

    <h2 style="color:#0f2744;font-size:18px;margin:0 0 8px;font-family:Arial,sans-serif;">📣 Have Something to Share? Post With Us!</h2>
    <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 16px;font-family:Arial,sans-serif;">
      Did you know you can now directly share your own opportunities with our growing community of thousands of students and change-makers across Kenya?
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="color:#475569;font-size:14px;margin:0 0 8px;">✅ <strong>Project Collaborations:</strong> Looking for a team for your hackathon or research?</p>
      <p style="color:#475569;font-size:14px;margin:0 0 8px;">✅ <strong>Webinars & Workshops:</strong> Hosting an online training session?</p>
      <p style="color:#475569;font-size:14px;margin:0 0 12px;">✅ <strong>Conferences & Events:</strong> Organizing a tech meetup on campus?</p>
      <a href="https://opportunitieskenya.live/post-with-us" style="color:#1a4a7a;font-weight:700;text-decoration:none;">👉 Click here to Post With Us</a>
    </div>

    <p style="color:#64748b;font-size:13px;text-align:center;">
      <strong>Opportunities Kenya</strong><br/>
      Empowering the next generation.
    </p>

  </div>`);

export async function sendPowerAfricaEmail(email, name, cc = []) {
  try {
    const subject = '⚡ Approaching Deadline: IEEE PowerAfrica Call for Papers & Share Your Projects!';
    await resend.emails.send({
      from: FROM,
      to: email,
      cc: cc,
      reply_to: 'lead@opportunitieskenya.live',
      subject,
      html: powerAfricaTemplate(name),
    });
    console.log(`PowerAfrica email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`PowerAfrica email failed for ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

export { seangapoTemplate, yesistTemplate, eepTemplate, acesTemplate, worldQuantTemplate, powerAfricaTemplate };

// Refurbished
