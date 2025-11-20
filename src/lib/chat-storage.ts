// Utility module for managing chat threads in localStorage

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  id: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const MAX_THREADS = 50;
const THREADS_KEY_PREFIX = "depth-oracle-threads";
const LAST_THREAD_KEY_PREFIX = "depth-oracle-last-thread";

// Get storage key for user's threads
function getThreadsKey(userId: string): string {
  return `${THREADS_KEY_PREFIX}-${userId}`;
}

// Get storage key for user's last active thread
function getLastThreadKey(userId: string): string {
  return `${LAST_THREAD_KEY_PREFIX}-${userId}`;
}

// Get all threads for a user
export function getAllThreads(userId: string): ChatThread[] {
  try {
    const key = getThreadsKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    const threads = JSON.parse(stored) as ChatThread[];
    // Convert timestamp strings back to Date objects
    return threads.map((thread) => ({
      ...thread,
      messages: thread.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error("Error loading threads:", error);
    return [];
  }
}

// Get a specific thread
export function getThread(threadId: string, userId: string): ChatThread | null {
  const threads = getAllThreads(userId);
  return threads.find((t) => t.id === threadId) || null;
}

// Save all threads for a user
function saveThreads(userId: string, threads: ChatThread[]): void {
  try {
    const key = getThreadsKey(userId);
    localStorage.setItem(key, JSON.stringify(threads));
  } catch (error) {
    console.error("Error saving threads:", error);
    // Handle quota exceeded
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error(
        "LocalStorage quota exceeded. Consider deleting old threads."
      );
    }
    throw error;
  }
}

// Generate thread title from first message
export function generateThreadTitle(firstMessage: string): string {
  if (!firstMessage || firstMessage.trim().length === 0) {
    return `New Chat ${new Date().toLocaleDateString()}`;
  }

  const cleaned = firstMessage.trim();
  const maxLength = 50;

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength).trim() + "...";
}

// Create a new thread
export function createThread(userId: string, title?: string): ChatThread {
  const now = new Date().toISOString();
  const thread: ChatThread = {
    id: `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title || `New Chat ${new Date().toLocaleDateString()}`,
    messages: [],
    createdAt: now,
    updatedAt: now,
    userId,
  };

  const threads = getAllThreads(userId);

  // Check thread limit
  if (threads.length >= MAX_THREADS) {
    throw new Error(
      `Maximum of ${MAX_THREADS} threads reached. Please delete some old threads.`
    );
  }

  threads.unshift(thread); // Add to beginning
  saveThreads(userId, threads);

  // Set as last active thread
  localStorage.setItem(getLastThreadKey(userId), thread.id);

  return thread;
}

// Update an existing thread
export function updateThread(thread: ChatThread): void {
  const threads = getAllThreads(thread.userId);
  const index = threads.findIndex((t) => t.id === thread.id);

  if (index === -1) {
    throw new Error("Thread not found");
  }

  // Update timestamp
  thread.updatedAt = new Date().toISOString();

  // Auto-update title from first message if still default
  if (
    thread.messages.length > 0 &&
    (thread.title.startsWith("New Chat") || thread.title === "")
  ) {
    const firstUserMessage = thread.messages.find((m) => m.role === "user");
    if (firstUserMessage) {
      thread.title = generateThreadTitle(firstUserMessage.content);
    }
  }

  threads[index] = thread;
  saveThreads(thread.userId, threads);

  // Update last active thread
  localStorage.setItem(getLastThreadKey(thread.userId), thread.id);
}

// Delete a thread
export function deleteThread(threadId: string, userId: string): void {
  const threads = getAllThreads(userId);
  const filtered = threads.filter((t) => t.id !== threadId);

  if (filtered.length === threads.length) {
    throw new Error("Thread not found");
  }

  saveThreads(userId, filtered);

  // If deleted thread was last active, clear it
  const lastThreadId = localStorage.getItem(getLastThreadKey(userId));
  if (lastThreadId === threadId) {
    localStorage.removeItem(getLastThreadKey(userId));
  }
}

// Rename a thread
export function renameThread(
  threadId: string,
  userId: string,
  newTitle: string
): void {
  const threads = getAllThreads(userId);
  const thread = threads.find((t) => t.id === threadId);

  if (!thread) {
    throw new Error("Thread not found");
  }

  thread.title = newTitle;
  thread.updatedAt = new Date().toISOString();
  saveThreads(userId, threads);
}

// Get last active thread ID
export function getLastActiveThreadId(userId: string): string | null {
  return localStorage.getItem(getLastThreadKey(userId));
}

// Set last active thread ID
export function setLastActiveThreadId(userId: string, threadId: string): void {
  localStorage.setItem(getLastThreadKey(userId), threadId);
}

// Migrate old single-chat format to threads
export function migrateOldChatIfNeeded(userId: string): void {
  const oldKey = `depth-oracle-chat-${userId}`;
  const oldData = localStorage.getItem(oldKey);

  if (oldData) {
    try {
      const messages = JSON.parse(oldData) as Message[];
      if (messages.length > 0) {
        // Create a thread from old messages
        const thread = createThread(userId, "Migrated Chat");
        thread.messages = messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        // Auto-generate title from first message
        const firstUserMessage = messages.find((m) => m.role === "user");
        if (firstUserMessage) {
          thread.title = generateThreadTitle(firstUserMessage.content);
        }

        updateThread(thread);
      }

      // Remove old key
      localStorage.removeItem(oldKey);
    } catch (error) {
      console.error("Error migrating old chat:", error);
    }
  }
}

// Get thread count for user
export function getThreadCount(userId: string): number {
  return getAllThreads(userId).length;
}

// Check if at thread limit
export function isAtThreadLimit(userId: string): boolean {
  return getThreadCount(userId) >= MAX_THREADS;
}

// Get max threads constant
export function getMaxThreads(): number {
  return MAX_THREADS;
}
