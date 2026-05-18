const PptxGenJS = require('pptxgenjs');

// 1. Initialize Presentation
let pres = new PptxGenJS();

// 2. Set presentation properties
pres.author = 'L-earn Opportunities';
pres.company = 'L-earn Opportunities';
pres.revision = '1';
pres.subject = 'Traction & Growth Deck';
pres.title = 'L-earn Opportunities - Success & Scaling';

// Set layout to Widescreen (16:9)
pres.layout = 'LAYOUT_16x9'; 

// Brand Colors (assuming typical modern brand colors based on current trends)
const COLORS = {
    primary: '2563EB',    // Deep Blue
    secondary: 'F97316',  // Orange Accent
    text: '1F2937',       // Dark Gray
    white: 'FFFFFF',      // White Background
    lightGray: 'F3F4F6'   // Compartment Backgrounds
};

// ==============================================
// SLIDE 1: TRACTION, MARKET & CREDIBILITY
// ==============================================
let slide1 = pres.addSlide();
slide1.background = { color: COLORS.white };

// Header
slide1.addText('L-EARN OPPORTUNITIES: TRACTION & CREDIBILITY', {
    x: 0.5, y: 0.3, w: '90%', h: 0.8,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial'
});
slide1.addShape(pres.ShapeType.line, { x: 0.5, y: 1.1, w: 9.0, h: 0, line: { color: COLORS.secondary, width: 3 } });

// Compartment 1: Success & Live Metrics
slide1.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.4, w: 4.2, h: 2.2, fill: { color: COLORS.lightGray } });
slide1.addText('HUGE TRACTION & LIVE PLATFORM', {
    x: 0.6, y: 1.5, w: 4.0, h: 0.4, fontSize: 14, bold: true, color: COLORS.primary
});
slide1.addText([
    { text: '• Explosive Subscriber Growth ', options: { bold: true } },
    { text: 'capturing early demand.\n' },
    { text: '• Fully Live & Functional ', options: { bold: true } },
    { text: 'for exactly 1 month.\n' },
    { text: '• 4 Exclusive Jobs Listed', options: { bold: true } },
    { text: ' driving immediate value.' }
], { x: 0.6, y: 2.0, w: 4.0, h: 1.5, fontSize: 12, color: COLORS.text, bullet: false });

// Compartment 2: Corporate Recognition
slide1.addShape(pres.ShapeType.rect, { x: 5.0, y: 1.4, w: 4.2, h: 2.2, fill: { color: COLORS.lightGray } });
slide1.addText('LEGAL & BUSINESS STANDING', {
    x: 5.1, y: 1.5, w: 4.0, h: 0.4, fontSize: 14, bold: true, color: COLORS.primary
});
slide1.addText([
    { text: 'Fully Registered Business\n', options: { bold: true, fontSize: 16 } },
    { text: 'We are officially incorporated and recognized by the ' },
    { text: 'Registrar of Companies', options: { bold: true, color: COLORS.secondary } },
    { text: ', granting us operating leverage and trust with corporate partners.' }
], { x: 5.1, y: 2.0, w: 4.0, h: 1.5, fontSize: 12, color: COLORS.text });

// Compartment 3: The Market "Hungry System"
slide1.addShape(pres.ShapeType.rect, { x: 0.5, y: 3.8, w: 8.7, h: 1.5, fill: { color: COLORS.primary } });
slide1.addText('JUMPING ONTO A HUNGRY SYSTEM', {
    x: 0.6, y: 3.9, w: 8.5, h: 0.4, fontSize: 18, bold: true, color: COLORS.white, align: 'center'
});
slide1.addText(
    "The youth unemployment gap represents a massive, underserved, and 'hungry' ecosystem. Our rapid adoption proves that job seekers and providers are desperate for a streamlined, trustworthy matching solution. The market was waiting for us.",
    { x: 0.6, y: 4.3, w: 8.5, h: 0.9, fontSize: 12, color: COLORS.white, align: 'center' }
);


// ==============================================
// SLIDE 2: TECH, REVENUE & RESEARCH NUMBERS
// ==============================================
let slide2 = pres.addSlide();
slide2.background = { color: COLORS.white };

// Header
slide2.addText('TECHNOLOGY, MONETIZATION & RESEARCH', {
    x: 0.5, y: 0.3, w: '90%', h: 0.8,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial'
});
slide2.addShape(pres.ShapeType.line, { x: 0.5, y: 1.1, w: 9.0, h: 0, line: { color: COLORS.secondary, width: 3 } });

// Compartment 1: How The Technology Works
slide2.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.4, w: 4.2, h: 3.8, fill: { color: COLORS.lightGray } });
slide2.addText('HOW OUR TECHNOLOGY WORKS', {
    x: 0.6, y: 1.5, w: 4.0, h: 0.4, fontSize: 14, bold: true, color: COLORS.primary
});
slide2.addText([
    { text: 'Smart Categorization:\n', options: { bold: true, color: COLORS.secondary } },
    { text: 'Our platform automatically tags and filters gigs, internships, and jobs for relevant skill matching.\n\n' },
    { text: 'Automated Communication:\n', options: { bold: true, color: COLORS.secondary } },
    { text: 'Integrated inbox, automated email digests, and real-time dashboard updates keep the system alive.\n\n' },
    { text: 'Scalable Architecture:\n', options: { bold: true, color: COLORS.secondary } },
    { text: 'Built on React, Node.js, and a highly concurrent backend capable of holding massive scale.' }
], { x: 0.6, y: 2.0, w: 4.0, h: 3.0, fontSize: 11, color: COLORS.text });

// Compartment 2: Revenue Model
slide2.addShape(pres.ShapeType.rect, { x: 5.0, y: 1.4, w: 4.2, h: 1.8, fill: { color: COLORS.lightGray } });
slide2.addText('REVENUE & MONETIZATION', {
    x: 5.1, y: 1.5, w: 4.0, h: 0.4, fontSize: 14, bold: true, color: COLORS.primary
});
slide2.addText([
    { text: '• B2B Job Postings: ', options: { bold: true } },
    { text: 'Fees for corporate features.\n' },
    { text: '• Premium Subscriptions: ', options: { bold: true } },
    { text: 'Advanced access for users.\n' },
    { text: '• Partner Integrations: ', options: { bold: true } },
    { text: 'Value adds like assessments.' }
], { x: 5.1, y: 1.9, w: 4.0, h: 1.2, fontSize: 11, color: COLORS.text });

// Compartment 3: Research on Numbers
slide2.addShape(pres.ShapeType.rect, { x: 5.0, y: 3.4, w: 4.2, h: 1.8, fill: { color: COLORS.lightGray } });
slide2.addText('MARKET RESEARCH', {
    x: 5.1, y: 3.5, w: 4.0, h: 0.4, fontSize: 14, bold: true, color: COLORS.primary
});
slide2.addText([
    { text: '• 70%+ of graduates', options: { bold: true } },
    { text: ' struggle to find right-fit roles in 6 months.\n' },
    { text: '• $5B+ lost annually', options: { bold: true } },
    { text: ' in unoptimized hiring pipelines.\n' },
    { text: '• Engagement Rates: ', options: { bold: true } },
    { text: 'Our beta shows an 80% open rate indicating immense demand.' }
], { x: 5.1, y: 3.9, w: 4.0, h: 1.2, fontSize: 11, color: COLORS.text });


// 4. Save the Presentation
pres.writeFile({ fileName: 'L-earn_Opportunities_Pitch.pptx' })
    .then(fileName => {
        console.log(`Presentation created successfully: ${fileName}`);
    })
    .catch(err => {
        console.error('Error creating presentation:', err);
    });