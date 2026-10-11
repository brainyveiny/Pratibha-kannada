'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  BarChart2,
  Users,
  FileText,
  Check,
  FileEdit,
  X,
  Layers,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  ShieldCheck,
  Upload,
  RefreshCw,
  Search,
} from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  title_kn: string | null;
  description: string | null;
  resource_type: string;
  file_url: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
  topics?: {
    name?: string;
    categories?: {
      name?: string;
      slug?: string;
      subjects?: {
        classes?: {
          name?: string;
          slug?: string;
        };
      };
    };
  };
}

interface ClassItem {
  id: string;
  name: string;
  slug: string;
}

interface AdminContentManagerProps {
  initialUsers: any[];
  initialStats: any;
}

export default function AdminContentManager({
  initialUsers,
  initialStats,
}: AdminContentManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'users'>('content');

  // Content state
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Stats state
  const [contentStats, setContentStats] = useState({ total: 0, published: 0, draft: 0 });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formTitleKn, setFormTitleKn] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formCategorySlug, setFormCategorySlug] = useState('notes');
  const [formType, setFormType] = useState('notes');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const CATEGORY_OPTIONS = [
    { slug: 'notes', label: 'ನೋಟ್ಸ್ (Notes)' },
    { slug: 'grammar', label: 'ವ್ಯಾಕರಣ (Grammar)' },
    { slug: 'question-papers', label: 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ (Question Papers)' },
    { slug: 'previous-year', label: 'ಹಿಂದಿನ ಪತ್ರಿಕೆ (Previous Papers)' },
    { slug: 'qa', label: 'ಪ್ರಶ್ನೋತ್ತರ (Q & A)' },
    { slug: 'essay', label: 'ಪ್ರಬಂಧ & ಗಾದೆ (Essays)' },
    { slug: 'poets', label: 'ಕವಿ ಪರಿಚಯ (Poets)' },
    { slug: 'practice', label: 'ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ (Practice)' },
  ];

  // Fetch content from API
  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (searchQuery) qs.set('q', searchQuery);
      if (classFilter) qs.set('class', classFilter);
      if (statusFilter) qs.set('status', statusFilter);

      const res = await fetch(`/api/admin/content?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
        setClasses(data.classes || []);
        setContentStats(data.stats || { total: 0, published: 0, draft: 0 });
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, classFilter, statusFilter]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Open modal for new resource
  const handleOpenAddModal = () => {
    setEditingResource(null);
    setFormTitle('');
    setFormTitleKn('');
    setFormDescription('');
    setFormClassId(classes[0]?.id || '');
    setFormCategorySlug('notes');
    setFormType('notes');
    setFormFileUrl('');
    setFormIsPublished(false); // default to DRAFT
    setModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: ResourceItem) => {
    setEditingResource(item);
    setFormTitle(item.title || '');
    setFormTitleKn(item.title_kn || '');
    setFormDescription(item.description || '');
    setFormType(item.resource_type || 'notes');
    setFormFileUrl(item.file_url || '');
    setFormIsPublished(item.is_published);
    setModalOpen(true);
  };

  // Handle PDF / File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Origin: window.location.origin },
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormFileUrl(data.url);
        showToast('ಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ (File uploaded)');
      } else {
        alert(data.error || 'ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ');
      }
    } catch {
      alert('ಅಪ್‌ಲೋಡ್ ದೋಷ');
    } finally {
      setUploadingFile(false);
    }
  };

  // Save resource
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingResource) {
        // PUT
        const res = await fetch('/api/admin/content', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Origin: window.location.origin,
          },
          body: JSON.stringify({
            id: editingResource.id,
            title: formTitle,
            title_kn: formTitleKn,
            description: formDescription,
            resource_type: formType,
            file_url: formFileUrl,
            is_published: formIsPublished,
          }),
        });

        if (res.ok) {
          showToast('ಸಂಪನ್ಮೂಲ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ');
          setModalOpen(false);
          fetchContent();
        } else {
          const d = await res.json();
          alert(d.error || 'ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ');
        }
      } else {
        // POST
        const res = await fetch('/api/admin/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: window.location.origin,
          },
          body: JSON.stringify({
            title: formTitle,
            title_kn: formTitleKn,
            description: formDescription,
            resource_type: formType,
            file_url: formFileUrl,
            is_published: formIsPublished,
            class_id: formClassId,
            category_slug: formCategorySlug,
          }),
        });

        if (res.ok) {
          showToast(
            formIsPublished
              ? 'ಸಂಪನ್ಮೂಲ ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ!'
              : 'ಕರಡು ಉಳಿಸಲಾಗಿದೆ (Saved as Draft)'
          );
          setModalOpen(false);
          fetchContent();
        } else {
          const d = await res.json();
          alert(d.error || 'ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ');
        }
      }
    } catch {
      alert('ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ದೋಷ');
    } finally {
      setFormSubmitting(false);
    }
  };

  // One-click toggle publish status
  const handleTogglePublish = async (item: ResourceItem) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Origin: window.location.origin,
        },
        body: JSON.stringify({
          id: item.id,
          is_published: !item.is_published,
        }),
      });

      if (res.ok) {
        showToast(
          item.is_published
            ? 'ಕರಡು ಸ್ಥಿತಿಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ (Moved to Draft)'
            : 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪ್ರಕಟಿಸಲಾಗಿದೆ (Published)'
        );
        fetchContent();
      }
    } catch {
      alert('ಸ್ಥಿತಿ ಬದಲಾಯಿಸಲು ವಿಫಲವಾಗಿದೆ');
    }
  };

  // Delete resource
  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`"${title}" ಸಂಪನ್ಮೂಲವನ್ನು ಖಚಿತವಾಗಿ ಅಳಿಸಬೇಕೇ?`)) return;

    try {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: 'DELETE',
        headers: { Origin: window.location.origin },
      });

      if (res.ok) {
        showToast('ಸಂಪನ್ಮೂಲವನ್ನು ಅಳಿಸಲಾಗಿದೆ');
        fetchContent();
      } else {
        alert('ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
      }
    } catch {
      alert('ಅಳಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ');
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-sm flex items-center gap-3 animate-slide-up">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="kn font-medium">{notification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex p-1 rounded-2xl liquid-segmented-container max-w-fit gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('content')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'content'
              ? 'bg-white text-neutral-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-orange-600" />
          <span className="kn">ಸಂಪನ್ಮೂಲಗಳ ನಿರ್ವಹಣೆ</span>
          <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-mono">
            {contentStats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-white text-neutral-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-blue-600" />
          <span className="kn">ಅವಲೋಕನ (Overview)</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-white text-neutral-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span className="kn">ಬಳಕೆದಾರರು (Users)</span>
          <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-mono">
            {initialStats.total}
          </span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: CONTENT CMS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="ಸಂಪನ್ಮೂಲ ಹುಡುಕಿ (Search resources)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 kn"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>

              {/* Class Filter */}
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-orange-500 kn"
              >
                <option value="">ಎಲ್ಲಾ ತರಗತಿಗಳು (All Classes)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-orange-500 kn"
              >
                <option value="">ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು (All Status)</option>
                <option value="published">ಪ್ರಕಟಿತ ಮಾತ್ರ (Published only)</option>
                <option value="draft">ಕರಡುಗಳು ಮಾತ್ರ (Drafts only)</option>
              </select>
            </div>

            {/* Add Resource Button */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition hover:shadow kn"
              id="add-resource-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4"/>
              </svg>
              <span>+ ಹೊಸ ಸಂಪನ್ಮೂಲ ಸೇರಿಸಿ</span>
            </button>
          </div>

          {/* Mini Stats Ribbon with Liquid Glass */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="liquid-glass-card p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-500 font-medium kn">ಒಟ್ಟು ಸಂಪನ್ಮೂಲಗಳು</div>
                <div className="text-2xl font-bold text-neutral-900 font-mono mt-0.5">{contentStats.total}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/50 border border-white/70 flex items-center justify-center text-neutral-700">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="liquid-glass-card p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-500 font-medium kn">ಪ್ರಕಟಿತ (Live on Website)</div>
                <div className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">{contentStats.published}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-700">
                <Check className="w-5 h-5" />
              </div>
            </div>

            <div className="liquid-glass-card p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-500 font-medium kn">ಕರಡು (Internal Drafts)</div>
                <div className="text-2xl font-bold text-amber-700 font-mono mt-0.5">{contentStats.draft}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-700">
                <FileEdit className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Resources Table */}
          <div className="liquid-glass rounded-2xl border border-white/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">ಶೀರ್ಷಿಕೆ / ವಿವರ</th>
                    <th className="py-3.5 px-4">ವರ್ಗ & ತರಗತಿ</th>
                    <th className="py-3.5 px-4">ಪ್ರಕಾರ</th>
                    <th className="py-3.5 px-4">ಸ್ಥಿತಿ (Status)</th>
                    <th className="py-3.5 px-4">ಫೈಲ್</th>
                    <th className="py-3.5 px-6 text-right">ಕ್ರಿಯೆಗಳು (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 kn">
                        ಸಂಪನ್ಮೂಲಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...
                      </td>
                    </tr>
                  ) : resources.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400 kn space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div className="text-slate-600 font-semibold">ಯಾವುದೇ ಸಂಪನ್ಮೂಲಗಳು ಲಭ್ಯವಿಲ್ಲ</div>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          ನಿಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಮೊದಲ ಅಧ್ಯಯನ ಸಾಮಗ್ರಿ ಅಥವಾ ನೋಟ್ಸ್ ಸೇರಿಸಲು ಮೇಲಿನ <strong>+ ಹೊಸ ಸಂಪನ್ಮೂಲ ಸೇರಿಸಿ</strong> ಬಟನ್ ಒತ್ತಿ.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    resources.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-slate-900 kn">{item.title_kn || item.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description || item.title}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded kn w-fit">
                              {item.topics?.categories?.subjects?.classes?.name || 'ಸಾಮಾನ್ಯ'}
                            </span>
                            <span className="text-[11px] text-slate-400 kn">
                              {item.topics?.categories?.name || 'ನೋಟ್ಸ್'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {item.resource_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {item.is_published ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 kn">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              ಪ್ರಕಟಿತ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 kn">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              ಕರಡು (Draft)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.file_url ? (
                            <a
                              href={item.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-orange-600 hover:text-orange-700 underline flex items-center gap-1 font-medium"
                            >
                              <span>PDF ವೀಕ್ಷಿಸಿ</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-300">ಫೈಲ್ ಇಲ್ಲ</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Toggle Publish */}
                            <button
                              onClick={() => handleTogglePublish(item)}
                              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                                item.is_published
                                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              } kn`}
                              title={item.is_published ? 'ಕರಡು ಸ್ಥಿತಿಗೆ ಬದಲಾಯಿಸಿ' : 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪ್ರಕಟಿಸಿ'}
                            >
                              {item.is_published ? 'ಕರಡು ಮಾಡು' : 'ಪ್ರಕಟಿಸು'}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium kn"
                            >
                              ತಿದ್ದು (Edit)
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteResource(item.id, item.title)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium kn"
                            >
                              ಅಳಿಸು
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: OVERVIEW */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 kn">
                ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು
              </div>
              <div className="text-3xl font-bold text-slate-900 font-mono">{initialStats.total}</div>
              <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <span>● ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 kn">
                ಒಟ್ಟು ಸಂಪನ್ಮೂಲಗಳು
              </div>
              <div className="text-3xl font-bold text-orange-600 font-mono">{contentStats.total}</div>
              <div className="text-xs text-slate-400 mt-1 kn">ಲೈಬ್ರರಿ ಸಂಗ್ರಹ</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 kn">
                ಪ್ರಕಟಿತ ಸಾಮಗ್ರಿಗಳು
              </div>
              <div className="text-3xl font-bold text-emerald-600 font-mono">{contentStats.published}</div>
              <div className="text-xs text-slate-400 mt-1 kn">ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಲಭ್ಯ</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 kn">
                ಕರಡು ಸಾಮಗ್ರಿಗಳು
              </div>
              <div className="text-3xl font-bold text-amber-600 font-mono">{contentStats.draft}</div>
              <div className="text-xs text-slate-400 mt-1 kn">ಪರಿಶೀಲನೆಯಲ್ಲಿರುವ ಕರಡುಗಳು</div>
            </div>
          </div>

          {/* Quick Storage Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-2 kn">
              Supabase Storage & ಸುರಕ್ಷತೆ ಸ್ಥಿತಿ
            </h3>
            <p className="text-xs text-slate-500 mb-4 kn">
              ಎಲ್ಲಾ ಅಪ್‌ಲೋಡ್ ಆದ ಅಧ್ಯಯನ ಸಾಮಗ್ರಿ ಮತ್ತು ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು ನೇರವಾಗಿ Supabase{' '}
              <code className="text-orange-600 font-mono font-semibold">educational-resources</code> ಬಕೆಟ್‌ನಲ್ಲಿ ಶೇಖರಣೆಯಾಗುತ್ತವೆ.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>PostgreSQL RLS ಸಕ್ರಿಯವಾಗಿದೆ</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 font-medium">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Storage CDN Direct Delivery</span>
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 font-medium">
                <Check className="w-3.5 h-3.5 text-purple-600" />
                <span>HMAC ಸಹಿ ದೃಢೀಕರಣ</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: USERS LIST & CSV EXPORT (EXISTING FUNCTIONALITY) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 kn">
                ನೋಂದಾಯಿತ ವಿದ್ಯಾರ್ಥಿಗಳ ಪಟ್ಟಿ ({initialUsers.length})
              </h2>
              <span className="text-xs text-slate-400 kn">
                ಹೊಸ ನೋಂದಣಿಗಳು ತಕ್ಷಣ ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತವೆ
              </span>
            </div>
            <a
              href="/api/admin/users?export=csv"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
            >
              CSV ಡೌನ್‌ಲೋಡ್ (Export)
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು</th>
                  <th className="py-3 px-6">ಇಮೇಲ್</th>
                  <th className="py-3 px-6">ತರಗತಿ</th>
                  <th className="py-3 px-6">ನೋಂದಣಿ ದಿನಾಂಕ</th>
                  <th className="py-3 px-6">ಕೊನೆಯ ಲಾಗಿನ್</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 kn">
                      ಯಾವುದೇ ವಿದ್ಯಾರ್ಥಿಗಳು ಇನ್ನೂ ನೋಂದಾಯಿಸಿಕೊಂಡಿಲ್ಲ.
                    </td>
                  </tr>
                ) : (
                  initialUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 text-white flex items-center justify-center font-bold text-xs">
                          {(user.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className="kn">{user.name}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-mono text-xs">{user.email}</td>
                      <td className="py-3.5 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 kn">
                          {user.grade ? `${user.grade}ನೇ ತರಗತಿ` : 'ಸಾಮಾನ್ಯ'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">
                        {new Date(user.registeredAt).toLocaleDateString('kn-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">
                        {new Date(user.lastLoginAt).toLocaleTimeString('kn-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT RESOURCE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-xl font-bold text-slate-900 kn">
                {editingResource ? 'ಸಂಪನ್ಮೂಲ ತಿದ್ದುಪಡಿ (Edit Resource)' : '+ ಹೊಸ ಸಂಪನ್ಮೂಲ ಸೇರಿಸಿ (Add Resource)'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
                aria-label="ಮುಚ್ಚಿ (Close)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4">
              {/* Kannada Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 kn">
                  ಕನ್ನಡ ಶೀರ್ಷಿಕೆ (Title in Kannada) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ಉದಾ: 10ನೇ ತರಗತಿ ಗದ್ಯ 1: ಯುದ್ಧ ನೋಟ್ಸ್"
                  value={formTitleKn}
                  onChange={(e) => setFormTitleKn(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 kn font-medium"
                />
              </div>

              {/* English Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 kn">
                  ಆಂಗ್ಲ ಶೀರ್ಷಿಕೆ (Title in English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 10 Prose 1: Yuddha Notes"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Grid: Class & Category (only on create) */}
              {!editingResource && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 kn">
                      ತರಗತಿ (Class)
                    </label>
                    <select
                      value={formClassId}
                      onChange={(e) => setFormClassId(e.target.value)}
                      className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 kn"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 kn">
                      ವರ್ಗ (Category)
                    </label>
                    <select
                      value={formCategorySlug}
                      onChange={(e) => setFormCategorySlug(e.target.value)}
                      className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 kn"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Resource Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 kn">
                  ಸಾಮಗ್ರಿಯ ಪ್ರಕಾರ (Resource Type)
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-orange-500"
                >
                  <option value="notes">Notes (ನೋಟ್ಸ್)</option>
                  <option value="question_paper">Question Paper (ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ)</option>
                  <option value="previous_year_paper">Previous Year Paper (ಹಿಂದಿನ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ)</option>
                  <option value="grammar">Grammar (ವ್ಯಾಕರಣ)</option>
                  <option value="qa">Q & A (ಪ್ರಶ್ನೋತ್ತರ)</option>
                  <option value="essay">Essay & Sayings (ಪ್ರಬಂಧ)</option>
                  <option value="practice">Practice (ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 kn">
                  ವಿವರಣೆ (Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="ಈ ಪಾಠ ಅಥವಾ ಸಾಮಗ್ರಿಯ ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 kn"
                />
              </div>

              {/* File Upload to Supabase Storage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 kn">
                  PDF ಅಥವಾ ಅಧ್ಯಯನ ಫೈಲ್ (Attach PDF)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  {uploadingFile && (
                    <span className="text-xs text-orange-600 animate-pulse kn">ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...</span>
                  )}
                </div>
                {formFileUrl && (
                  <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 break-all flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ಫೈಲ್ ಲಿಂಕ್: {formFileUrl}</span>
                  </div>
                )}
              </div>

              {/* Publication Status (Draft vs Published) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 kn">
                  ಪ್ರಕಟಣೆ ಸ್ಥಿತಿ (Publication Status)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      !formIsPublished
                        ? 'border-amber-400 bg-amber-50/50 text-amber-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={!formIsPublished}
                      onChange={() => setFormIsPublished(false)}
                      className="text-amber-600"
                    />
                    <div>
                      <div className="text-sm font-semibold kn">ಕರಡು (Draft)</div>
                      <div className="text-[11px] text-slate-400 kn">ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕಾಣಿಸುವುದಿಲ್ಲ</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      formIsPublished
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={formIsPublished}
                      onChange={() => setFormIsPublished(true)}
                      className="text-emerald-600"
                    />
                    <div>
                      <div className="text-sm font-semibold kn">ಪ್ರಕಟಿಸಿ (Live)</div>
                      <div className="text-[11px] text-slate-400 kn">ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಲಭ್ಯವಾಗುತ್ತದೆ</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 kn"
                >
                  ರದ್ದುಮಾಡಿ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingFile}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50 kn"
                >
                  {formSubmitting
                    ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...'
                    : formIsPublished
                    ? 'ಪ್ರಕಟಿಸಿ ಉಳಿಸಿ (Save & Publish)'
                    : 'ಕರಡು ಉಳಿಸಿ (Save as Draft)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
