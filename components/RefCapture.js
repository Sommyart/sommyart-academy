'use client';
import { useEffect } from 'react';
export default function RefCapture() { useEffect(() => { try { const r = new URLSearchParams(location.search).get('ref'); if (r) localStorage.setItem('sa_ref', r.toUpperCase().slice(0, 20)); } catch {} }, []); return null; }
