import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import RichTextEditor from '../../components/RichTextEditor';
import { RootState } from '../../store/store';
import { auth, isFirebaseConfigured } from '../../../firebase';
import {
  PortfolioEntry,
  PortfolioSchedule,
  PortfolioSectionId,
  PortfolioState,
  TerminalCommand,
  updatePortfolio,
} from '../../store/portfolioSlice';
import { savePortfolioToCloud } from '../../lib/portfolioCloud';
import { ContactMessage, subscribeToContactMessages } from '../../lib/contactMessages';
import { sortPortfolioEntriesBySerial } from '../../lib/portfolio';

type CollectionKey = Exclude<keyof PortfolioState, 'homeRichText' | 'sections' | 'commands' | 'schedules' | 'publicationTypeOrder'>;
type Field = { key: string; label: string; kind?: 'list' | 'rich' | 'url' | 'select' | 'suggest' | 'textarea'; suggestions?: string[]; options?: string[] };
type EditorOption = { id: string; label: string; key: CollectionKey; fields: Field[] };

const editorOptions: EditorOption[] = [
  { id: 'professionalExperience', label: 'Professional experience', key: 'professionalExperience', fields: [
    { key: 'role', label: 'Role' }, { key: 'workplaceName', label: 'Workplace name' },
    { key: 'workplaceAddress', label: 'Workplace address' }, { key: 'workplaceWeb', label: 'Workplace website', kind: 'url' },
    { key: 'startDate', label: 'Start date' }, { key: 'endDate', label: 'End date (use Present if current)' },
    { key: 'tags', label: 'Tags', kind: 'list' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'profiles', label: 'Links and profiles', key: 'profiles', fields: [
    { key: 'category', label: 'Category' }, { key: 'title', label: 'Title' },
    { key: 'url', label: 'Link', kind: 'url' },
    { key: 'icon', label: 'Icon', kind: 'select', options: ['None', 'GitHub', 'LinkedIn', 'WhatsApp', 'Codeforces', 'Other'] },
    { key: 'iconUrl', label: 'Custom icon image URL (optional)', kind: 'url' },
    { key: 'description', label: 'Short description', kind: 'textarea' },
  ] },
  { id: 'academicExperience', label: 'Academic experience', key: 'academicExperience', fields: [
    { key: 'role', label: 'Role' }, { key: 'workplaceName', label: 'Workplace name' },
    { key: 'workplaceAddress', label: 'Workplace address' }, { key: 'workplaceWeb', label: 'Workplace website', kind: 'url' },
    { key: 'startDate', label: 'Start date' }, { key: 'endDate', label: 'End date (use Present if current)' },
    { key: 'tags', label: 'Tags', kind: 'list' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'projects', label: 'Projects', key: 'projects', fields: [
    { key: 'title', label: 'Title' }, { key: 'projectTime', label: 'Project time' },
    { key: 'tools', label: 'Tools (one per line)', kind: 'list' }, { key: 'githubLink', label: 'GitHub link', kind: 'url' },
    { key: 'liveLink', label: 'Live link', kind: 'url' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'certifications', label: 'Certifications', key: 'certifications', fields: [
    { key: 'title', label: 'Title' }, { key: 'issuer', label: 'Issuer' }, { key: 'date', label: 'Date' },
    { key: 'certificateLink', label: 'Certificate link', kind: 'url' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'gallery', label: 'Gallery', key: 'gallery', fields: [
    { key: 'title', label: 'Title' }, { key: 'imageUrl', label: 'Image URL', kind: 'url' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'skills', label: 'Skills', key: 'skills', fields: [
    { key: 'name', label: 'Skills (separate with commas)' }, { key: 'category', label: 'Category' }, { key: 'score', label: 'Score / proficiency' },
    { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'english', label: 'English proficiency', key: 'english', fields: [
    { key: 'language', label: 'Language' }, { key: 'score', label: 'Score' }, { key: 'scale', label: 'Score scale' },
    { key: 'test', label: 'Test / assessment' }, { key: 'date', label: 'Date' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'education', label: 'Education', key: 'education', fields: [
    { key: 'degree', label: 'Degree' }, { key: 'subject', label: 'Subject / Department' },
    { key: 'institution', label: 'Institution' }, { key: 'location', label: 'Location' },
    { key: 'startDate', label: 'Start date' }, { key: 'endDate', label: 'End date' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'honors', label: 'Honors and awards', key: 'honors', fields: [
    { key: 'title', label: 'Title' }, { key: 'issuer', label: 'Issuer' }, { key: 'date', label: 'Date' },
    { key: 'url', label: 'Link', kind: 'url' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'activities', label: 'Extra curricular activities', key: 'activities', fields: [
    { key: 'title', label: 'Activity' }, { key: 'organization', label: 'Organization' },
    { key: 'startDate', label: 'Start date' }, { key: 'endDate', label: 'End date' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'publications', label: 'Publications', key: 'publications', fields: [
    { key: 'publicationType', label: 'Publication type', kind: 'suggest', suggestions: ['Journal', 'Conference', 'Presentation', 'Book', 'Preprint', 'Poster', 'Workshop', 'Thesis', 'Other'] },
    { key: 'title', label: 'Title' }, { key: 'author', label: 'Author(s)' }, { key: 'publication', label: 'Journal / publisher' },
    { key: 'date', label: 'Date' }, { key: 'url', label: 'Publication link', kind: 'url' }, { key: 'description', label: 'Description', kind: 'rich' },
  ] },
  { id: 'news', label: 'Recent activities', key: 'news', fields: [
    { key: 'title', label: 'Title' }, { key: 'date', label: 'Date' }, { key: 'url', label: 'Related link', kind: 'url' },
    { key: 'description', label: 'Description', kind: 'rich' },
  ] },
];

function entryTitle(entry: PortfolioEntry, index: number): string {
  return String(entry.title || entry.role || entry.name || entry.degree || entry.language || `Item ${index + 1}`);
}

function normalizePublicationType(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export default function Admin() {
  const dispatch = useDispatch();
  const location = useLocation();
  const portfolio = useSelector((state: RootState) => state.portfolio);
  const [draft, setDraft] = useState<PortfolioState>(portfolio);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMessageError, setIsMessageError] = useState(false);
  const [activeEditor, setActiveEditor] = useState(editorOptions[0].id);
  const [activePanel, setActivePanel] = useState(location.hash === '#schedules' ? 'schedules' : editorOptions[0].id);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const editor = editorOptions.find((option) => option.id === activeEditor) ?? editorOptions[0];
  const entries = (draft[editor.key] as PortfolioEntry[] | undefined) ?? [];
  const orderedEntries = sortPortfolioEntriesBySerial(entries);
  const selectedEntry = entries.find((entry) => entry.id === selectedId);
  const savedPublicationTypeOrder = draft.publicationTypeOrder ?? [];
  const publicationTypeMap = new Map<string, string>();
  if (editor.id === 'publications') {
    entries.forEach((entry) => {
      const label = String(entry.publicationType || 'Other').trim() || 'Other';
      const key = normalizePublicationType(label);
      if (!publicationTypeMap.has(key)) publicationTypeMap.set(key, label);
    });
  }
  const publicationTypes = Array.from(publicationTypeMap.values());
  const configuredTypeKeys = Array.from(new Set(savedPublicationTypeOrder.map(normalizePublicationType)));
  const orderedPublicationTypes = [
    ...configuredTypeKeys
      .map((key) => publicationTypes.find((type) => normalizePublicationType(type) === key))
      .filter((type): type is string => Boolean(type)),
    ...publicationTypes.filter((type) => !configuredTypeKeys.includes(normalizePublicationType(type))),
  ];

  useEffect(() => {
    setDraft(portfolio);
  }, [portfolio]);

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (user) => {
        setIsAuthenticated(Boolean(user));
        setIsAuthLoading(false);
      },
      (error) => {
        setMessage(error.message);
        setIsMessageError(true);
        setIsAuthLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!isAuthenticated || activePanel !== 'messages') return;
    setIsMessagesLoading(true);
    setMessagesError('');
    return subscribeToContactMessages(
      (messages) => {
        setContactMessages(messages);
        setIsMessagesLoading(false);
      },
      (error) => {
        setMessagesError(error.message);
        setIsMessagesLoading(false);
      },
    );
  }, [activePanel, isAuthenticated]);

  const updateDraft = (update: (current: PortfolioState) => PortfolioState) => {
    setDraft((current) => update(current));
  };

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setIsMessageError(false);
    if (!isFirebaseConfigured) {
      setMessage('Firebase Authentication is not configured. Add the VITE_FIREBASE_* values from your Firebase project to the environment.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.');
      setIsMessageError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeEditor = (id: string) => {
    setActiveEditor(id);
    setActivePanel(id);
    const option = editorOptions.find((item) => item.id === id);
    setSelectedId(option ? sortPortfolioEntriesBySerial((draft[option.key] as PortfolioEntry[] | undefined) ?? [])[0]?.id ?? '' : '');
  };

  const updateSelectedEntry = (key: string, value: string | string[]) => {
    if (!selectedId) return;
    updateDraft((current) => ({
      ...current,
      [editor.key]: ((current[editor.key] as PortfolioEntry[] | undefined) ?? []).map((entry) => {
        if (entry.id !== selectedId) return entry;
        const updated = { ...entry, [key]: value };
        if (key === 'tags') delete updated.responsibilities;
        return updated;
      }),
    }));
  };

  const addEntry = () => {
    const id = crypto.randomUUID();
    const highestSerial = entries.reduce((highest, entry) => {
      const serial = Number(entry.serial);
      return Number.isFinite(serial) ? Math.max(highest, serial) : highest;
    }, 0);
    const next: PortfolioEntry = { id, serial: String(highestSerial + 1) };
    updateDraft((current) => ({ ...current, [editor.key]: [...((current[editor.key] as PortfolioEntry[] | undefined) ?? []), next] }));
    setSelectedId(id);
  };

  const deleteEntry = () => {
    if (!selectedId) return;
    updateDraft((current) => ({
      ...current,
      [editor.key]: ((current[editor.key] as PortfolioEntry[] | undefined) ?? []).filter((entry) => entry.id !== selectedId),
    }));
    setSelectedId('');
  };

  const updateSection = (id: PortfolioSectionId, field: 'title' | 'serial' | 'visible', value: string | number | boolean) => {
    updateDraft((current) => ({
      ...current,
      sections: current.sections.map((section) => section.id === id ? { ...section, [field]: value } : section),
    }));
  };

  const movePublicationType = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedPublicationTypes.length) return;
    const nextOrder = [...orderedPublicationTypes];
    [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];
    updateDraft((current) => ({ ...current, publicationTypeOrder: nextOrder }));
  };

  const save = async () => {
    setMessage('');
    setIsMessageError(false);
    setIsSaving(true);
    try {
      await savePortfolioToCloud(draft);
      dispatch(updatePortfolio(draft));
      setMessage('Portfolio data saved to Firebase.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save portfolio data to Firebase.');
      setIsMessageError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const logout = async () => {
    setMessage('');
    setIsMessageError(false);
    try {
      await signOut(auth);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign out.');
      setIsMessageError(true);
    }
  };

  if (isAuthLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#21141f] text-white">Checking admin session...</main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#21141f] p-4 text-white">
        <form onSubmit={handleAuth} className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/5 p-7 shadow-2xl">
          <Link to="/" className="text-sm text-orange-300 hover:underline">← Back to portfolio</Link>
          <h1 className="text-2xl font-semibold">Admin sign in</h1>
          <p className="text-sm text-white/60">
            Sign in with an email and password enabled in Firebase Authentication.
          </p>
          <label className="block space-y-1 text-sm">
            <span>Email</span>
            <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 p-3 outline-none focus:border-orange-400" />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Password</span>
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 p-3 outline-none focus:border-orange-400" />
          </label>
          {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
          <button disabled={isSubmitting} className="w-full rounded-lg bg-orange-600 px-4 py-3 font-medium hover:bg-orange-500 disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1d1720] p-4 text-white md:p-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/" className="text-sm text-orange-300 hover:underline">← Portfolio</Link>
            <h1 className="mt-1 text-3xl font-semibold">Portfolio Admin</h1>
            <p className="mt-1 text-sm text-white/50">Manage your content, sections, ordering, and terminal commands.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={isSaving} className="rounded-lg bg-orange-600 px-4 py-2 font-medium hover:bg-orange-500 disabled:opacity-60">{isSaving ? 'Saving data…' : 'Save changes'}</button>
            <button onClick={logout} className="rounded-lg border border-white/15 px-4 py-2 hover:bg-white/10">Sign out</button>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="custom-scrollbar rounded-xl border border-white/10 bg-white/5 p-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <nav aria-label="Admin sections" className="flex flex-col gap-1">
              <button type="button" onClick={() => setActivePanel('home')} className={`rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 ${activePanel === 'home' ? 'bg-white/10 text-orange-300' : 'text-white/80'}`}>Home content</button>
              <button type="button" onClick={() => setActivePanel('sections')} className={`rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 ${activePanel === 'sections' ? 'bg-white/10 text-orange-300' : 'text-white/80'}`}>Sections and order</button>
              <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-white/40">Section content</p>
              {editorOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => changeEditor(option.id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 ${activePanel === option.id ? 'bg-white/10 text-orange-300' : 'text-white/80'}`}
                >
                  {option.label}
                </button>
              ))}
              <button type="button" onClick={() => setActivePanel('messages')} className={`mt-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 ${activePanel === 'messages' ? 'bg-white/10 text-orange-300' : 'text-white/80'}`}>Contact messages</button>
              <button type="button" onClick={() => setActivePanel('schedules')} className={`mt-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 ${activePanel === 'schedules' ? 'bg-white/10 text-orange-300' : 'text-white/80'}`}>Schedules</button>
              <button type="button" onClick={() => setActivePanel('commands')} className={`rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 ${activePanel === 'commands' ? 'bg-white/10 text-orange-300' : 'text-white/80'}`}>Terminal commands</button>
            </nav>
          </aside>

          <div className="min-w-0">
        {activePanel === 'home' && <section className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-3 text-xl font-medium">Home rich text</h2>
          <RichTextEditor value={draft.homeRichText} onChange={(value) => updateDraft((current) => ({ ...current, homeRichText: value }))} />
        </section>}

        {activePanel === 'sections' && <section className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-1 text-xl font-medium">Sections and serial order</h2>
          <p className="mb-4 text-sm text-white/50">Change each label, visible state, and serial number. Lower serial numbers appear first.</p>
          <div className="space-y-2">
            {[...draft.sections].sort((a, b) => a.serial - b.serial).map((section) => (
              <div key={section.id} className="grid gap-3 rounded-lg bg-black/20 p-3 md:grid-cols-[1fr_120px_auto]">
                <input aria-label={`${section.id} title`} value={section.title} onChange={(event) => updateSection(section.id, 'title', event.target.value)} className="rounded border border-white/10 bg-transparent px-3 py-2" />
                <input aria-label={`${section.id} serial`} type="number" value={section.serial} onChange={(event) => updateSection(section.id, 'serial', Number(event.target.value))} className="rounded border border-white/10 bg-transparent px-3 py-2" />
                <label className="flex items-center gap-2 px-2 text-sm"><input type="checkbox" checked={section.visible} onChange={(event) => updateSection(section.id, 'visible', event.target.checked)} /> Visible</label>
              </div>
            ))}
          </div>
        </section>}

        {activePanel === activeEditor && <section className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-medium">{editor.label}</h2>
              <p className="text-sm text-white/50">Fields are optional. Rich descriptions support formatting. Save changes to sync to Firebase.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={addEntry} className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10">Add item</button>
              <button onClick={deleteEntry} disabled={!selectedEntry} className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-300 enabled:hover:bg-red-400/10 disabled:opacity-40">Delete item</button>
            </div>
          </div>
          {editor.id === 'publications' && (
            <div className="mb-5 rounded-lg border border-white/10 bg-black/20 p-4">
              <h3 className="mb-1 font-medium">Publication type order</h3>
              <p className="mb-3 text-xs text-white/50">Use the arrows to change the order of publication groups in the client view.</p>
              {orderedPublicationTypes.length === 0 ? (
                <p className="text-sm text-white/50">Add a publication to create a group.</p>
              ) : (
                <ol className="space-y-2">
                  {orderedPublicationTypes.map((type, index) => (
                    <li key={type} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm">
                      <span>{type}</span>
                      <span className="flex gap-2">
                        <button type="button" aria-label={`Move ${type} up`} disabled={index === 0} onClick={() => movePublicationType(index, -1)} className="rounded border border-white/15 px-2 py-1 disabled:opacity-30">↑</button>
                        <button type="button" aria-label={`Move ${type} down`} disabled={index === orderedPublicationTypes.length - 1} onClick={() => movePublicationType(index, 1)} className="rounded border border-white/15 px-2 py-1 disabled:opacity-30">↓</button>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
          <div className="mb-4 max-w-xl">
            <select aria-label={`Select ${editor.label} item`} value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="w-full rounded-lg border border-white/15 bg-[#28212b] px-3 py-2">
              <option value="">Select item</option>
              {orderedEntries.map((entry, index) => <option key={entry.id} value={entry.id}>{entry.serial}. {entryTitle(entry, index)}</option>)}
            </select>
          </div>
          {selectedEntry && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Serial</span>
                <input value={selectedEntry.serial} onChange={(event) => updateSelectedEntry('serial', event.target.value)} className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2" />
              </label>
              {editor.fields.map((field) => {
                const fieldValue = selectedEntry[field.key] ??
                  (field.key === 'tags' ? selectedEntry.responsibilities : undefined) ??
                  '';
                if (field.kind === 'rich') {
                  return <div key={field.key} className="space-y-1 text-sm md:col-span-2"><span>{field.label}</span><RichTextEditor value={String(fieldValue)} onChange={(value) => updateSelectedEntry(field.key, value)} /></div>;
                }
                if (field.kind === 'list') {
                  return <label key={field.key} className="space-y-1 text-sm md:col-span-2"><span>{field.label}</span><textarea rows={4} value={Array.isArray(fieldValue) ? fieldValue.join('\n') : String(fieldValue)} onChange={(event) => updateSelectedEntry(field.key, event.target.value.split('\n').filter((line) => line.trim()))} className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2" /></label>;
                }
                if (field.kind === 'suggest') {
                  const listId = `${field.key}-suggestions`;
                  return <label key={field.key} className="space-y-1 text-sm"><span>{field.label}</span><input list={listId} value={String(fieldValue)} onChange={(event) => updateSelectedEntry(field.key, event.target.value)} className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2" /><datalist id={listId}>{field.suggestions?.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist></label>;
                }
                if (field.kind === 'select') {
                  return <label key={field.key} className="space-y-1 text-sm"><span>{field.label}</span><select value={String(fieldValue)} onChange={(event) => updateSelectedEntry(field.key, event.target.value)} className="w-full rounded-lg border border-white/15 bg-[#28212b] px-3 py-2"><option value="">Select an icon</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
                }
                if (field.kind === 'textarea') {
                  return <label key={field.key} className="space-y-1 text-sm"><span>{field.label}</span><textarea rows={3} value={String(fieldValue)} onChange={(event) => updateSelectedEntry(field.key, event.target.value)} className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2" /></label>;
                }
                return <label key={field.key} className="space-y-1 text-sm"><span>{field.label}</span><input type={field.kind === 'url' ? 'url' : 'text'} value={String(fieldValue)} onChange={(event) => updateSelectedEntry(field.key, event.target.value)} className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2" /></label>;
              })}
            </div>
          )}
          {!selectedEntry && <p className="rounded-lg bg-black/20 p-5 text-sm text-white/50">Choose an item or click “Add item” to edit this section.</p>}
        </section>}

        {activePanel === 'schedules' && <ScheduleEditor
          schedules={draft.schedules ?? []}
          onChange={(schedules) => updateDraft((current) => ({ ...current, schedules }))}
        />}
        {activePanel === 'commands' && <TerminalCommandEditor
          commands={draft.commands}
          sections={draft.sections}
          onChange={(commands) => updateDraft((current) => ({ ...current, commands }))}
        />}
        {activePanel === 'messages' && <section className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4">
            <h2 className="text-xl font-medium">Contact messages</h2>
            <p className="text-sm text-white/50">Messages submitted from the client portfolio.</p>
          </div>
          {isMessagesLoading && <p className="text-sm text-white/60">Loading messages…</p>}
          {messagesError && <p role="alert" className="text-sm text-red-300">{messagesError}</p>}
          {!isMessagesLoading && !messagesError && contactMessages.length === 0 && <p className="rounded-lg bg-black/20 p-4 text-sm text-white/50">No messages have been received.</p>}
          {!messagesError && contactMessages.length > 0 && (
            <div className="space-y-3">
              {contactMessages.map((contactMessage) => (
                <article key={contactMessage.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-medium">{contactMessage.name}</h3>
                    <time className="text-xs text-white/50">{contactMessage.createdAt?.toLocaleString() ?? 'Date unavailable'}</time>
                  </div>
                  <a className="mt-1 inline-block text-sm text-orange-300 hover:underline" href={`mailto:${contactMessage.email}`}>{contactMessage.email}</a>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm text-white/80">{contactMessage.message}</p>
                </article>
              ))}
            </div>
          )}
        </section>}
          </div>
        </div>
        {message && <p role={isMessageError ? 'alert' : 'status'} className={`fixed bottom-4 right-4 rounded-lg px-4 py-2 text-sm shadow-lg ${isMessageError ? 'bg-red-700' : 'bg-emerald-700'}`}>{message}</p>}
      </div>
    </main>
  );
}

type CommandEditorProps = {
  commands: TerminalCommand[];
  sections: PortfolioState['sections'];
  onChange: (commands: TerminalCommand[]) => void;
};

type ScheduleEditorProps = {
  schedules: PortfolioSchedule[];
  onChange: (schedules: PortfolioSchedule[]) => void;
};

function ScheduleEditor({ schedules, onChange }: ScheduleEditorProps) {
  const updateSchedule = (id: string, field: keyof PortfolioSchedule, value: string) => {
    onChange(schedules.map((schedule) => schedule.id === id ? { ...schedule, [field]: value } : schedule));
  };

  return (
    <section id="schedules" className="mb-6 scroll-mt-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium">Schedules</h2>
          <p className="text-sm text-white/50">These events appear in the top-bar calendar.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...schedules, { id: crypto.randomUUID(), title: '', description: '', date: '', time: '' }])}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
        >
          Add schedule
        </button>
      </div>
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="grid gap-3 rounded-lg bg-black/20 p-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Title</span>
              <input value={schedule.title} onChange={(event) => updateSchedule(schedule.id, 'title', event.target.value)} className="w-full rounded border border-white/10 bg-transparent px-3 py-2" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span>Date</span>
                <input type="date" value={schedule.date} onChange={(event) => updateSchedule(schedule.id, 'date', event.target.value)} className="w-full rounded border border-white/10 bg-transparent px-3 py-2" />
              </label>
              <label className="space-y-1 text-sm">
                <span>Time</span>
                <input type="time" value={schedule.time} onChange={(event) => updateSchedule(schedule.id, 'time', event.target.value)} className="w-full rounded border border-white/10 bg-transparent px-3 py-2" />
              </label>
            </div>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>Description</span>
              <textarea rows={2} value={schedule.description} onChange={(event) => updateSchedule(schedule.id, 'description', event.target.value)} className="w-full rounded border border-white/10 bg-transparent px-3 py-2" />
            </label>
            <button type="button" onClick={() => onChange(schedules.filter((item) => item.id !== schedule.id))} className="justify-self-start rounded border border-red-400/30 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10">
              Remove schedule
            </button>
          </div>
        ))}
        {schedules.length === 0 && <p className="rounded-lg bg-black/20 p-4 text-sm text-white/50">No schedules yet.</p>}
      </div>
    </section>
  );
}

function TerminalCommandEditor({ commands, sections, onChange }: CommandEditorProps) {
  const availableSections = useMemo(() => sections, [sections]);
  const updateCommand = (id: string, field: keyof TerminalCommand, value: string) => {
    onChange(commands.map((command) => command.id === id ? { ...command, [field]: value } : command));
  };
  return (
    <section id="commands" className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><h2 className="text-xl font-medium">Terminal commands</h2><p className="text-sm text-white/50">Add commands that print text or open a portfolio section.</p></div>
        <button onClick={() => onChange([...commands, { id: crypto.randomUUID(), command: '', output: '', sectionId: '' }])} className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10">Add command</button>
      </div>
      <div className="space-y-3">
        {commands.map((command) => (
          <div key={command.id} className="grid gap-3 rounded-lg bg-black/20 p-3 md:grid-cols-[180px_1fr_200px_auto]">
            <input aria-label="Command name" value={command.command} onChange={(event) => updateCommand(command.id, 'command', event.target.value)} placeholder="command" className="rounded border border-white/10 bg-transparent px-3 py-2" />
            <input aria-label="Command output" value={command.output} onChange={(event) => updateCommand(command.id, 'output', event.target.value)} placeholder="Output text" className="rounded border border-white/10 bg-transparent px-3 py-2" />
            <select aria-label="Command target section" value={command.sectionId} onChange={(event) => updateCommand(command.id, 'sectionId', event.target.value)} className="rounded border border-white/10 bg-[#28212b] px-3 py-2">
              <option value="">Print output only</option>
              {availableSections.map((section) => <option key={section.id} value={section.id}>{section.title || section.id}</option>)}
            </select>
            <button onClick={() => onChange(commands.filter((item) => item.id !== command.id))} className="rounded border border-red-400/30 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10">Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}
