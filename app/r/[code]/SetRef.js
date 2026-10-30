'use client';
import { useEffect } from 'react';
export default function SetRef({ code }) { useEffect(() => { try { localStorage.setItem('sa_ref', code); } catch {} }, [code]); return null; }
