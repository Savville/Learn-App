import express from 'express';
import { getDB } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware to extract user email from header (simulating auth token for this app's pattern)
const requireUser = (req, res, next) => {
    const email = req.headers['x-user-email'];
    if (!email) return res.status(401).json({ error: 'Unauthorized. Email required in x-user-email header.' });
    req.userEmail = email.trim().toLowerCase();
    next();
};

// ==========================================
// GET /api/public/projects
// Fetch all projects (for the global feed)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const { status, category, tag } = req.query;

        let query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (tag) query.tags = { $in: [tag] };

        const projects = await db.collection('projects')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.json(projects);
    } catch (error) {
        console.error('[PROJECTS] Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// ==========================================
// GET /api/public/projects/:id
// Fetch single project by ID
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        const project = await db.collection('projects').findOne({ id });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        res.json(project);
    } catch (error) {
        console.error('[PROJECTS] Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// ==========================================
// POST /api/public/projects
// Create a new project (Authenticated)
// ==========================================
router.post('/', requireUser, async (req, res) => {
    try {
        const db = getDB();
        const userEmail = req.userEmail;
        
        const { 
            title, description, category, tags, startDate, endDate, 
            status, resourceLinks, bannerImage, authorName 
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const newProject = {
            id: uuidv4(),
            userEmail,
            authorName: authorName || userEmail.split('@')[0],
            title,
            description,
            category: category || 'Other',
            tags: tags || [],
            startDate: startDate || null,
            endDate: endDate || null,
            status: status || 'Showcase', // Showcase, Active, Recruiting, Seeking Funding, Archived
            resourceLinks: resourceLinks || [],
            bannerImage: bannerImage || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.collection('projects').insertOne(newProject);

        res.status(201).json({ message: 'Project created successfully', project: newProject });
    } catch (error) {
        console.error('[PROJECTS] Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// ==========================================
// PUT /api/public/projects/:id
// Update a project (Authenticated)
// ==========================================
router.put('/:id', requireUser, async (req, res) => {
    try {
        const db = getDB();
        const userEmail = req.userEmail;
        const { id } = req.params;

        // Verify ownership
        const existing = await db.collection('projects').findOne({ id });
        if (!existing) return res.status(404).json({ error: 'Project not found' });
        if (existing.userEmail !== userEmail) return res.status(403).json({ error: 'Unauthorized to edit this project' });

        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        // Don't allow changing core identity
        delete updateData._id;
        delete updateData.id;
        delete updateData.userEmail;

        await db.collection('projects').updateOne({ id }, { $set: updateData });

        const updatedProject = await db.collection('projects').findOne({ id });
        res.json({ message: 'Project updated', project: updatedProject });
    } catch (error) {
        console.error('[PROJECTS] Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// ==========================================
// DELETE /api/public/projects/:id
// Delete a project (Authenticated)
// ==========================================
router.delete('/:id', requireUser, async (req, res) => {
    try {
        const db = getDB();
        const userEmail = req.userEmail;
        const { id } = req.params;

        const existing = await db.collection('projects').findOne({ id });
        if (!existing) return res.status(404).json({ error: 'Project not found' });
        if (existing.userEmail !== userEmail) return res.status(403).json({ error: 'Unauthorized to delete this project' });

        await db.collection('projects').deleteOne({ id });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error('[PROJECTS] Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

export default router;
