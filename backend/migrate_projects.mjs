import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:\\Users\\User\\Downloads\\PortableGit\\Learn Opportunities\\backend\\.env' });

const uri = process.env.MONGODB_URI;
async function migrateProjects() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('learn_opportunities');
        console.log('Connected to database.');

        const portfolios = await db.collection('portfolios').find({}).toArray();
        let migratedCount = 0;
        let skippedCount = 0;

        for (const profile of portfolios) {
            if (profile.projects && Array.isArray(profile.projects) && profile.projects.length > 0) {
                for (const project of profile.projects) {
                    // Check if it already exists in the global collection (by title and userEmail)
                    const exists = await db.collection('projects').findOne({
                        title: project.title,
                        userEmail: profile.email
                    });

                    if (!exists) {
                        const newProject = {
                            ...project,
                            userEmail: profile.email,
                            authorName: profile.name,
                            category: project.category || 'Legacy Project',
                            status: project.status || 'Showcase',
                            tags: project.tags || [],
                            resourceLinks: project.resourceLinks || [],
                            createdAt: project.createdAt || new Date().toISOString()
                        };
                        
                        // Convert legacy proofLink to resourceLink if not present in resourceLinks
                        if (project.proofLink && newProject.resourceLinks.length === 0) {
                            newProject.resourceLinks.push({
                                label: 'Original Link',
                                url: project.proofLink
                            });
                        }

                        await db.collection('projects').insertOne(newProject);
                        migratedCount++;
                    } else {
                        skippedCount++;
                    }
                }
            }
        }
        
        console.log(`Migration complete. Migrated ${migratedCount} projects. Skipped ${skippedCount} existing projects.`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.close();
    }
}

migrateProjects();
