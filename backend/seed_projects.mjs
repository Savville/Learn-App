import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        console.log('Connected.');
        
        // Let's insert some mock projects if none exist
        const count = await db.collection('projects').countDocuments();
        if (count === 0) {
            console.log('No projects found. Seeding...');
            const seedProjects = [
                {
                    title: 'Smart Health Monitoring System',
                    description: 'An IoT based health monitoring system that tracks patient vitals in real-time and alerts doctors of any anomalies.',
                    category: 'StudentProject',
                    status: 'Active',
                    tags: ['IoT', 'HealthTech', 'Arduino', 'React'],
                    resourceLinks: [{ label: 'GitHub', url: 'https://github.com' }],
                    bannerImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
                    userEmail: 'ochiwilliamotieno@gmail.com',
                    authorName: 'William Otieno',
                    createdAt: new Date().toISOString()
                },
                {
                    title: 'AI Code Assistant Plugin',
                    description: 'A VS Code plugin that helps developers write better code by providing real-time suggestions and catching potential bugs before they are committed.',
                    category: 'Project',
                    status: 'Showcase',
                    tags: ['AI', 'Developer Tools', 'TypeScript'],
                    resourceLinks: [{ label: 'Demo', url: 'https://youtube.com' }],
                    bannerImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800',
                    userEmail: 'ochiwilliamotieno@gmail.com',
                    authorName: 'William Otieno',
                    createdAt: new Date().toISOString()
                }
            ];
            
            await db.collection('projects').insertMany(seedProjects);
            console.log('Seeded 2 projects.');
            
            // Also ensure they are in the portfolio
            await db.collection('portfolios').updateOne(
                { email: 'ochiwilliamotieno@gmail.com' },
                { $set: { projects: seedProjects } },
                { upsert: true }
            );
        } else {
            console.log(`Found ${count} projects in DB.`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run();
