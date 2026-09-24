import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { apiRequest, uploadFile } from './api';

const seriesData = [
  { id: '1', title: 'Blank The Series', year: 2024, category: 'โรแมนติก', score: 4.9, ratings: 2380, tone: 'from-[#eec6cf] via-[#f8dde0] to-[#b78391]', label: 'รักที่ค่อย ๆ เติบโต', saved: true },
  { id: '2', title: '23.5 องศาที่โลกเอียง', year: 2024, category: 'วัยเรียน', score: 4.8, ratings: 1944, tone: 'from-[#edbd76] via-[#ffe7bc] to-[#d97d83]', label: 'โคจรมาพบเธอ', saved: false },
  { id: '3', title: 'ใจซ่อนรัก', year: 2024, category: 'ดราม่า', score: 4.7, ratings: 1612, tone: 'from-[#a6bed4] via-[#e9eef1] to-[#7898b8]', label: 'หัวใจยังจดจำ', saved: false },
  { id: '4', title: 'พลูโต', year: 2024, category: 'ลึกลับ', score: 4.8, ratings: 1427, tone: 'from-[#73657c] via-[#cfc1c8] to-[#9a6172]', label: 'ตามหากันในความมืด', saved: true },
  { id: '5', title: 'ทฤษฎีสีชมพู', year: 2022, category: 'คอมเมดี้', score: 4.6, ratings: 4012, tone: 'from-[#d8a8ad] via-[#f4d9cd] to-[#ad6e8e]', label: 'มากกว่าคำว่าปิ๊ง', saved: false },
  { id: '6', title: 'Affair รักเล่นกล', year: 2024, category: 'โรแมนติก', score: 4.7, ratings: 975, tone: 'from-[#b2aa8f] via-[#f3edda] to-[#d19d91]', label: 'วนกลับมาหาเธอ', saved: false },
];

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('roseframe_user') || 'null');
  } catch {
    localStorage.removeItem('roseframe_user');
    return null;
  }
};

const categories = ['ทั้งหมด', 'โรแมนติก', 'ดราม่า', 'วัยเรียน', 'คอมเมดี้', 'ลึกลับ'];

const categoryMap = { ทั้งหมด: null, โรแมนติก: 'romance', ดราม่า: 'drama', วัยเรียน: 'school', คอมเมดี้: 'comedy', ลึกลับ: 'fantasy' };
const tones = ['from-[#eec6cf] via-[#f8dde0] to-[#b78391]', 'from-[#edbd76] via-[#ffe7bc] to-[#d97d83]', 'from-[#a6bed4] via-[#e9eef1] to-[#7898b8]', 'from-[#73657c] via-[#cfc1c8] to-[#9a6172]'];
const toCard = (item, index) => ({ id: item._id, title: item.title, year: item.releaseYear, category: item.categories?.[0] || '', categories: item.categories || [], tags: item.tags || [], actors: item.actors || [], score: item.averageRating || 0, ratings: item.ratingCount || 0, episodeCount: item.episodeCount || 1, tone: tones[index % tones.length], label: item.synopsis || item.originalTitle || '', posterUrl: item.posterUrl, watchUrl: item.watchUrl || '' });

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" />,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14Z" />,
    chevron: <path d="m9 18 6-6-6-6" />,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Stars({ value, onRate }) {
  return <div className="flex gap-0.5" aria-label={`คะแนน ${value} จาก 5`}>
    {[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => onRate?.(star)} className={`star ${star <= Math.round(value) ? 'star-on' : ''}`} aria-label={`ให้ ${star} ดาว`}>★</button>)}
  </div>;
}

function Poster({ item, compact = false }) {
  return <div className={`relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${item.tone} ${compact ? 'aspect-[1/1.25]' : 'aspect-[3/4]'}`}>
    {item.posterUrl && <img src={item.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,.9),transparent_27%),linear-gradient(145deg,transparent_48%,rgba(255,255,255,.32))]" />
    <span className="absolute left-4 top-4 text-[.6rem] font-bold uppercase tracking-[.24em] text-stone-700/70">thai gl · roseframe</span>
    <div className="absolute inset-x-4 bottom-5 text-stone-800">
      <p className="font-display text-2xl leading-none tracking-tight">{item.title}</p>
      <p className="mt-2 text-[.62rem] font-medium uppercase tracking-[.16em] opacity-70">{item.label}</p>
    </div>
  </div>;
}

function AuthModal({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const endpoint = mode === 'login' ? 'login' : 'register';
      const body = mode === 'login' ? { email: form.email, password: form.password } : form;
      const data = await apiRequest(`/users/${endpoint}`, { method: 'POST', body: JSON.stringify(body) });
      localStorage.setItem('roseframe_token', data.token);
      localStorage.setItem('roseframe_user', JSON.stringify(data.user));
      onAuthenticated(data.user);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/40 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl dark:bg-[#272529]"><div className="flex items-start justify-between"><div><p className="eyebrow">Roseframe account</p><h2 className="mt-2 font-display text-3xl">{mode === 'login' ? 'ยินดีต้อนรับกลับมา' : 'สร้างบัญชีของคุณ'}</h2></div><button type="button" onClick={onClose} className="text-xl text-stone-400">×</button></div>{mode === 'register' && <label className="auth-label">ชื่อที่แสดง<input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="auth-input" /></label>}<label className="auth-label">อีเมล<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="auth-input" /></label><label className="auth-label">รหัสผ่าน<input required minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="auth-input" /></label>{error && <p className="mt-3 text-xs text-rose-600">{error}</p>}<button disabled={loading} className="mt-5 w-full rounded-full bg-stone-800 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-rose-300 dark:text-stone-900">{loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button><button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="mt-4 w-full text-sm text-rose-500">{mode === 'login' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}</button></form></div>;
}

function AdminModal({ series, onClose, onChanged }) {
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ title: '', episodeCount: 1, synopsis: '', releaseYear: new Date().getFullYear(), categories: 'drama', extraCategory: '', tags: '', actors: '', posterUrl: '', watchUrl: '' });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const selectSeries = (item) => {
    setSelectedId(item.id);
    setForm({ title: item.title || '', episodeCount: item.episodeCount || 1, synopsis: item.label || '', releaseYear: item.year || new Date().getFullYear(), categories: item.category || 'drama', extraCategory: (item.categories || []).find((category) => category !== item.category) || '', tags: (item.tags || []).join(', '), actors: (item.actors || []).join(', '), posterUrl: item.posterUrl || '', watchUrl: item.watchUrl || '' });
  };
  const save = async (event) => {
    event.preventDefault(); setError('');
    try {
      const categories = [form.categories, form.extraCategory].filter(Boolean);
      const body = { ...form, episodeCount: Number(form.episodeCount), releaseYear: Number(form.releaseYear), categories: [...new Set(categories)], tags: form.tags.split(',').map((value) => value.trim()).filter(Boolean), actors: form.actors.split(',').map((value) => value.trim()).filter(Boolean) };
      delete body.extraCategory;
      await apiRequest(selectedId ? `/series/${selectedId}` : '/series', { method: selectedId ? 'PATCH' : 'POST', body: JSON.stringify(body) });
      await onChanged(); setSelectedId(''); setForm({ title: '', episodeCount: 1, synopsis: '', releaseYear: new Date().getFullYear(), categories: 'drama', extraCategory: '', tags: '', actors: '', posterUrl: '', watchUrl: '' });
    } catch (err) { setError(err.message); }
  };
  const remove = async () => {
    if (!selectedId || !window.confirm('ลบข้อมูลซีรีส์นี้?')) return;
    try { await apiRequest(`/series/${selectedId}`, { method: 'DELETE' }); await onChanged(); setSelectedId(''); } catch (err) { setError(err.message); }
  };
  const readCover = async (event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 4 * 1024 * 1024) return setError('รูปปกต้องมีขนาดไม่เกิน 4 MB'); setUploading(true); setError(''); try { const { url } = await uploadFile(file); setForm((current) => ({ ...current, posterUrl: url })); } catch (err) { setError(err.message); } finally { setUploading(false); } };
  const emptyForm = () => setForm({ title: '', episodeCount: 1, synopsis: '', releaseYear: new Date().getFullYear(), categories: 'drama', extraCategory: '', tags: '', actors: '', posterUrl: '', watchUrl: '' });
  const categoryOptions = ['drama', 'romance', 'comedy', 'school', 'fantasy', 'historical', 'action', 'slice-of-life'];
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 p-4 backdrop-blur-sm"><div className="mx-auto my-8 grid max-w-4xl gap-6 rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#272529] md:grid-cols-[.8fr_1.2fr]"><div><div className="flex items-center justify-between"><h2 className="font-display text-2xl">จัดการซีรีส์</h2><button onClick={onClose} className="text-xl text-stone-400">×</button></div><button type="button" onClick={() => { setSelectedId(''); emptyForm(); }} className="mt-4 w-full rounded-xl bg-rose-500 py-2 text-sm font-semibold text-white">+ เพิ่มซีรีส์</button><div className="mt-4 max-h-96 space-y-1 overflow-y-auto">{series.map((item) => <button key={item.id} type="button" onClick={() => selectSeries(item)} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${selectedId === item.id ? 'bg-rose-100 text-rose-700' : 'hover:bg-stone-100 dark:hover:bg-white/10'}`}>{item.title}</button>)}</div></div><form onSubmit={save}><p className="eyebrow">{selectedId ? 'Edit series' : 'New series'}</p><label className="auth-label">ชื่อซีรีส์<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="auth-input" /></label><div className="grid grid-cols-2 gap-3"><label className="auth-label">จำนวน EP<input required min="1" type="number" value={form.episodeCount} onChange={(e) => setForm({ ...form, episodeCount: e.target.value })} className="auth-input" /></label><label className="auth-label">ปี<input required type="number" value={form.releaseYear} onChange={(e) => setForm({ ...form, releaseYear: e.target.value })} className="auth-input" /></label></div><label className="auth-label">หมวดหลัก<select value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} className="auth-input">{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="auth-label">หมวดเพิ่ม<select value={form.extraCategory} onChange={(e) => setForm({ ...form, extraCategory: e.target.value })} className="auth-input"><option value="">ไม่ระบุ</option>{categoryOptions.filter((category) => category !== form.categories).map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="auth-label">นักแสดง (คั่นด้วย comma)<input value={form.actors} onChange={(e) => setForm({ ...form, actors: e.target.value })} className="auth-input" placeholder="ชื่อคนที่ 1, ชื่อคนที่ 2" /></label><label className="auth-label">แท็ก (คั่นด้วย comma)<input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="auth-input" placeholder="friends-to-lovers, thai-gl" /></label><label className="auth-label">URL รูปปก<input value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} className="auth-input" placeholder="https://..." /></label><label className="auth-label">หรือเลือกไฟล์รูปปก<input accept="image/jpeg,image/png,image/webp,image/gif" type="file" onChange={readCover} className="auth-input" />{uploading && <span className="mt-1 block text-xs text-stone-400">กำลังอัปโหลดไปยัง Vercel Blob...</span>}</label><label className="auth-label">ลิงก์สำหรับดูซีรีส์<input type="url" value={form.watchUrl} onChange={(e) => setForm({ ...form, watchUrl: e.target.value })} className="auth-input" placeholder="https://..." /></label><label className="auth-label">เรื่องย่อ<textarea value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} className="auth-input min-h-24" /></label>{error && <p className="mt-3 text-xs text-rose-600">{error}</p>}<div className="mt-5 flex gap-2"><button disabled={uploading} className="rounded-full bg-stone-800 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-rose-300 dark:text-stone-900">{uploading ? 'กำลังอัปโหลด...' : 'บันทึก'}</button>{selectedId && <button type="button" onClick={remove} className="rounded-full border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600">ลบ</button>}</div></form></div></div>;
}

function SeriesDetailModal({ series, user, onClose, onRequireLogin }) {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const loadComments = () => apiRequest(`/series/${series.id}/comments`).then(setComments).catch((err) => setError(err.message));
  useEffect(() => { loadComments(); }, [series.id]);
  const postComment = async (event) => {
    event.preventDefault();
    if (!user) return onRequireLogin();
    try { await apiRequest(`/series/${series.id}/comments`, { method: 'POST', body: JSON.stringify({ body }) }); setBody(''); loadComments(); } catch (err) { setError(err.message); }
  };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 p-4 backdrop-blur-sm"><div className="mx-auto my-8 max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#272529]"><div className="flex justify-between gap-5"><div><p className="eyebrow">Series details</p><h2 className="mt-2 font-display text-3xl">{series.title}</h2><div className="mt-3 flex flex-wrap gap-2">{[...series.categories, ...series.tags].map((tag) => <span key={tag} className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-600">#{tag}</span>)}</div></div><button onClick={onClose} className="text-xl text-stone-400">×</button></div><p className="mt-5 text-sm leading-6 text-stone-500 dark:text-stone-300">{series.label}</p>{series.watchUrl && <a href={series.watchUrl} target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white">ไปดูซีรีส์ ↗</a>}<div className="mt-8 border-t border-stone-100 pt-6 dark:border-white/10"><h3 className="font-semibold">คอมเมนต์ ({comments.length})</h3><form onSubmit={postComment} className="mt-3 flex gap-2"><input value={body} onChange={(event) => setBody(event.target.value)} required maxLength="1000" className="auth-input mt-0" placeholder="เขียนความคิดเห็น..."/><button className="rounded-full bg-stone-800 px-4 text-sm font-semibold text-white dark:bg-rose-300 dark:text-stone-900">ส่ง</button></form>{error && <p className="mt-3 text-xs text-rose-600">{error}</p>}<div className="mt-5 space-y-4">{comments.map((comment) => <article key={comment._id} className="rounded-2xl bg-stone-50 p-4 text-sm dark:bg-white/5"><p className="font-semibold">{comment.user?.displayName || 'สมาชิก'}</p><p className="mt-1 text-stone-600 dark:text-stone-300">{comment.body}</p></article>)}{comments.length === 0 && <p className="text-sm text-stone-400">ยังไม่มีคอมเมนต์</p>}</div></div></div></div>;
}

function App() {
  const [apiSeries, setApiSeries] = useState(seriesData);
  const [apiError, setApiError] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('roseframe_theme') === 'dark');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(() => new Set(seriesData.filter((item) => item.saved).map((item) => item.id)));
  const [myRatings, setMyRatings] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(readStoredUser);
  const [plans, setPlans] = useState([]);
  const [planTitle, setPlanTitle] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [detailSeries, setDetailSeries] = useState(null);

  useEffect(() => {
    apiRequest('/series').then((data) => {
      const cards = data.map(toCard);
      // Keep the local Thai GL selection on screen until the database has series.
      if (cards.length) setApiSeries(cards);
    }).catch((error) => setApiError(error.message));
  }, []);

  useEffect(() => {
    localStorage.setItem('roseframe_theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#181719' : '#fbf8f6');
  }, [dark]);

  useEffect(() => {
    if (!localStorage.getItem('roseframe_token')) return;
    apiRequest('/users/me').then((currentUser) => {
      localStorage.setItem('roseframe_user', JSON.stringify(currentUser));
      setUser(currentUser);
      setSaved(new Set((currentUser.favorites || []).map(String)));
    }).catch(() => {
      localStorage.removeItem('roseframe_token');
      localStorage.removeItem('roseframe_user');
      setUser(null);
    });
  }, []);

  useEffect(() => {
    if (!user) { setPlans([]); setSelectedPlanId(''); return; }
    apiRequest('/watch-plans').then((data) => {
      setPlans(data);
      setSelectedPlanId((current) => current || data[0]?._id || '');
    }).catch((error) => setApiError(error.message));
  }, [user]);

  const visibleSeries = useMemo(() => apiSeries.filter((item) =>
    (!categoryMap[activeCategory] || (item.categories || [item.category]).includes(categoryMap[activeCategory])) && item.title.toLowerCase().includes(query.toLowerCase())
  ), [activeCategory, apiSeries, query]);
  const savedSeries = useMemo(() => apiSeries.filter((item) => saved.has(String(item.id))), [apiSeries, saved]);
  const rankedSeries = useMemo(() => [...apiSeries].sort((a, b) =>
    b.score - a.score || b.ratings - a.ratings || a.title.localeCompare(b.title)
  ), [apiSeries]);
  const topSeries = rankedSeries.slice(0, 2);

  const toggleSaved = async (id) => {
    if (!user) return setAuthOpen(true);
    try {
      const result = await apiRequest(`/users/me/favorites/${id}`, { method: 'PATCH' });
      setSaved(new Set(result.favorites.map(String)));
      const currentUser = { ...user, favorites: result.favorites };
      localStorage.setItem('roseframe_user', JSON.stringify(currentUser));
      setUser(currentUser);
    } catch (error) { setApiError(error.message); }
  };

  const rateSeries = async (id, stars) => {
    if (!user) return setAuthOpen(true);
    try {
      await apiRequest(`/series/${id}/rating`, { method: 'PUT', body: JSON.stringify({ stars }) });
      setMyRatings((current) => ({ ...current, [id]: stars }));
      const data = await apiRequest('/series');
      setApiSeries(data.map(toCard));
    } catch (error) { setApiError(error.message); }
  };

  const createPlan = async (event) => {
    event.preventDefault();
    if (!user) return setAuthOpen(true);
    if (!planTitle.trim()) return;
    try {
      const plan = await apiRequest('/watch-plans', { method: 'POST', body: JSON.stringify({ title: planTitle }) });
      setPlans((current) => [plan, ...current]); setSelectedPlanId(plan._id); setPlanTitle('');
    } catch (error) { setApiError(error.message); }
  };

  const addToPlan = async (series) => {
    if (!user) return setAuthOpen(true);
    try {
      let planId = selectedPlanId;
      if (!planId) {
        const newPlan = await apiRequest('/watch-plans', { method: 'POST', body: JSON.stringify({ title: 'รายการที่อยากดู' }) });
        planId = newPlan._id;
        setSelectedPlanId(planId);
        setPlans((current) => [newPlan, ...current]);
      }
      const plan = await apiRequest(`/watch-plans/${planId}/items`, { method: 'POST', body: JSON.stringify({ seriesId: series.id, episodeCount: series.episodeCount || 1 }) });
      setPlans((current) => current.map((item) => item._id === plan._id ? plan : item));
      setSelectedPlanId(plan._id);
      document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) { setApiError(error.message); }
  };

  const setWatchedEpisode = async (plan, item, episode, completed) => {
    try {
      const updated = await apiRequest(`/watch-plans/${plan._id}/items/${item._id}/episodes/${episode}`, { method: 'PATCH', body: JSON.stringify({ completed }) });
      setPlans((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (error) { setApiError(error.message); }
  };

  const refreshSeries = async () => {
    const data = await apiRequest('/series');
    setApiSeries(data.map(toCard));
  };

  return <main>
    <div className="min-h-screen bg-[#fbf8f6] text-stone-800 transition-colors duration-300 dark:bg-[#181719] dark:text-stone-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <a href="#top" className="font-display text-2xl tracking-tight">roseframe<span className="text-rose-400">.</span></a>
        <nav className="hidden items-center gap-8 text-sm text-stone-500 md:flex dark:text-stone-400"><a href="#discover" className="text-stone-900 dark:text-white">ค้นพบ</a><a href="#leaderboard">อันดับ</a><a href="#saved">รายการของฉัน</a></nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setDark((current) => !current)} className="icon-button" aria-label="สลับธีม">{dark ? <Icon name="sun" /> : <Icon name="moon" />}</button>
          <div className="relative"><button onClick={() => user ? setProfileOpen(!profileOpen) : setAuthOpen(true)} className="flex items-center gap-2 rounded-full pl-1 pr-1.5 py-1 transition hover:bg-stone-100 dark:hover:bg-white/10" aria-expanded={profileOpen}><span className="grid h-8 w-8 place-items-center rounded-full bg-rose-200 text-xs font-bold text-rose-800">{user?.initials || 'เข้า'}</span><span className="hidden text-sm font-medium sm:block">{user?.displayName || 'เข้าสู่ระบบ'}</span></button>
            {profileOpen && <div className="absolute right-0 z-20 mt-3 w-48 rounded-2xl border border-stone-200 bg-white p-2 shadow-card dark:border-white/10 dark:bg-[#272529]"><p className="px-3 py-2 text-xs text-stone-500">{user?.email}</p>{user?.role === 'admin' && <button onClick={() => { setAdminOpen(true); setProfileOpen(false); }} className="menu-item text-rose-500">จัดการข้อมูลซีรีส์</button>}<button className="menu-item">ซีรี่ที่บันทึกไว้</button><button onClick={() => { localStorage.removeItem('roseframe_token'); localStorage.removeItem('roseframe_user'); setUser(null); setProfileOpen(false); }} className="menu-item text-rose-500">ออกจากระบบ</button></div>}
          </div>
        </div>
      </header>

      {apiError && <div className="mx-auto mb-4 max-w-7xl rounded-xl bg-rose-50 px-5 py-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-200">{apiError}</div>}

      <section id="top" className="mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 lg:px-12 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div><p className="mb-5 text-xs font-bold uppercase tracking-[.25em] text-rose-500">Thai GL series guide</p><h1 className="max-w-xl font-display text-5xl leading-[.96] tracking-tight sm:text-6xl lg:text-7xl">เรื่องราว GL ไทย<br/><em className="font-normal text-rose-400">ที่ทำให้หัวใจ</em> หยุดพัก</h1><p className="mt-6 max-w-md text-sm leading-7 text-stone-500 dark:text-stone-400">รวมซีรี่ GL ไทยที่น่าดูที่สุดสำหรับทุกอารมณ์ เก็บเรื่องโปรด ให้ดาว และค้นพบเรื่องต่อไปของคุณ</p>
            <div className="relative mt-8 max-w-md"><Icon name="search" className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-stone-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-full border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-rose-300 dark:border-white/10 dark:bg-white/5" placeholder="ค้นหาซีรี่ที่อยากดู..."/></div>
          </div>
          <div className="relative mx-auto w-full max-w-md"><div className="absolute -inset-4 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/20"/>{topSeries.length > 0 && <><div className="relative grid grid-cols-2 gap-3"><Poster item={topSeries[0]} /><div className="mt-12">{topSeries[1] && <Poster item={topSeries[1]} />}</div></div><div className="absolute -bottom-4 -left-5 rounded-2xl bg-white px-4 py-3 shadow-card dark:bg-[#29262a]"><p className="text-[.65rem] uppercase tracking-wider text-stone-400">อันดับ 1 จากบอร์ดคะแนน</p><p className="mt-1 font-display text-lg">{topSeries[0].score.toFixed(1)} / 5 <span className="text-amber-400">★</span></p><p className="mt-1 text-[.65rem] text-stone-400">{topSeries[0].ratings.toLocaleString()} คะแนน</p></div></>}</div>
        </div>
      </section>

      <section id="discover" className="border-y border-stone-200/80 bg-white/40 py-12 dark:border-white/10 dark:bg-white/[.02]"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Discover</p><h2 className="section-title">เลือกตามอารมณ์</h2></div><a href="#all-series" className="inline-flex items-center text-sm text-stone-500 hover:text-rose-500">ดูทั้งหมด <Icon name="chevron" className="ml-1 h-4 w-4"/></a></div><div className="mt-7 flex gap-2 overflow-x-auto pb-1">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${activeCategory === category ? 'bg-stone-800 text-white dark:bg-rose-300 dark:text-stone-900' : 'border border-stone-200 bg-white text-stone-500 hover:border-rose-200 dark:border-white/10 dark:bg-transparent dark:text-stone-400'}`}>{category}</button>)}</div>
        <div id="all-series" className="mt-9 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">{visibleSeries.map((item) => <article key={item.id} className="group"><div className="relative"><Poster item={item} compact/><button onClick={() => toggleSaved(item.id)} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${saved.has(item.id) ? 'bg-rose-500 text-white' : 'bg-white/70 text-stone-700 hover:bg-white'}`} aria-label="บันทึกซีรี่"><Icon name="heart" className="h-4 w-4" /></button></div><div className="mt-3"><div className="flex justify-between gap-1"><h3 className="text-sm font-semibold">{item.title}</h3><span className="text-xs text-amber-500">★ {item.score}</span></div><p className="mt-1 text-xs text-stone-400">{item.categories?.join(' · ') || item.category} · {item.year}</p><div className="mt-2 flex flex-wrap gap-1">{item.tags?.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-rose-50 px-2 py-0.5 text-[.6rem] text-rose-500">#{tag}</span>)}</div><div className="mt-2"><Stars value={myRatings[item.id] || 0} onRate={(stars) => rateSeries(item.id, stars)} /></div><div className="mt-3 flex flex-wrap gap-3"><button onClick={() => setDetailSeries(item)} className="text-xs font-semibold text-stone-500 hover:text-rose-700">รายละเอียด / คอมเมนต์</button><button onClick={() => addToPlan(item)} className="text-xs font-semibold text-rose-500 hover:text-rose-700">+ เพิ่มในแผนดู</button></div></div></article>)}</div>{visibleSeries.length === 0 && <p className="py-12 text-center text-sm text-stone-400">ไม่พบซีรี่ที่ค้นหา</p>}</div></section>

      <section id="leaderboard" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12"><div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]"><div><p className="eyebrow">Community picks</p><h2 className="section-title">บอร์ดคะแนน<br/>ประจำสัปดาห์</h2><p className="mt-4 max-w-xs text-sm leading-6 text-stone-500 dark:text-stone-400">เรียงตามคะแนนเฉลี่ยจากฐานข้อมูล และใช้จำนวนผู้ให้คะแนนเป็นตัวตัดสินเมื่อคะแนนเท่ากัน</p><button onClick={() => document.getElementById('all-series')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="mt-7 rounded-full border border-stone-300 px-5 py-2.5 text-sm transition hover:border-rose-300 hover:text-rose-500 dark:border-white/20">ดูอันดับทั้งหมด</button></div><div className="divide-y divide-stone-200 dark:divide-white/10">{rankedSeries.slice(0, 5).map((item, index) => <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0"><span className="w-5 font-display text-xl text-stone-400">{String(index + 1).padStart(2, '0')}</span><div className={`h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${item.tone}`} /> <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs text-stone-400">{item.categories?.join(' · ') || item.category} · {item.ratings.toLocaleString()} คะแนน</p></div><div className="text-right"><p className="text-sm font-semibold"><span className="text-amber-400">★</span> {item.score.toFixed(1)}</p><p className="mt-1 text-[.65rem] uppercase tracking-wider text-stone-400">rating</p></div></div>)}</div></div></section>

      <section id="saved" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12"><div className="rounded-[2rem] bg-stone-800 px-7 py-10 text-white sm:px-10 dark:bg-rose-100 dark:text-stone-900"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-rose-300 dark:text-rose-500">Your collection</p><h2 className="mt-3 font-display text-3xl">บันทึกไว้ดูต่อเมื่อพร้อม</h2><p className="mt-2 text-sm text-stone-300 dark:text-stone-600">ตอนนี้คุณเก็บไว้ {savedSeries.length} เรื่อง</p></div><button type="button" onClick={() => document.getElementById('saved-list')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:bg-rose-100 dark:bg-stone-800 dark:text-white">เปิดรายการของฉัน</button></div><div id="saved-list" className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{savedSeries.map((item) => <article key={item.id} className="rounded-2xl bg-white/10 p-4 dark:bg-stone-800/20"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-stone-300 dark:text-stone-600">{item.year} · {item.categories?.join(' · ') || item.category}</p><button type="button" onClick={() => toggleSaved(item.id)} className="mt-3 text-xs font-semibold text-rose-300 dark:text-rose-500">นำออกจากรายการ</button></article>)}{savedSeries.length === 0 && <p className="text-sm text-stone-300 dark:text-stone-600">ยังไม่มีรายการที่บันทึกไว้ กดไอคอนหัวใจบนซีรีส์เพื่อเพิ่มได้เลย</p>}</div></div></section>
      <section id="plans" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12"><div className="rounded-[2rem] border border-rose-100 bg-white p-7 shadow-card dark:border-white/10 dark:bg-white/[.03] sm:p-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">My watch guide</p><h2 className="section-title">แผนดูซีรีส์ของฉัน</h2><p className="mt-2 text-sm text-stone-500 dark:text-stone-400">สร้างแผน เพิ่มซีรีส์ และติ๊ก EP ที่ดูจบได้ทันที</p></div><form onSubmit={createPlan} className="flex gap-2"><input value={planTitle} onChange={(event) => setPlanTitle(event.target.value)} className="rounded-full border border-stone-200 bg-transparent px-4 py-2 text-sm dark:border-white/10" placeholder="ชื่อแผน เช่น ดูวันหยุด"/><button className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white">สร้างแผน</button></form></div>{plans.length > 0 && <div className="mt-7 flex gap-2 overflow-x-auto">{plans.map((plan) => <button key={plan._id} onClick={() => setSelectedPlanId(plan._id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${selectedPlanId === plan._id ? 'bg-stone-800 text-white dark:bg-rose-300 dark:text-stone-900' : 'border border-stone-200 dark:border-white/10'}`}>{plan.title}</button>)}</div>}{plans.filter((plan) => plan._id === selectedPlanId).map((plan) => <div key={plan._id} className="mt-7 space-y-4">{plan.items.length === 0 && <p className="rounded-xl bg-rose-50 p-4 text-sm text-stone-500 dark:bg-white/5">เลือกซีรีส์ด้านบน แล้วกด “เพิ่มในแผนดู”</p>}{plan.items.map((item) => { const watched = item.completedEpisodes || []; return <article key={item._id} className="rounded-2xl border border-stone-100 p-4 dark:border-white/10"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">{item.series?.title || 'ซีรีส์'}</h3><p className="mt-1 text-xs text-stone-400">ดูแล้ว {watched.length}/{item.episodeCount} ตอน</p></div><span className="text-sm font-semibold text-rose-500">{Math.round((watched.length / item.episodeCount) * 100)}%</span></div><div className="mt-4 flex flex-wrap gap-2">{Array.from({ length: item.episodeCount }, (_, index) => index + 1).map((episode) => <button key={episode} onClick={() => setWatchedEpisode(plan, item, episode, !watched.includes(episode))} className={`episode-check ${watched.includes(episode) ? 'episode-check-done' : ''}`} aria-label={`ตอน ${episode}`}>{watched.includes(episode) ? '✓' : episode}</button>)}</div></article>; })}</div>)}</div></section>
      <footer className="border-t border-stone-200 px-5 py-7 text-center text-xs text-stone-400 dark:border-white/10">roseframe · find the stories that stay with you</footer>
    </div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuthenticated={setUser} />}
      {adminOpen && <AdminModal series={apiSeries} onClose={() => setAdminOpen(false)} onChanged={refreshSeries} />}
      {detailSeries && <SeriesDetailModal series={detailSeries} user={user} onClose={() => setDetailSeries(null)} onRequireLogin={() => { setDetailSeries(null); setAuthOpen(true); }} />}
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
