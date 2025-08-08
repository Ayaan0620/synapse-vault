// Simple shared Notes store using localStorage + in-memory subscribers
// This keeps NotesSection and SolarSystemSection in sync without a backend.

export interface SharedNote {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt?: string;
  isStarred?: boolean;
  aiGenerated?: boolean;
}

const STORAGE_KEY = 'app_shared_notes';

type Subscriber = (notes: SharedNote[]) => void;
const subscribers: Subscriber[] = [];

export const getNotes = (): SharedNote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveNotes = (notes: SharedNote[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  subscribers.forEach((cb) => cb(notes));
};

export const upsertNote = (note: SharedNote) => {
  const notes = getNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) notes[idx] = note; else notes.unshift(note);
  saveNotes(notes);
};

export const removeNote = (id: string) => {
  const notes = getNotes().filter((n) => n.id !== id);
  saveNotes(notes);
};

export const subscribeNotes = (cb: Subscriber) => {
  subscribers.push(cb);
  return () => {
    const i = subscribers.indexOf(cb);
    if (i >= 0) subscribers.splice(i, 1);
  };
};
