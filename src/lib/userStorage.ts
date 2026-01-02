const USER_STORAGE_KEY = "currentUser";
const USERS_STORAGE_KEY = "users";

export interface User {
  id: string;
  name: string;
  createdAt: string;
  lastAccessedAt: string;
}

/**
 * 現在のユーザーを取得
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load current user:", error);
    return null;
  }
}

/**
 * 現在のユーザーを設定
 */
export function setCurrentUser(user: User): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    updateUserLastAccessed(user.id);
  } catch (error) {
    console.error("Failed to save current user:", error);
  }
}

/**
 * ユーザー名でユーザーを検索または作成
 */
export function findOrCreateUser(name: string): User {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("ユーザー名を入力してください");
  }

  const users = getAllUsers();
  const existingUser = users.find((u) => u.name === trimmedName);

  if (existingUser) {
    // 既存ユーザーの最終アクセス日時を更新
    existingUser.lastAccessedAt = new Date().toISOString();
    saveAllUsers(users);
    setCurrentUser(existingUser);
    return existingUser;
  } else {
    // 新規ユーザーを作成
    const newUser: User = {
      id: crypto.randomUUID(),
      name: trimmedName,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveAllUsers(users);
    setCurrentUser(newUser);
    return newUser;
  }
}

/**
 * すべてのユーザーを取得
 */
export function getAllUsers(): User[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load users:", error);
    return [];
  }
}

/**
 * すべてのユーザーを保存
 */
function saveAllUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users:", error);
  }
}

/**
 * ユーザーの最終アクセス日時を更新
 */
function updateUserLastAccessed(userId: string): void {
  const users = getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.lastAccessedAt = new Date().toISOString();
    saveAllUsers(users);
  }
}

/**
 * ユーザーIDに基づいてデータのキーを生成
 */
export function getUserDataKey(userId: string, dataType: string): string {
  return `${dataType}_${userId}`;
}

