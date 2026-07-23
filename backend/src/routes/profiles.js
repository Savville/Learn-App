import express from 'express';
import { getDB } from '../config/database.js';
import { verifyUserToken } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// Profile Seed — 10 Kenyan Fake Profiles
// ==========================================
const FAKE_PROFILES = [
    {
        email: 'amina.wanjiku@fakeprofile.ke',
        name: 'Amina Wanjiku',
        title: 'Data Scientist',
        bio: 'Passionate data scientist with expertise in machine learning and statistical analysis. I build predictive models that help organizations make data-driven decisions.',
        location: 'Nairobi, Kenya',
        skills: ['Python', 'Machine Learning', 'R', 'SQL', 'TensorFlow', 'Pandas'],
        rate: 75,
        rating: 4.9,
        totalClients: 32,
        interestAreas: ['Data Science', 'Machine Learning', 'Healthcare'],
        avatar: 'https://i.pravatar.cc/150?img=1',
        links: { github: '', linkedin: 'https://linkedin.com/in/amina-wanjiku', website: '', other1: '', other2: '' },
        projects: [
            {
                title: 'Disease Prediction Model',
                description: 'Built an ML model predicting disease outbreaks using historical health data with 94% accuracy.',
                images: [],
                proofLink: 'https://github.com/amina/disease-prediction',
                status: 'completed',
                createdAt: new Date('2026-03-15')
            }
        ],
        isFeatured: true
    },
    {
        email: 'brian.odhiambo@fakeprofile.ke',
        name: 'Brian Odhiambo',
        title: 'Full-Stack Developer',
        bio: 'Full-stack developer specializing in React, Node.js, and cloud architecture. I build scalable web applications from concept to deployment.',
        location: 'Mombasa, Kenya',
        skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript', 'GraphQL'],
        rate: 85,
        rating: 4.8,
        totalClients: 45,
        interestAreas: ['Web Development', 'Cloud Computing', 'FinTech'],
        avatar: 'https://i.pravatar.cc/150?img=3',
        links: { github: 'https://github.com/brianodhiambo', linkedin: 'https://linkedin.com/in/brian-odhiambo', website: '', other1: '', other2: '' },
        projects: [
            {
                title: 'M-PESA Integration Dashboard',
                description: 'Real-time dashboard for tracking M-PESA transactions across multiple businesses.',
                images: [],
                proofLink: 'https://github.com/brian/mpesa-dashboard',
                status: 'completed',
                createdAt: new Date('2026-04-20')
            }
        ],
        isFeatured: true
    },
    {
        email: 'charity.mutunga@fakeprofile.ke',
        name: 'Charity Mutunga',
        title: 'UX/UI Designer',
        bio: 'Creative UX/UI designer focused on creating intuitive digital experiences. I specialize in user research, wireframing, and prototyping for African markets.',
        location: 'Nairobi, Kenya',
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Adobe XD', 'HTML/CSS'],
        rate: 65,
        rating: 4.9,
        totalClients: 50,
        interestAreas: ['Design', 'Education', 'Accessibility'],
        avatar: 'https://i.pravatar.cc/150?img=5',
        links: { github: '', linkedin: 'https://linkedin.com/in/charity-mutunga', website: 'https://charitydesigns.ke', other1: 'https://dribbble.com/charitym', other2: '' },
        projects: [
            {
                title: 'E-Learning Platform Redesign',
                description: 'Complete UX overhaul of an e-learning platform serving 50K+ students across East Africa.',
                images: [],
                proofLink: 'https://www.behance.net/charity/elearning',
                status: 'completed',
                createdAt: new Date('2026-02-10')
            }
        ],
        isFeatured: true
    },
    {
        email: 'dennis.karanja@fakeprofile.ke',
        name: 'Dennis Karanja',
        title: 'DevOps Engineer',
        bio: 'DevOps engineer with 6+ years automating infrastructure and CI/CD pipelines. I help teams ship faster and more reliably.',
        location: 'Kiambu, Kenya',
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Linux'],
        rate: 90,
        rating: 4.7,
        totalClients: 28,
        interestAreas: ['Infrastructure', 'Cloud', 'Security'],
        avatar: 'https://i.pravatar.cc/150?img=11',
        links: { github: 'https://github.com/denniskaranja', linkedin: 'https://linkedin.com/in/dennis-karanja', website: '', other1: '', other2: '' },
        isFeatured: false
    },
    {
        email: 'elizabeth.achien@fakeprofile.ke',
        name: 'Elizabeth Achieng',
        title: 'Mobile Developer',
        bio: 'Mobile developer crafting beautiful iOS and Android apps with Flutter. I love building apps that solve real African problems.',
        location: 'Kisumu, Kenya',
        skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'Swift', 'Kotlin'],
        rate: 70,
        rating: 4.8,
        totalClients: 22,
        interestAreas: ['Mobile Apps', 'Healthcare', 'Agriculture'],
        avatar: 'https://i.pravatar.cc/150?img=9',
        links: { github: 'https://github.com/elizabethachien', linkedin: 'https://linkedin.com/in/elizabeth-achieng', website: '', other1: '', other2: '' },
        projects: [
            {
                title: 'FarmWatch Mobile App',
                description: 'Mobile app helping smallholder farmers track weather, crop prices, and market demand.',
                images: [],
                proofLink: 'https://play.google.com/store/apps/details?id=com.farmwatch',
                status: 'completed',
                createdAt: new Date('2026-05-01')
            }
        ],
        isFeatured: true
    },
    {
        email: 'farah.hassan@fakeprofile.ke',
        name: 'Farah Hassan',
        title: 'Content Strategist',
        bio: 'Content strategist and SEO specialist helping brands tell their story. I create content frameworks that drive engagement and organic growth.',
        location: 'Nairobi, Kenya',
        skills: ['SEO', 'Copywriting', 'Analytics', 'Content Strategy', 'Google Analytics', 'WordPress'],
        rate: 55,
        rating: 4.6,
        totalClients: 40,
        interestAreas: ['Marketing', 'Education', 'Media'],
        avatar: 'https://i.pravatar.cc/150?img=16',
        links: { github: '', linkedin: 'https://linkedin.com/in/farah-hassan', website: 'https://farahhassan.ke', other1: '', other2: '' },
        isFeatured: false
    },
    {
        email: 'geoffrey.mwangi@fakeprofile.ke',
        name: 'Geoffrey Mwangi',
        title: 'Machine Learning Engineer',
        bio: 'ML engineer working on NLP and computer vision solutions for African languages and contexts. Published researcher turned industry practitioner.',
        location: 'Nairobi, Kenya',
        skills: ['TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Python', 'MLOps'],
        rate: 95,
        rating: 4.9,
        totalClients: 18,
        interestAreas: ['AI', 'Research', 'African Languages'],
        avatar: 'https://i.pravatar.cc/150?img=12',
        links: { github: 'https://github.com/geoffrey-mwangi', linkedin: 'https://linkedin.com/in/geoffrey-mwangi', website: 'https://geoffreyml.ke', other1: '', other2: '' },
        projects: [
            {
                title: 'Swahili NLP Pipeline',
                description: 'Open-source NLP pipeline for Swahili language processing including tokenization, POS tagging, and sentiment analysis.',
                images: [],
                proofLink: 'https://github.com/geoffrey-mwangi/swahili-nlp',
                status: 'completed',
                createdAt: new Date('2026-01-20')
            }
        ],
        isFeatured: true
    },
    {
        email: 'hannah.nyambura@fakeprofile.ke',
        name: 'Hannah Nyambura',
        title: 'Graphic Designer',
        bio: 'Brand designer specializing in visual identity, illustration, and print design. I help startups and NGOs communicate through compelling visuals.',
        location: 'Nakuru, Kenya',
        skills: ['Adobe Suite', 'Branding', 'Illustration', 'Typography', 'Figma', 'Print Design'],
        rate: 50,
        rating: 4.7,
        totalClients: 60,
        interestAreas: ['Design', 'Branding', 'Social Impact'],
        avatar: 'https://i.pravatar.cc/150?img=20',
        links: { github: '', linkedin: 'https://linkedin.com/in/hannah-nyambura', website: 'https://hannahdesigns.ke', other1: 'https://behance.net/hannahnyambura', other2: '' },
        isFeatured: false
    },
    {
        email: 'isaac.omondi@fakeprofile.ke',
        name: 'Isaac Omondi',
        title: 'Backend Developer',
        bio: 'Backend developer passionate about API design, database optimization, and system architecture. Python and Go enthusiast.',
        location: 'Mombasa, Kenya',
        skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Go', 'API Design'],
        rate: 80,
        rating: 4.8,
        totalClients: 35,
        interestAreas: ['Backend', 'Database', 'Performance'],
        avatar: 'https://i.pravatar.cc/150?img=14',
        links: { github: 'https://github.com/isaacomondi', linkedin: 'https://linkedin.com/in/isaac-omondi', website: '', other1: '', other2: '' },
        projects: [
            {
                title: 'High-Performance REST API Framework',
                description: 'Custom-built API framework optimized for handling 10K+ concurrent requests on limited infrastructure.',
                images: [],
                proofLink: 'https://github.com/isaacomondi/api-framework',
                status: 'completed',
                createdAt: new Date('2026-06-01')
            }
        ],
        isFeatured: true
    },
    {
        email: 'joyce.wambui@fakeprofile.ke',
        name: 'Joyce Wambui',
        title: 'Project Manager',
        bio: 'Certified PMP and Scrum Master with experience leading cross-functional teams on complex tech projects. I deliver results on time and within budget.',
        location: 'Nairobi, Kenya',
        skills: ['Agile', 'Scrum', 'Jira', 'Stakeholder Management', 'Risk Management', 'Budgeting'],
        rate: 70,
        rating: 4.6,
        totalClients: 42,
        interestAreas: ['Project Management', 'Team Leadership', 'EdTech'],
        avatar: 'https://i.pravatar.cc/150?img=24',
        links: { github: '', linkedin: 'https://linkedin.com/in/joyce-wambui', website: '', other1: '', other2: '' },
        isFeatured: false
    }
];

// ==========================================
// POST /api/profiles/seed-fake
// Seed fake profiles (for development/testing)
// ==========================================
router.post('/profiles/seed-fake', async (req, res) => {
    try {
        const db = await getDB();

        // Clear existing fake profiles
        await db.collection('portfolios').deleteMany({
            email: { $regex: '@fakeprofile\\.ke$' }
        });

        // Insert fake profiles
        const result = await db.collection('portfolios').insertMany(FAKE_PROFILES);

        console.log(`[PROFILES] Seeded ${Object.keys(result.insertedIds).length} fake profiles`);

        res.json({
            message: `Seeded ${Object.keys(result.insertedIds).length} fake profiles`,
            count: Object.keys(result.insertedIds).length
        });
    } catch (error) {
        console.error('[PROFILES] Seed error:', error);
        res.status(500).json({ error: 'Failed to seed fake profiles', details: error.message });
    }
});

// ==========================================
// GET /api/profiles
// List all public profiles (paginated)
// ==========================================
router.get('/profiles', async (req, res) => {
    try {
        const db = await getDB();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 24;
        const skip = (page - 1) * limit;

        // Optional search filter
        const searchQuery = req.query.search || '';

        let query = {};
        if (searchQuery) {
            query = {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { bio: { $regex: searchQuery, $options: 'i' } },
                    { skills: { $regex: searchQuery, $options: 'i' } },
                    { location: { $regex: searchQuery, $options: 'i' } }
                ]
            };
        }

        const [profiles, total] = await Promise.all([
            db.collection('portfolios')
                .find(query)
                .sort({ isFeatured: -1, rating: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            db.collection('portfolios').countDocuments(query)
        ]);

        res.json({
            data: profiles,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('[PROFILES] List error:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

// ==========================================
// GET /api/profiles/trending
// Get trending/featured profiles
// ==========================================
router.get('/profiles/trending', async (req, res) => {
    try {
        const db = await getDB();

        const profiles = await db.collection('portfolios')
            .find({})
            .sort({ isFeatured: -1, rating: -1, totalClients: -1 })
            .limit(12)
            .toArray();

        res.json({ data: profiles });
    } catch (error) {
        console.error('[PROFILES] Trending error:', error);
        res.status(500).json({ error: 'Failed to fetch trending profiles' });
    }
});

// ==========================================
// GET /api/profiles/:email
// Get single public profile by email
// ==========================================
router.get('/profiles/:email', async (req, res) => {
    try {
        const db = await getDB();
        const email = req.params.email.toLowerCase();

        const profile = await db.collection('portfolios').findOne({ email });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Remove internal fields from response
        const { _id, __v, ...publicProfile } = profile;
        res.json({ success: true, profile: publicProfile });
    } catch (error) {
        console.error('[PROFILES] Get error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// ==========================================
// POST /api/profiles/search/ai
// AI-powered natural language search via Agnes
// ==========================================
router.post('/profiles/search/ai', async (req, res) => {
    try {
        const { query, currentEmail } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const db = await getDB();

        // Use Agnes AI to parse search intent and extract filters
        let parsedIntent = null;
        try {
            if (process.env.OPENAI_API_KEY) {
                const openai = (await import('openai')).default || (await import('openai'));
                const Client = openai.OpenAI || openai;
                const client = new Client({
                    apiKey: process.env.OPENAI_API_KEY,
                    baseURL: process.env.OPENAI_BASE_URL || 'https://apihub.agnes-ai.com/v1'
                });

                const response = await client.chat.completions.create({
                    model: 'agnes-2.0-flash',
                    messages: [{
                        role: 'user',
                        content: `Parse this profile search query into structured filters. Return ONLY valid JSON:
{
  "skills": ["skill1", "skill2"],
  "title_keywords": ["keyword1"],
  "location": "city or country",
  "interest_areas": ["area1"],
  "minRating": 0
}

Query: "${query}"`
                    }],
                    response_format: { type: 'json_object' },
                    temperature: 0.3
                });

                const cleaned = response.choices[0]?.message?.content?.replace(/```[\s\S]*?```/g, '').trim() || '{}';
                parsedIntent = JSON.parse(cleaned);
            }
        } catch (aiError) {
            console.warn('[PROFILES] AI parsing failed, falling back to basic search:', aiError.message);
        }

        // Build MongoDB query from parsed intent
        let queryFilter = {};

        if (parsedIntent) {
            if (parsedIntent.skills && parsedIntent.skills.length > 0) {
                queryFilter.skills = { $in: parsedIntent.skills };
            }
            if (parsedIntent.title_keywords && parsedIntent.title_keywords.length > 0) {
                const titleRegex = parsedIntent.title_keywords.join('|');
                queryFilter.$or = [
                    ...(queryFilter.$or || []),
                    { title: { $regex: titleRegex, $options: 'i' } }
                ];
            }
            if (parsedIntent.location) {
                queryFilter.location = { $regex: parsedIntent.location, $options: 'i' };
            }
            if (parsedIntent.minRating) {
                queryFilter.rating = { $gte: parsedIntent.minRating };
            }
        }

        // Fallback: if no structured query built, do a general text search
        if (Object.keys(queryFilter).length === 0 && !queryFilter.$or) {
            queryFilter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { title: { $regex: query, $options: 'i' } },
                    { bio: { $regex: query, $options: 'i' } },
                    { skills: { $regex: query, $options: 'i' } },
                    { location: { $regex: query, $options: 'i' } },
                    { interestAreas: { $regex: query, $options: 'i' } }
                ]
            };
        }

        const profiles = await db.collection('portfolios')
            .find(queryFilter)
            .sort({ isFeatured: -1, rating: -1 })
            .limit(20)
            .toArray();

        res.json({
            data: profiles,
            query,
            parsed: parsedIntent
        });
    } catch (error) {
        console.error('[PROFILES] AI Search error:', error);
        res.status(500).json({ error: 'AI search failed' });
    }
});

// ==========================================
// PUT /api/profiles/:email/featured
// Toggle featured status (authenticated, own profile only)
// ==========================================
router.put('/profiles/:email/featured', verifyUserToken, async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();
        const userEmail = req.user.email;

        if (email !== userEmail) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        const db = await getDB();
        const profile = await db.collection('portfolios').findOne({ email });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const newFeatured = !profile.isFeatured;

        await db.collection('portfolios').updateOne(
            { email },
            { $set: { isFeatured: newFeatured, updatedAt: new Date() } }
        );

        res.json({
            success: true,
            isFeatured: newFeatured,
            message: newFeatured ? 'Profile marked as featured!' : 'Profile unmarked from featured.'
        });
    } catch (error) {
        console.error('[PROFILES] Featured toggle error:', error);
        res.status(500).json({ error: 'Failed to update featured status' });
    }
});

// ==========================================
// POST /api/profiles/projects
// Add project to authenticated user's profile
// ==========================================
router.post('/profiles/projects', verifyUserToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { title, description, images = [], proofLink, status = 'in-progress' } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const db = await getDB();

        const project = {
            title,
            description,
            images,
            proofLink: proofLink || '',
            status,
            createdAt: new Date()
        };

        const result = await db.collection('portfolios').updateOne(
            { email: userEmail },
            {
                $push: { projects: project },
                $setOnInsert: {
                    email: userEmail,
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        res.json({ success: true, projectId: result.upsertedId || 'existing' });
    } catch (error) {
        console.error('[PROFILES] Add project error:', error);
        res.status(500).json({ error: 'Failed to add project' });
    }
});

// ==========================================
// DELETE /api/profiles/projects/:projectId
// Remove project from authenticated user's profile
// ==========================================
router.delete('/profiles/projects/:projectId', verifyUserToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const projectId = req.params.projectId;

        const db = await getDB();

        // Use array index-based removal since we don't have ObjectId for fake project IDs
        // For real projects, we'd use the actual _id
        await db.collection('portfolios').updateOne(
            { email: userEmail },
            { $pull: { projects: { _id: new (await import('mongodb')).ObjectId(projectId) } } }
        );

        res.json({ success: true, message: 'Project removed' });
    } catch (error) {
        console.error('[PROFILES] Delete project error:', error);
        res.status(500).json({ error: 'Failed to remove project' });
    }
});

export default router;