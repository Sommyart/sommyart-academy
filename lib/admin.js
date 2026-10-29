import { cookies } from 'next/headers';
import crypto from 'crypto';
const token = () => crypto.createHash('sha256').update('sommy:' + (process.env.ADMIN_PASSWORD || '')).digest('hex');
export const ADMIN_KEY = () => process.env.ADMIN_KEY;
export function isAdmin() { return !!process.env.ADMIN_PASSWORD && cookies().get('sa_admin')?.value === token(); }
export function checkPassword(p) { return !!process.env.ADMIN_PASSWORD && p === process.env.ADMIN_PASSWORD; }
export const adminToken = token;
