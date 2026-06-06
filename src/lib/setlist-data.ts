export interface SetlistSong {
  title: string;
  album: string;
  likelihood: 'guaranteed' | 'likely' | 'deep-cut' | 'dream';
}

export const SETLIST_SONGS: SetlistSong[] = [
  // Guaranteed — the songs they MUST play
  { title: 'Tom Sawyer', album: 'Moving Pictures', likelihood: 'guaranteed' },
  { title: 'The Spirit of Radio', album: 'Permanent Waves', likelihood: 'guaranteed' },
  { title: 'YYZ', album: 'Moving Pictures', likelihood: 'guaranteed' },
  { title: 'Limelight', album: 'Moving Pictures', likelihood: 'guaranteed' },
  { title: 'Closer to the Heart', album: 'A Farewell to Kings', likelihood: 'guaranteed' },
  { title: '2112 (Overture/Temples of Syrinx)', album: '2112', likelihood: 'guaranteed' },
  { title: 'Freewill', album: 'Permanent Waves', likelihood: 'guaranteed' },

  // Likely — strong candidates for the setlist
  { title: 'Red Barchetta', album: 'Moving Pictures', likelihood: 'likely' },
  { title: 'Subdivisions', album: 'Signals', likelihood: 'likely' },
  { title: 'The Trees', album: 'Hemispheres', likelihood: 'likely' },
  { title: 'Fly by Night', album: 'Fly by Night', likelihood: 'likely' },
  { title: 'Working Man', album: 'Rush', likelihood: 'likely' },
  { title: 'La Villa Strangiato', album: 'Hemispheres', likelihood: 'likely' },
  { title: 'Natural Science', album: 'Permanent Waves', likelihood: 'likely' },
  { title: 'Distant Early Warning', album: 'Grace Under Pressure', likelihood: 'likely' },
  { title: 'Marathon', album: 'Power Windows', likelihood: 'likely' },
  { title: 'The Big Money', album: 'Power Windows', likelihood: 'likely' },
  { title: 'Force Ten', album: 'Hold Your Fire', likelihood: 'likely' },
  { title: 'Animate', album: 'Counterparts', likelihood: 'likely' },
  { title: 'Headlong Flight', album: 'Clockwork Angels', likelihood: 'likely' },

  // Deep Cuts — would be awesome surprises
  { title: 'Xanadu', album: 'A Farewell to Kings', likelihood: 'deep-cut' },
  { title: 'Hemispheres', album: 'Hemispheres', likelihood: 'deep-cut' },
  { title: 'Jacob\'s Ladder', album: 'Permanent Waves', likelihood: 'deep-cut' },
  { title: 'The Camera Eye', album: 'Moving Pictures', likelihood: 'deep-cut' },
  { title: 'Vital Signs', album: 'Moving Pictures', likelihood: 'deep-cut' },
  { title: 'Entre Nous', album: 'Permanent Waves', likelihood: 'deep-cut' },
  { title: 'A Passage to Bangkok', album: '2112', likelihood: 'deep-cut' },
  { title: 'Bastille Day', album: 'Caress of Steel', likelihood: 'deep-cut' },
  { title: 'Something for Nothing', album: '2112', likelihood: 'deep-cut' },
  { title: 'The Analog Kid', album: 'Signals', likelihood: 'deep-cut' },
  { title: 'New World Man', album: 'Signals', likelihood: 'deep-cut' },
  { title: 'Stick It Out', album: 'Counterparts', likelihood: 'deep-cut' },
  { title: 'Far Cry', album: 'Snakes & Arrows', likelihood: 'deep-cut' },
  { title: 'The Garden', album: 'Clockwork Angels', likelihood: 'deep-cut' },

  // Dream — unlikely but we can hope
  { title: '2112 (Full Suite)', album: '2112', likelihood: 'dream' },
  { title: 'The Necromancer', album: 'Caress of Steel', likelihood: 'dream' },
  { title: 'Cygnus X-1 (Full)', album: 'A Farewell to Kings / Hemispheres', likelihood: 'dream' },
  { title: 'By-Tor and the Snow Dog', album: 'Fly by Night', likelihood: 'dream' },
  { title: 'The Fountain of Lamneth', album: 'Caress of Steel', likelihood: 'dream' },
  { title: 'Losing It', album: 'Signals', likelihood: 'dream' },
  { title: 'Tai Shan', album: 'Hold Your Fire', likelihood: 'dream' },
  { title: 'Available Light', album: 'Presto', likelihood: 'dream' },
  { title: 'Resist (acoustic)', album: 'Test for Echo', likelihood: 'dream' },
  { title: 'Witch Hunt', album: 'Moving Pictures', likelihood: 'dream' },
];

export const LIKELIHOOD_LABELS: Record<SetlistSong['likelihood'], string> = {
  guaranteed: 'Lock',
  likely: 'Likely',
  'deep-cut': 'Deep Cut',
  dream: 'Dream',
};
