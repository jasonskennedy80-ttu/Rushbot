'use client';

import { useState, useRef, useEffect, useMemo, FormEvent, KeyboardEvent } from 'react';
import { RUSH_QUOTES } from '@/lib/rush-quotes';
import { SETLIST_SONGS, LIKELIHOOD_LABELS } from '@/lib/setlist-data';
import type { SetlistSong } from '@/lib/setlist-data';
import { RUSH_DISCOGRAPHY, ALBUM_NAMES } from '@/lib/rush-discography';
import type { BingoPick } from '@/app/api/bingo-picks/route';

// ===== TRIP ITINERARY =====
const ITINERARY: Array<{
  date: string; label: string; highlight?: boolean;
  events: Array<{ time: string; desc: string; icon: string; highlight?: boolean; link?: string }>;
}> = [
  {
    date: 'Sat, June 6',
    label: 'Arrival Day',
    events: [
      { time: '2:02 PM', desc: 'Jesse arrives — AA1213 to LAX', icon: '✈️' },
      { time: '3:00 PM', desc: 'Stew, Mark & Matt arrive — WN 3161 DAL→LAX', icon: '✈️' },
      { time: 'Afternoon', desc: 'Check in at 99 Hermosa Ave, Hermosa Beach', icon: '🏠' },
      { time: 'Evening', desc: 'Mitch arrives (late)', icon: '🚗' },
      { time: 'TBD', desc: 'Group dinner — first night together!', icon: '🍕', link: 'dinner-recs' },
    ],
  },
  {
    date: 'Sun, June 7',
    label: 'SHOW 1',
    highlight: true,
    events: [
      { time: 'Daytime', desc: 'Explore Hermosa Beach / free time', icon: '🏖️' },
      { time: 'TBD', desc: 'Pre-show meetup & dinner', icon: '🍽️' },
      { time: '8:00 PM', desc: 'RUSH — Show 1!', icon: '🎸', highlight: true },
      { time: 'After', desc: 'Post-show celebration', icon: '🤘' },
    ],
  },
  {
    date: 'Mon, June 8',
    label: 'Rest Day',
    events: [
      { time: 'All Day', desc: 'Recovery day — beach, explore LA, relax', icon: '😎' },
    ],
  },
  {
    date: 'Tue, June 9',
    label: 'SHOW 2',
    highlight: true,
    events: [
      { time: 'Daytime', desc: 'Free time / sightseeing', icon: '🌴' },
      { time: 'TBD', desc: 'Pre-show meetup & dinner', icon: '🍽️' },
      { time: '8:00 PM', desc: 'RUSH — Show 2!', icon: '🎸', highlight: true },
      { time: 'After', desc: 'Post-show celebration', icon: '🤘' },
    ],
  },
  {
    date: 'Wed, June 10',
    label: 'Departure Day',
    events: [
      { time: 'Morning', desc: 'Check out — 99 Hermosa Ave', icon: '🏠' },
      { time: '11:00 AM', desc: 'Jesse departs — AA1159 from LAX', icon: '✈️' },
      { time: '4:10 PM', desc: 'Stew departs — WN 716 LAX→DAL', icon: '✈️' },
      { time: 'TBD', desc: 'Mitch, Mark, others depart', icon: '👋' },
    ],
  },
  {
    date: 'Sat, June 13',
    label: 'SHOW 3',
    highlight: true,
    events: [
      { time: '8:00 PM', desc: 'RUSH — Show 3! (Tom & Dawn, Mitch)', icon: '🎸', highlight: true },
    ],
  },
];

const TICKET_INFO = [
  { show: 'June 7 (Show 1)', holders: ['Mitch (8 tickets)', 'Tom & Dawn (2 tickets)'] },
  { show: 'June 9 (Show 2)', holders: ['Mitch (4 tickets)', 'Mark (3 tickets)'] },
  { show: 'June 13 (Show 3)', holders: ['Tom & Dawn (2 tickets)', 'Mitch (3 tickets via Stew)'] },
];

const DINNER_RECS = [
  {
    name: 'Palmilla Cocina y Tequila',
    type: 'Upscale Mexican',
    price: '$$$',
    distance: '0.3 mi',
    rating: '4.5',
    reviews: '2.4k',
    url: 'https://www.palmillarestaurant.com',
    note: 'Premium tequilas, heated patio, steps from the pier. Has vegan & GF options. Handles large parties — contact their Events Manager.',
  },
  {
    name: 'Barsha',
    type: 'North African / Mediterranean',
    price: '$$',
    distance: '0.5 mi',
    rating: '4.8',
    reviews: '356',
    url: 'https://www.barshawine.com',
    note: 'Tunisian-inspired small plates. Tons of vegan options (cauliflower, chickpeas, shakshuka). Great wine list from their own wine shop. Chill vibe.',
  },
  {
    name: 'RYLA',
    type: 'Asian Fusion / Seafood',
    price: '$$$',
    distance: '0.1 mi',
    rating: '4.6',
    reviews: '571',
    url: 'https://www.rylarestaurant.com',
    note: 'Michelin-recognized. Inventive seafood & cocktails. Has vegan & GF options. Lively coastal atmosphere, splashy spot.',
  },
  {
    name: 'The Hook & Plow',
    type: 'Farm-to-Table American',
    price: '$$',
    distance: '0.3 mi',
    rating: '4.4',
    reviews: '756',
    url: 'https://www.hookandplow.com',
    note: 'Farm-to-table on Pier Ave. Lots of vegan & GF options (kale quinoa salad, crispy tofu). Craft beers on tap.',
  },
  {
    name: 'True Food Kitchen',
    type: 'Health-Conscious American',
    price: '$$',
    distance: '3.2 mi',
    rating: '4.1',
    reviews: '1.5k',
    url: 'https://www.truefoodkitchen.com',
    note: 'In El Segundo. Menu clearly marked for vegan & GF. Built for dietary needs — Mitch-approved. Good for groups.',
  },
  {
    name: 'The Strand House',
    type: 'Upscale American / Seafood',
    price: '$$$$',
    distance: '1.2 mi',
    rating: '4.5',
    reviews: '2.8k',
    url: 'https://www.thestrandhousemb.com',
    note: 'Best view in Manhattan Beach. Famous craft cocktails & wine program. Upscale splurge option. $75/person deposit for reservations.',
  },
  {
    name: 'Bottle Inn',
    type: 'Classic Italian',
    price: '$$$',
    distance: '0.4 mi',
    rating: '4.5',
    reviews: '497',
    url: 'https://www.bottleinn.com',
    note: 'Est. 1974. Cozy, romantic. Wine cellar fits up to 20 guests — perfect for the group. Italian classics, limited vegan but GF pasta available.',
  },
];

const TRIP_MEMBERS = [
  'Stew', 'Mitch', 'Tom', 'Dawn', 'Mark',
  'Matt R', 'Sam', 'Kirk', 'Matt E', 'Dave',
];

// ===== COUNTDOWN TIMER LOGIC =====
const SHOW_DATES = [
  { label: 'Show 1 — June 7', date: new Date('2026-06-07T20:00:00-07:00') },
  { label: 'Show 2 — June 9', date: new Date('2026-06-09T20:00:00-07:00') },
  { label: 'Show 3 — June 13', date: new Date('2026-06-13T20:00:00-07:00') },
];

function getCountdown(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${d}d ${h}h ${m}m ${s}s`;
}

// ===== RUSH ALBUMS =====
const RUSH_ALBUMS = [
  { id: 'rush', name: 'Rush', year: 1974, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Rush_self_titled.jpg/250px-Rush_self_titled.jpg' },
  { id: 'fly-by-night', name: 'Fly by Night', year: 1975, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Rush_Fly_by_Night.jpg/250px-Rush_Fly_by_Night.jpg' },
  { id: 'caress-of-steel', name: 'Caress of Steel', year: 1975, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/Rush_Caress_of_Steel.jpg/250px-Rush_Caress_of_Steel.jpg' },
  { id: '2112', name: '2112', year: 1976, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Rush_2112.jpg/250px-Rush_2112.jpg' },
  { id: 'farewell-to-kings', name: 'A Farewell to Kings', year: 1977, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Rush_A_Farewell_to_Kings.jpg/250px-Rush_A_Farewell_to_Kings.jpg' },
  { id: 'hemispheres', name: 'Hemispheres', year: 1978, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Rush_Hemispheres.jpg/250px-Rush_Hemispheres.jpg' },
  { id: 'permanent-waves', name: 'Permanent Waves', year: 1980, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Rush_Permanent_Waves.jpg/250px-Rush_Permanent_Waves.jpg' },
  { id: 'moving-pictures', name: 'Moving Pictures', year: 1981, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Moving_Pictures.jpg/250px-Moving_Pictures.jpg' },
  { id: 'signals', name: 'Signals', year: 1982, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Rush_Signals.jpg/250px-Rush_Signals.jpg' },
  { id: 'grace-under-pressure', name: 'Grace Under Pressure', year: 1984, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/66/Rush_Grace_Under_Pressure.jpg/250px-Rush_Grace_Under_Pressure.jpg' },
  { id: 'power-windows', name: 'Power Windows', year: 1985, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/Rush_Power_Windows.jpg/250px-Rush_Power_Windows.jpg' },
  { id: 'hold-your-fire', name: 'Hold Your Fire', year: 1987, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Rush_Hold_Your_Fire.jpg/250px-Rush_Hold_Your_Fire.jpg' },
  { id: 'presto', name: 'Presto', year: 1989, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Rush_Presto.jpg/250px-Rush_Presto.jpg' },
  { id: 'roll-the-bones', name: 'Roll the Bones', year: 1991, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Rush_roll_the_bones.jpg/250px-Rush_roll_the_bones.jpg' },
  { id: 'counterparts', name: 'Counterparts', year: 1993, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Rush_Counterparts.jpg/250px-Rush_Counterparts.jpg' },
  { id: 'test-for-echo', name: 'Test for Echo', year: 1996, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Rush_Test_for_Echo.jpg/250px-Rush_Test_for_Echo.jpg' },
  { id: 'vapor-trails', name: 'Vapor Trails', year: 2002, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/85/Rush_Vapor_Trails.jpg/250px-Rush_Vapor_Trails.jpg' },
  { id: 'snakes-and-arrows', name: 'Snakes & Arrows', year: 2007, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Snakesandarrows.jpg/250px-Snakesandarrows.jpg' },
  { id: 'clockwork-angels', name: 'Clockwork Angels', year: 2012, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Rush_Clockwork_Angels_artwork.png/250px-Rush_Clockwork_Angels_artwork.png' },
];

const STAR_BUDGET = 40;

function getAlbumRatings(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('rushbot-album-ratings') || '{}');
  } catch { return {}; }
}

function saveAlbumRatings(ratings: Record<string, number>) {
  localStorage.setItem('rushbot-album-ratings', JSON.stringify(ratings));
}

function getStarsUsed(ratings: Record<string, number>): number {
  return Object.values(ratings).reduce((sum, r) => sum + r, 0);
}

function getSetlistVotes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('rushbot-setlist-votes') || '{}');
  } catch { return {}; }
}

function toggleSetlistVote(title: string) {
  const votes = getSetlistVotes();
  if (votes[title]) delete votes[title];
  else votes[title] = true;
  localStorage.setItem('rushbot-setlist-votes', JSON.stringify(votes));
  return { ...votes };
}

const LIKELIHOOD_ORDER: SetlistSong['likelihood'][] = ['guaranteed', 'likely', 'deep-cut', 'dream'];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ===== RENDER MESSAGE WITH IMAGES =====
function renderMessageContent(content: string) {
  // Replace special token with image markdown (fallback injection)
  const processed = content.replace(/\{\{MITCHS_DREAM\}\}/g, '![Mitch\'s Dream](/images/mitchs-dream.png)');

  // Split on markdown image pattern: ![alt](url)
  const imageRegex = /(!\[[^\]]*\]\([^)]+\))/g;
  const parts = processed.split(imageRegex);

  return parts.map((part, i) => {
    // Check if this part is an image
    const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      return (
        <img
          key={i}
          src={imgMatch[2]}
          alt={imgMatch[1]}
          className="message-image"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      );
    }
    // Render text with newlines
    return (
      <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
        {part}
      </span>
    );
  });
}

// ===== LOGIN COMPONENT =====
function LoginPage({ onLogin }: { onLogin: (name: string) => void }) {
  const [password, setPassword] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const quote = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86400000) % RUSH_QUOTES.length;
    return RUSH_QUOTES[dayIndex];
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedName) { setError('Pick your name!'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, name: selectedName }),
      });

      const data = await res.json();

      if (data.success) {
        onLogin(selectedName);
      } else {
        setError(data.error || 'Wrong password');
        setPassword('');
      }
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/images/rush-logo.png" alt="Rush" className="login-logo" />
        <h1>RushBot</h1>
        <p className="subtitle">
          Your personal Alex Lifeson chatbot<br />
          for the Rush LA Trip — June 2026
        </p>
        <div className="quote-container">
          <p className="quote-text">&ldquo;{quote.text}&rdquo;</p>
          <p className="quote-source">— {quote.source}</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="name-picker">
            <label className="name-picker-label">Who are you?</label>
            <div className="name-chips">
              {TRIP_MEMBERS.map(name => (
                <button
                  key={name}
                  type="button"
                  className={`name-chip ${selectedName === name ? 'selected' : ''}`}
                  onClick={() => setSelectedName(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <input
            type="password"
            className="login-input"
            placeholder="Enter the password, man..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            disabled={loading}
          />
          {error && <p className="login-error">{error}</p>}
          <button
            type="submit"
            className="login-button"
            disabled={loading || !password || !selectedName}
          >
            {loading ? 'Checking...' : 'Enter the Limelight'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ===== CHAT COMPONENT =====
function ChatPage({ onLogout, currentUser }: { onLogout: () => void; currentUser: string }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('rushbot-chat-history') || '[]');
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdowns, setCountdowns] = useState<(string | null)[]>([]);
  const [showAlbumPolls, setShowAlbumPolls] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [itineraryTab, setItineraryTab] = useState<'schedule' | 'tickets'>('schedule');
  const [showDinnerRecs, setShowDinnerRecs] = useState(false);
  const [albumRatings, setAlbumRatings] = useState<Record<string, number>>({});
  const [allUserRatings, setAllUserRatings] = useState<Record<string, Record<string, number>>>({});
  const [albumTab, setAlbumTab] = useState<'rate' | 'results'>('rate');
  const [showSetlist, setShowSetlist] = useState(false);
  const [setlistVotes, setSetlistVotes] = useState<Record<string, boolean>>({});
  // Photo gallery
  const [showPhotos, setShowPhotos] = useState(false);
  const [photos, setPhotos] = useState<Array<{ url: string; show: string; uploadedAt: string; filename: string }>>([]);
  const [photoFilter, setPhotoFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploadShow, setUploadShow] = useState('general');
  // Post-show recap
  const [actualSetlists, setActualSetlists] = useState<Record<string, string[]>>({});
  const [showRecap, setShowRecap] = useState<string | null>(null);
  const [setlistDraft, setSetlistDraft] = useState('');
  // Rush Bingo
  const [showBingo, setShowBingo] = useState(false);
  const [bingoTab, setBingoTab] = useState<'pick' | 'everyone'>('pick');
  const [bingoPicks, setBingoPicks] = useState<string[]>([]);
  const [bingoFirst, setBingoFirst] = useState<string | null>(null);
  const [bingoLast, setBingoLast] = useState<string | null>(null);
  const [bingoAlbumFilter, setBingoAlbumFilter] = useState<string>('All');
  const [bingoSearch, setBingoSearch] = useState('');
  const [allBingoPicks, setAllBingoPicks] = useState<Record<string, BingoPick>>({});
  const [bingoSaving, setBingoSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('rushbot-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  const fetchAllRatings = () => {
    fetch('/api/album-ratings').then(r => r.ok ? r.json() : {}).then(setAllUserRatings).catch(() => {});
  };

  const fetchAllBingoPicks = () => {
    fetch('/api/bingo-picks').then(r => r.ok ? r.json() : {}).then(setAllBingoPicks).catch(() => {});
  };

  useEffect(() => {
    setAlbumRatings(getAlbumRatings());
    setSetlistVotes(getSetlistVotes());
    fetch('/api/setlist-recap').then(r => r.ok ? r.json() : {}).then(setActualSetlists).catch(() => {});
    fetchAllRatings();
    fetchAllBingoPicks();
  }, []);

  const starsUsed = getStarsUsed(albumRatings);
  const starsRemaining = STAR_BUDGET - starsUsed;

  const handleAlbumRate = (albumId: string, rating: number) => {
    const currentRating = albumRatings[albumId] || 0;
    const newRating = rating === currentRating ? 0 : rating;
    const cost = newRating - currentRating;
    if (cost > starsRemaining) return;
    const updated = { ...albumRatings, [albumId]: newRating };
    saveAlbumRatings(updated);
    setAlbumRatings(updated);
    fetch('/api/album-ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser, ratings: updated }),
    }).then(() => fetchAllRatings()).catch(() => {});
  };

  const handleSetlistVote = (title: string) => {
    const updated = toggleSetlistVote(title);
    setSetlistVotes(updated);
  };

  // Photo handlers
  const fetchPhotos = async (filter?: string) => {
    const url = filter && filter !== 'all' ? `/api/photos?show=${filter}` : '/api/photos';
    const res = await fetch(url);
    if (res.ok) setPhotos(await res.json());
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('show', uploadShow);
      const res = await fetch('/api/photos', { method: 'POST', body: formData });
      if (res.ok) {
        await fetchPhotos(photoFilter);
      }
    } catch {
      // upload failed silently
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const openPhotosForShow = (showKey: string) => {
    setPhotoFilter(showKey);
    setShowPhotos(true);
    fetchPhotos(showKey);
  };

  // Setlist recap handlers
  const handleSetlistSave = async (show: string) => {
    const songs = setlistDraft.split('\n').map(s => s.trim()).filter(Boolean);
    if (songs.length === 0) return;
    const res = await fetch('/api/setlist-recap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show, songs }),
    });
    if (res.ok) {
      setActualSetlists(prev => ({ ...prev, [show]: songs }));
      setShowRecap(null);
      setSetlistDraft('');
    }
  };

  const openRecap = (showKey: string) => {
    setShowRecap(showKey);
    setSetlistDraft(actualSetlists[showKey]?.join('\n') || '');
  };

  const openBingo = async () => {
    setShowBingo(true);
    try {
      const res = await fetch('/api/bingo-picks');
      if (res.ok) {
        const data = await res.json();
        setAllBingoPicks(data);
        const myPicks = data[currentUser.toLowerCase().trim()];
        if (myPicks) {
          setBingoPicks(myPicks.songs);
          setBingoFirst(myPicks.firstSong);
          setBingoLast(myPicks.lastSong);
        }
      }
    } catch {
      // fetch failed, use existing state
    }
  };

  const toggleBingoPick = (title: string) => {
    setBingoPicks(prev => {
      if (prev.includes(title)) {
        const removed = prev.filter(s => s !== title);
        if (bingoFirst === title) setBingoFirst(null);
        if (bingoLast === title) setBingoLast(null);
        return removed;
      }
      if (prev.length >= 20) return prev;
      return [...prev, title];
    });
  };

  const saveBingoPicks = async () => {
    setBingoSaving(true);
    try {
      const res = await fetch('/api/bingo-picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser,
          picks: { songs: bingoPicks, firstSong: bingoFirst, lastSong: bingoLast },
        }),
      });
      if (res.ok) {
        setAllBingoPicks(prev => ({
          ...prev,
          [currentUser.toLowerCase().trim()]: {
            songs: bingoPicks,
            firstSong: bingoFirst,
            lastSong: bingoLast,
            updatedAt: new Date().toISOString(),
          },
        }));
      }
    } catch {
      // save failed
    } finally {
      setBingoSaving(false);
    }
  };

  const filteredBingoSongs = RUSH_DISCOGRAPHY.filter(song => {
    const matchesAlbum = bingoAlbumFilter === 'All' || song.album === bingoAlbumFilter;
    const matchesSearch = !bingoSearch || song.title.toLowerCase().includes(bingoSearch.toLowerCase());
    return matchesAlbum && matchesSearch;
  });

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('rushbot-chat-history');
  };

  // Countdown timer
  useEffect(() => {
    const tick = () => setCountdowns(SHOW_DATES.map(s => getCountdown(s.date)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    onLogout();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        // Add empty assistant message
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantContent += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Whoa, something went wrong with my amp! Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "Where are we staying?",
    "Who has tickets for June 7th?",
    "What's your favorite guitar?",
    "Tell me about 2112",
    "Quiz me on Rush!",
    "What should we do near Hermosa Beach?",
  ];

  return (
    <div className="chat-container">
      {/* Shadow Band Photos */}
      <div className="shadow-photos" aria-hidden="true">
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Rush-in-concert.jpg" alt="" className="shadow-photo photo-1" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Alex_Lifeson_%285902592720%29.jpg" alt="" className="shadow-photo photo-2" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/28/Geddy_has_a_%22Rash%22_t-shirt_%285902030723%29.jpg" alt="" className="shadow-photo photo-3" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Workin%27_Them_Angels_%285902592874%29.jpg" alt="" className="shadow-photo photo-4" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Working_Man_%285902038677%29.jpg" alt="" className="shadow-photo photo-5" />
      </div>

      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-top">
          <div className="chat-header-avatar">🎸</div>
          <div className="chat-header-info">
            <h2>Alex Lifeson</h2>
            <p>RushBot • LA Trip June 2026</p>
          </div>
          <div className="chat-header-badge">🌟 Rush</div>
          <button className="logout-button" onClick={handleLogout} title="Back to login">
            ← <span className="btn-label">Exit</span>
          </button>
        </div>
        <div className="header-actions">
          <button className="header-action-button" onClick={() => setShowAlbumPolls(true)} title="Rate Rush Albums">
            ⭐ <span className="btn-label">Albums</span>
          </button>
          <button className="header-action-button" onClick={() => setShowSetlist(true)} title="Setlist Predictions">
            🎵 <span className="btn-label">Setlist</span>
          </button>
          <button className="header-action-button" onClick={openBingo} title="Rush Bingo">
            🎯 <span className="btn-label">Bingo</span>
          </button>
          <button className="header-action-button" onClick={() => { setShowPhotos(true); fetchPhotos(); }} title="Trip Photos">
            📸 <span className="btn-label">Photos</span>
          </button>
          <button className="header-action-button" onClick={() => setShowItinerary(true)} title="Trip Schedule">
            📅 <span className="btn-label">Schedule</span>
          </button>
        </div>
      </div>

      {/* Album Rating Modal */}
      {showAlbumPolls && (
        <div className="modal-overlay" onClick={() => setShowAlbumPolls(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rush Albums</h3>
              <button className="modal-close" onClick={() => setShowAlbumPolls(false)}>✕</button>
            </div>
            <div className="album-tabs">
              <button className={`album-tab ${albumTab === 'rate' ? 'active' : ''}`} onClick={() => setAlbumTab('rate')}>
                ⭐ Rate
              </button>
              <button className={`album-tab ${albumTab === 'results' ? 'active' : ''}`} onClick={() => { setAlbumTab('results'); fetchAllRatings(); }}>
                📊 Results
              </button>
            </div>
            {albumTab === 'rate' ? (
              <>
                <div className="star-budget-bar">
                  <div className="star-budget-info">
                    <span className="star-budget-label">⭐ Star Budget</span>
                    <span className={`star-budget-count ${starsRemaining === 0 ? 'depleted' : starsRemaining <= 8 ? 'low' : ''}`}>
                      {starsRemaining} / {STAR_BUDGET} remaining
                    </span>
                  </div>
                  <div className="star-budget-track">
                    <div
                      className={`star-budget-fill ${starsRemaining === 0 ? 'depleted' : starsRemaining <= 8 ? 'low' : ''}`}
                      style={{ width: `${(starsUsed / STAR_BUDGET) * 100}%` }}
                    />
                  </div>
                  <p className="star-budget-hint">
                    You have {STAR_BUDGET} stars to spread across {RUSH_ALBUMS.length} albums — choose wisely!
                  </p>
                </div>
                <div className="modal-body">
                  {RUSH_ALBUMS.map(album => {
                    const rating = albumRatings[album.id] || 0;
                    return (
                      <div key={album.id} className={`album-row ${rating > 0 ? 'album-rated' : ''}`}>
                        <img
                          src={album.cover}
                          alt={album.name}
                          className="album-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="album-info">
                          <span className="album-name">{album.name}</span>
                          <span className="album-year">{album.year}</span>
                        </div>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map(star => {
                            const wouldCost = star - rating;
                            const canAfford = wouldCost <= starsRemaining || star <= rating;
                            return (
                              <button
                                key={star}
                                className={`star ${star <= rating ? 'filled' : ''} ${!canAfford ? 'disabled' : ''}`}
                                onClick={() => handleAlbumRate(album.id, star)}
                                disabled={!canAfford}
                              >
                                ★
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="modal-body results-body">
                {(() => {
                  const users = Object.entries(allUserRatings);
                  if (users.length === 0) return <p className="results-empty">No one has rated yet — be the first!</p>;

                  const albumScores: Record<string, { total: number; count: number }> = {};
                  RUSH_ALBUMS.forEach(a => { albumScores[a.id] = { total: 0, count: 0 }; });
                  users.forEach(([, ratings]) => {
                    Object.entries(ratings).forEach(([id, score]) => {
                      if (albumScores[id]) {
                        albumScores[id].total += score;
                        albumScores[id].count += 1;
                      }
                    });
                  });

                  const rankedAlbums = RUSH_ALBUMS
                    .map(a => ({ ...a, avg: albumScores[a.id].count > 0 ? albumScores[a.id].total / albumScores[a.id].count : 0, total: albumScores[a.id].total }))
                    .sort((a, b) => b.total - a.total);

                  return (
                    <>
                      <div className="results-section">
                        <h4 className="results-heading">🏆 Group Rankings</h4>
                        <p className="results-subtitle">{users.length} {users.length === 1 ? 'person has' : 'people have'} voted</p>
                        {rankedAlbums.filter(a => a.total > 0).map((album, i) => (
                          <div key={album.id} className="results-album-row">
                            <span className="results-rank">#{i + 1}</span>
                            <img src={album.cover} alt={album.name} className="album-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <div className="album-info">
                              <span className="album-name">{album.name}</span>
                              <span className="album-year">{album.year}</span>
                            </div>
                            <div className="results-score">
                              <span className="results-stars">{'★'.repeat(Math.round(album.avg))}</span>
                              <span className="results-avg">{album.avg.toFixed(1)} avg</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="results-section">
                        <h4 className="results-heading">👤 Everyone&apos;s Top 5</h4>
                        {users.map(([name, ratings]) => {
                          const top5 = Object.entries(ratings)
                            .filter(([, s]) => s > 0)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5);
                          if (top5.length === 0) return null;
                          return (
                            <div key={name} className="user-top5">
                              <h5 className="user-top5-name">{name.charAt(0).toUpperCase() + name.slice(1)}</h5>
                              {top5.map(([albumId, score], j) => {
                                const album = RUSH_ALBUMS.find(a => a.id === albumId);
                                return (
                                  <div key={albumId} className="user-top5-row">
                                    <span className="results-rank">#{j + 1}</span>
                                    <span className="user-top5-album">{album?.name || albumId}</span>
                                    <span className="user-top5-stars">{'★'.repeat(score)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Setlist Predictions Modal */}
      {showSetlist && (
        <div className="modal-overlay" onClick={() => setShowSetlist(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Setlist Predictions</h3>
              <button className="modal-close" onClick={() => setShowSetlist(false)}>✕</button>
            </div>
            <div className="modal-body">
              {LIKELIHOOD_ORDER.map(likelihood => {
                const songs = SETLIST_SONGS.filter(s => s.likelihood === likelihood);
                return (
                  <div key={likelihood} className="setlist-group">
                    <div className={`setlist-group-label likelihood-${likelihood}`}>
                      {LIKELIHOOD_LABELS[likelihood]}
                    </div>
                    {songs.map(song => (
                      <div key={song.title} className="setlist-song">
                        <div className="song-info">
                          <span className="song-title">{song.title}</span>
                          <span className="song-album">{song.album}</span>
                        </div>
                        <button
                          className={`song-vote-btn ${setlistVotes[song.title] ? 'voted' : ''}`}
                          onClick={() => handleSetlistVote(song.title)}
                          title="Want to hear this!"
                        >
                          ♥
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Modal */}
      {showItinerary && (
        <div className="modal-overlay" onClick={() => setShowItinerary(false)}>
          <div className="modal-content itinerary-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Trip Schedule</h3>
              <button className="modal-close" onClick={() => setShowItinerary(false)}>✕</button>
            </div>
            <div className="itinerary-tabs">
              <button
                className={`itinerary-tab ${itineraryTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setItineraryTab('schedule')}
              >
                📅 Schedule
              </button>
              <button
                className={`itinerary-tab ${itineraryTab === 'tickets' ? 'active' : ''}`}
                onClick={() => setItineraryTab('tickets')}
              >
                🎟️ Tickets
              </button>
            </div>
            <div className="modal-body">
              {itineraryTab === 'schedule' ? (
                <div className="itinerary-timeline">
                  {ITINERARY.map((day, di) => (
                    <div key={di} className={`itinerary-day ${day.highlight ? 'show-day' : ''}`}>
                      <div className="itinerary-day-header">
                        <span className="itinerary-date">{day.date}</span>
                        <span className={`itinerary-day-label ${day.highlight ? 'show-label' : ''}`}>{day.label}</span>
                      </div>
                      <div className="itinerary-events">
                        {day.events.map((ev, ei) => (
                          <div key={ei} className={`itinerary-event ${ev.highlight ? 'event-highlight' : ''}`}>
                            <span className="event-icon">{ev.icon}</span>
                            <span className="event-time">{ev.time}</span>
                            <span className="event-desc">
                              {ev.desc}
                              {ev.link === 'dinner-recs' && (
                                <button className="event-link-btn" onClick={() => setShowDinnerRecs(true)}>
                                  🍽️ Recommendations
                                </button>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ticket-info">
                  {TICKET_INFO.map((show, si) => (
                    <div key={si} className="ticket-show">
                      <h4 className="ticket-show-title">{show.show}</h4>
                      <ul className="ticket-holders">
                        {show.holders.map((h, hi) => (
                          <li key={hi}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="ticket-note">
                    <p>Talk to your ticket holder if you need details!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dinner Recommendations Modal */}
      {showDinnerRecs && (
        <div className="modal-overlay" onClick={() => setShowDinnerRecs(false)}>
          <div className="modal-content dinner-recs-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Dinner Spots</h3>
              <button className="modal-close" onClick={() => setShowDinnerRecs(false)}>✕</button>
            </div>
            <div className="dinner-recs-note">
              Group of 10 • Vegan options for Mitch • Gluten-free friendly • Within 10 mi of house
            </div>
            <div className="modal-body">
              {DINNER_RECS.map((rec, i) => (
                <div key={i} className="dinner-rec-card">
                  <div className="dinner-rec-header">
                    <span className="dinner-rec-name">{rec.name}</span>
                    <span className="dinner-rec-price">{rec.price}</span>
                  </div>
                  <div className="dinner-rec-meta">
                    <span className="dinner-rec-type">{rec.type}</span>
                    <span className="dinner-rec-dot">•</span>
                    <span className="dinner-rec-distance">{rec.distance}</span>
                    <span className="dinner-rec-dot">•</span>
                    <span className="dinner-rec-rating">⭐ {rec.rating} ({rec.reviews})</span>
                  </div>
                  <p className="dinner-rec-note">{rec.note}</p>
                  <a href={rec.url} target="_blank" rel="noopener noreferrer" className="dinner-rec-link">🔗 View Menu & Website</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {showPhotos && (
        <div className="modal-overlay" onClick={() => { setShowPhotos(false); setSelectedPhoto(null); }}>
          <div className="modal-content photo-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Trip Photos</h3>
              <button className="modal-close" onClick={() => { setShowPhotos(false); setSelectedPhoto(null); }}>✕</button>
            </div>
            <div className="photo-toolbar">
              <div className="photo-filter-tabs">
                {['all', 'general', 'show-1', 'show-2', 'show-3'].map(f => (
                  <button
                    key={f}
                    className={`photo-filter-tab ${photoFilter === f ? 'active' : ''}`}
                    onClick={() => { setPhotoFilter(f); fetchPhotos(f); }}
                  >
                    {f === 'all' ? 'All' : f === 'general' ? 'General' : `Show ${f.split('-')[1]}`}
                  </button>
                ))}
              </div>
              <div className="photo-upload-row">
                <select
                  className="photo-show-select"
                  value={uploadShow}
                  onChange={e => setUploadShow(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="show-1">Show 1</option>
                  <option value="show-2">Show 2</option>
                  <option value="show-3">Show 3</option>
                </select>
                <label className="photo-upload-btn">
                  {uploading ? 'Uploading...' : '📷 Camera'}
                  <input type="file" accept="image/*" capture="environment" hidden onChange={handlePhotoUpload} disabled={uploading} />
                </label>
                <label className="photo-upload-btn">
                  {uploading ? 'Uploading...' : '📁 Gallery'}
                  <input type="file" accept="image/*,.heic,.heif" hidden onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <div className="modal-body">
              {selectedPhoto ? (
                <div className="photo-fullsize">
                  <button className="photo-back-btn" onClick={() => setSelectedPhoto(null)}>← Back</button>
                  <img src={selectedPhoto} alt="Full size" className="photo-full-img" />
                </div>
              ) : (
                <div className="photo-grid">
                  {photos.map((photo, i) => (
                    <div key={i} className="photo-thumb" onClick={() => setSelectedPhoto(photo.url)}>
                      <img src={photo.url} alt={photo.filename} />
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <p className="photo-empty">No photos yet. Be the first to share!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Setlist Recap Modal */}
      {showRecap && (
        <div className="modal-overlay" onClick={() => { setShowRecap(null); setSetlistDraft(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Setlist — {SHOW_DATES[parseInt(showRecap.split('-')[1]) - 1]?.label}</h3>
              <button className="modal-close" onClick={() => { setShowRecap(null); setSetlistDraft(''); }}>✕</button>
            </div>
            <div className="modal-body">
              {actualSetlists[showRecap] && actualSetlists[showRecap].length > 0 ? (
                <>
                  <ol className="setlist-recap-list">
                    {actualSetlists[showRecap].map((song, i) => (
                      <li key={i}>{song}</li>
                    ))}
                  </ol>
                  <button
                    className="recap-edit-btn"
                    onClick={() => setSetlistDraft(actualSetlists[showRecap].join('\n'))}
                    style={{ marginTop: '12px' }}
                  >
                    ✏️ Edit Setlist
                  </button>
                  {setlistDraft && (
                    <>
                      <textarea
                        className="setlist-recap-textarea"
                        value={setlistDraft}
                        onChange={e => setSetlistDraft(e.target.value)}
                        placeholder="One song per line..."
                        style={{ marginTop: '12px' }}
                      />
                      <button className="setlist-save-btn" onClick={() => handleSetlistSave(showRecap)}>
                        Save Setlist
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '14px' }}>
                    No setlist recorded yet. Add the songs that were played!
                  </p>
                  <textarea
                    className="setlist-recap-textarea"
                    value={setlistDraft}
                    onChange={e => setSetlistDraft(e.target.value)}
                    placeholder="One song per line...&#10;Tom Sawyer&#10;The Spirit of Radio&#10;YYZ"
                  />
                  <button className="setlist-save-btn" onClick={() => handleSetlistSave(showRecap)}>
                    Save Setlist
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rush Bingo Modal */}
      {showBingo && (
        <div className="modal-overlay" onClick={() => setShowBingo(false)}>
          <div className="modal-content bingo-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rush Bingo</h3>
              <button className="modal-close" onClick={() => setShowBingo(false)}>✕</button>
            </div>
            <div className="album-tabs">
              <button className={`album-tab ${bingoTab === 'pick' ? 'active' : ''}`} onClick={() => setBingoTab('pick')}>
                🎯 My Picks
              </button>
              <button className={`album-tab ${bingoTab === 'everyone' ? 'active' : ''}`} onClick={() => setBingoTab('everyone')}>
                👥 Everyone
              </button>
            </div>

            {bingoTab === 'pick' ? (
              <>
                <div className="bingo-status-bar">
                  <div className="bingo-count">
                    <span className="bingo-count-label">Setlist Picks</span>
                    <span className={`bingo-count-value ${bingoPicks.length === 20 ? 'full' : ''}`}>
                      {bingoPicks.length} / 20
                    </span>
                  </div>
                  <div className="bingo-tags">
                    <span className={`bingo-tag ${bingoFirst ? 'set' : ''}`}>
                      1st: {bingoFirst || '—'}
                    </span>
                    <span className={`bingo-tag ${bingoLast ? 'set' : ''}`}>
                      Last: {bingoLast || '—'}
                    </span>
                  </div>
                </div>

                {bingoPicks.length > 0 && (
                  <div className="bingo-my-picks">
                    <div className="bingo-picks-header">
                      <span>Your Setlist</span>
                      <button className="bingo-save-btn" onClick={saveBingoPicks} disabled={bingoSaving}>
                        {bingoSaving ? 'Saving...' : 'Save Picks'}
                      </button>
                    </div>
                    <div className="bingo-picks-list">
                      {bingoPicks.map((title, i) => (
                        <div key={title} className="bingo-pick-item">
                          <span className="bingo-pick-num">{i + 1}</span>
                          <span className="bingo-pick-title">{title}</span>
                          <div className="bingo-pick-actions">
                            <button
                              className={`bingo-tag-btn ${bingoFirst === title ? 'active-first' : ''}`}
                              onClick={() => setBingoFirst(bingoFirst === title ? null : title)}
                              title="Tag as first song"
                            >
                              1st
                            </button>
                            <button
                              className={`bingo-tag-btn ${bingoLast === title ? 'active-last' : ''}`}
                              onClick={() => setBingoLast(bingoLast === title ? null : title)}
                              title="Tag as last song"
                            >
                              Last
                            </button>
                            <button
                              className="bingo-remove-btn"
                              onClick={() => toggleBingoPick(title)}
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bingo-browser">
                  <div className="bingo-filters">
                    <input
                      className="bingo-search"
                      type="text"
                      placeholder="Search songs..."
                      value={bingoSearch}
                      onChange={e => setBingoSearch(e.target.value)}
                    />
                    <select
                      className="bingo-album-select"
                      value={bingoAlbumFilter}
                      onChange={e => setBingoAlbumFilter(e.target.value)}
                    >
                      <option value="All">All Albums</option>
                      {ALBUM_NAMES.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bingo-song-list">
                    {filteredBingoSongs.map(song => {
                      const picked = bingoPicks.includes(song.title);
                      return (
                        <div
                          key={`${song.albumId}-${song.title}`}
                          className={`bingo-song-row ${picked ? 'picked' : ''}`}
                          onClick={() => toggleBingoPick(song.title)}
                        >
                          <div className="bingo-song-info">
                            <span className="bingo-song-title">{song.title}</span>
                            <span className="bingo-song-album">{song.album} ({song.year})</span>
                          </div>
                          <span className={`bingo-check ${picked ? 'checked' : ''}`}>
                            {picked ? '✓' : '+'}
                          </span>
                        </div>
                      );
                    })}
                    {filteredBingoSongs.length === 0 && (
                      <p className="bingo-empty">No songs match your search.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="modal-body">
                {(() => {
                  const entries = Object.entries(allBingoPicks);
                  if (entries.length === 0) return <p className="results-empty">No one has made picks yet — be the first!</p>;
                  return entries.map(([name, picks]) => (
                    <div key={name} className="bingo-user-card">
                      <h4 className="bingo-user-name">{name.charAt(0).toUpperCase() + name.slice(1)}</h4>
                      <div className="bingo-user-tags">
                        {picks.firstSong && <span className="bingo-tag set">1st: {picks.firstSong}</span>}
                        {picks.lastSong && <span className="bingo-tag set">Last: {picks.lastSong}</span>}
                      </div>
                      <ol className="bingo-user-songs">
                        {picks.songs.map((song, i) => (
                          <li key={i} className={`${song === picks.firstSong ? 'bingo-first' : ''} ${song === picks.lastSong ? 'bingo-last' : ''}`}>
                            {song}
                            {song === picks.firstSong && <span className="bingo-badge first">1st</span>}
                            {song === picks.lastSong && <span className="bingo-badge last">Last</span>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Countdown Timer */}
      <div className="countdown-bar">
        {SHOW_DATES.map((show, i) => {
          const showKey = `show-${i + 1}`;
          const isPast = show.date.getTime() < Date.now();

          return (
          <div key={i} className={`countdown-item ${isPast ? 'show-rocked' : ''}`}>
            <span className="countdown-label">{show.label}</span>
            {isPast ? (
              <div className="rocked-recap">
                <span className="rocked-badge">✅ ROCKED!</span>
                <div className="rocked-actions">
                  <button className="recap-btn" onClick={() => openRecap(showKey)}>
                    📋 Setlist
                  </button>
                  <button className="recap-btn" onClick={() => openPhotosForShow(showKey)}>
                    📸 Photos
                  </button>
                </div>
              </div>
            ) : (
              <span className="countdown-value">
                {countdowns[i] ?? '🤘 ROCKED!'}
              </span>
            )}
          </div>
          );
        })}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-container">
            <img src="/images/rush-logo.png" alt="Rush" className="welcome-logo" />
            <h2>Hey! It&apos;s Lerxst!</h2>
            <p>
              Welcome to the Rush LA Trip chatbot. Ask me about the trip details,
              tickets, housing — or anything about Rush. I&apos;ve been doing this
              for about 50 years, so I know a thing or two!
            </p>
            <div className="suggestion-chips">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="suggestion-chip"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'assistant' ? '🎸' : '👤'}
                </div>
                <div className="message-bubble">{renderMessageContent(msg.content)}</div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="typing-indicator">
                <div className="message-avatar">🎸</div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          {messages.length > 0 && (
            <button className="clear-chat-button" onClick={clearChat} title="New conversation">
              +
            </button>
          )}
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask Alex anything about Rush or the LA trip..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="chat-send-button"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setAuthenticated(true);
          setCurrentUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <>
        <div className="starfield" />
        <div className="login-container">
          <div className="login-card">
            <span className="logo-emoji">🎸</span>
            <h1>RushBot</h1>
            <p className="subtitle">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="starfield" />
      {authenticated ? (
        <ChatPage onLogout={() => { setAuthenticated(false); setCurrentUser(''); }} currentUser={currentUser} />
      ) : (
        <LoginPage onLogin={(name) => { setAuthenticated(true); setCurrentUser(name); }} />
      )}
    </>
  );
}
