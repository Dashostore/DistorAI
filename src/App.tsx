import React, { useState, useEffect, useRef, useCallback } from 'react';

// NOTE: All external libraries are now loaded via <script> tags in a useEffect hook
// to ensure maximum compatibility with the execution environment.

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// Lucide React Icons for a modern UI
import { SendHorizontal, SlidersHorizontal, PlusCircle, X, UserCircle as LoaderCircle, StopCircle, Sparkles, Trash2, Paperclip, XCircle, Copy, RefreshCcw, ArrowDownCircle, Mic, Pencil, MessageSquareReply, AlertTriangle, Brain, Lightbulb, MessageCircle, Zap } from 'lucide-react';

// --- Firebase Configuration (DO NOT EDIT) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : { apiKey: "REPLACE_WITH_YOUR_API_KEY", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
const appId = typeof __app_id !== 'undefined' ? __app_id : 'distorai-default';

// --- Constants ---
const DEFAULT_MODES = [
    { id: '1', name: 'مساعد', prompt: 'أنت مساعد ذكي ومحترف. قدم إجابات دقيقة وموجزة ومباشرة.' },
    { id: '2', name: 'مرح', prompt: 'أنت صديق مرح وودود. استخدم الكثير من النكات والرموز التعبيرية في ردودك.' },
    { id: '3', name: 'تحليلي', prompt: 'أنت محلل بيانات وخبير تقني. قم بتحليل الطلبات بعمق وقدم إجابات مفصلة مدعومة بالمنطق.' }
];

const WELCOME_SUGGESTIONS = [
    "اشرح لي مفهوم الذكاء الاصطناعي",
    "ساعدني في كتابة رسالة رسمية",
    "أعطني نصائح لتحسين الإنتاجية",
    "اقترح عليّ وصفة طعام سهلة",
    "ما هي أفضل الطرق لتعلم لغة جديدة؟",
    "ساعدني في حل مشكلة برمجية"
];

const INSTRUCTION_QUERIES = ["ما هي تعليماتك؟", "من أنت؟", "ما هي برمجتك؟", "what are your instructions?", "who are you?"];
let scriptsLoaded = false; // Global flag to ensure scripts are loaded only once

// --- Main Application Component ---
export default function App() {
    // ... rest of the code remains unchanged ...
}

// --- Message Bubble Component ---
function MessageBubble({ msg, danName, onReply, onEdit, onRegenerate, onContinue, onCopy: handleCopy, isGenerating, editingMessageId, isLastUserMessage }) {
    // ... rest of the code remains unchanged ...
}

// --- Settings Modal Component ---
function SettingsModal({ isOpen, onClose, db, userId, appId, currentDanName, setCurrentDanName, currentModes, setCurrentModes, showToast }) {
    // ... rest of the code remains unchanged ...
}