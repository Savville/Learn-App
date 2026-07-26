const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000/api';

export interface ProfileProject {
    title: string;
    description: string;
    images?: string[];
    proofLink?: string;
    status: 'completed' | 'in-progress';
    createdAt?: string;
}

export interface ProfileLinks {
    github: string;
    linkedin: string;
    website: string;
    other1: string;
    other2: string;
}

export interface Profile {
    _id?: string;
    email: string;
    name: string;
    title?: string;
    bio?: string;
    avatar?: string;
    location?: string;
    skills?: string[];
    rate?: number;
    rating?: number;
    totalClients?: number;
    isFeatured?: boolean;
    interestAreas?: string[];
    links?: ProfileLinks;
    projects?: ProfileProject[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ProfilesResponse {
    data: Profile[];
    total: number;
    page: number;
    pages: number;
}

export interface TrendingResponse {
    data: Profile[];
}

export interface AISearchResponse {
    data: Profile[];
    query: string;
    parsed?: any;
}

/** List all public profiles (paginated) */
export async function listProfiles(page = 1, limit = 24, search = ''): Promise<ProfilesResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/profiles?${params}`);
    if (!res.ok) throw new Error('Failed to fetch profiles');
    return res.json();
}

/** Get trending/featured profiles */
export async function getTrendingProfiles(): Promise<TrendingResponse> {
    const res = await fetch(`${API_BASE}/profiles/trending`);
    if (!res.ok) throw new Error('Failed to fetch trending profiles');
    return res.json();
}

/** Get single profile by email */
export async function getProfileByEmail(email: string): Promise<{ success: boolean; profile: Profile }> {
    const res = await fetch(`${API_BASE}/profiles/${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}

/** AI-powered natural language search */
export async function aiSearchProfiles(query: string, currentEmail?: string): Promise<AISearchResponse> {
    const res = await fetch(`${API_BASE}/profiles/search/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, currentEmail }),
    });
    if (!res.ok) throw new Error('AI search failed');
    return res.json();
}

/** Toggle featured status on own profile */
export async function toggleFeatured(email: string): Promise<{ success: boolean; isFeatured: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/profiles/${encodeURIComponent(email)}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to toggle featured');
    return res.json();
}

/** Add project to authenticated user's profile */
export async function addProject(
    email: string,
    project: Omit<ProfileProject, 'createdAt'>
): Promise<{ success: boolean; projectId: string }> {
    const res = await fetch(`${API_BASE}/profiles/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...project, email }),
    });
    if (!res.ok) throw new Error('Failed to add project');
    return res.json();
}

/** Remove project from authenticated user's profile */
export async function deleteProject(email: string, projectId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/profiles/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return res.json();
}

/** Seed fake profiles (dev/test only) */
export async function seedFakeProfiles(): Promise<{ message: string; count: number }> {
    const res = await fetch(`${API_BASE}/profiles/seed-fake`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed fake profiles');
    return res.json();
}