"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  getCurrentUser,
  findOrCreateUser,
  getAllUsers,
  User,
} from "@/lib/userStorage";

interface UserLoginProps {
  onUserChange: (user: User) => void;
}

export function UserLogin({ onUserChange }: UserLoginProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      onUserChange(user);
    } else {
      setIsOpen(true);
    }
    setExistingUsers(getAllUsers());
  }, [onUserChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    try {
      const user = findOrCreateUser(userName);
      setCurrentUser(user);
      setIsOpen(false);
      setUserName("");
      setExistingUsers(getAllUsers());
      onUserChange(user);
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setIsOpen(false);
    setUserName("");
    onUserChange(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsOpen(true);
  };

  return (
    <>
      {currentUser && (
        <div className="flex items-center justify-between mb-6 neumorphic rounded-2xl p-4">
          <div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              現在のユーザー
            </p>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {currentUser.name}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm">
            切り替え
          </Button>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--text-primary)" }}>
              ユーザー名を入力
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">ユーザー名 *</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="あなたの名前を入力"
                required
                autoFocus
                list="existingUsers"
              />
              <datalist id="existingUsers">
                {existingUsers.map((user) => (
                  <option key={user.id} value={user.name} />
                ))}
              </datalist>
            </div>

            {existingUsers.length > 0 && (
              <div className="space-y-2">
                <Label>既存のユーザーから選択</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {existingUsers.map((user) => (
                    <Button
                      key={user.id}
                      type="button"
                      variant="outline"
                      onClick={() => handleSelectUser(user)}
                      className="text-sm"
                    >
                      {user.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit">開始</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

