import { getDB } from '../config/database.js';

/**
 * auditLog — Append-only admin action audit trail.
 * Never fails the main request if logging fails.
 * 
 * @param {object} req - Express request object (reads req.admin, req.ip)
 * @param {string} action - Action identifier e.g. 'approve_opportunity'
 * @param {object} details - Optional context: targetId, changes, etc.
 */
export async function auditLog(req, action, details = {}) {
    try {
        const db = await getDB();
        const logEntry = {
            action,
            actor: req.admin?.adminKey || req.admin?.email || 'unknown',
            ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            target: details.targetId || null,
            changes: details.changes || {},
            timestamp: new Date(),
            _appendOnly: true
        };
        await db.collection('audit_logs').insertOne(logEntry);
    } catch (err) {
        // Silent failure — never break the main flow
        console.error('Audit log write failed:', err.message);
    }
}