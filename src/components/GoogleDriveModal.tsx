/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Search,
  Plus,
  ExternalLink,
  Trash2,
  HardDrive,
  LogOut,
  Loader2,
  File,
  CheckCircle2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { VibeConfig } from '../types.ts';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/driveAuth.ts';
import {
  listDriveFiles,
  searchDriveFiles,
  createQuickNoteFile,
  deleteDriveFile,
  DriveFile,
} from '../services/driveService.ts';

interface GoogleDriveModalProps {
  isOpen: boolean;
  vibe: VibeConfig;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  vibe,
  onClose,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      const data = await listDriveFiles();
      setFiles(data);
    } catch (err: any) {
      console.error('[GoogleDriveModal] Load error:', err);
      setStatusMessage(err?.message || 'Failed to load Drive files');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      loadFiles();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await loadFiles();
      }
    } catch (err: any) {
      console.error('[GoogleDriveModal] Sign-in error:', err);
      setStatusMessage(err?.message || 'Sign in failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setFiles([]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      await loadFiles();
      return;
    }
    setIsLoadingFiles(true);
    try {
      const results = await searchDriveFiles(searchQuery.trim());
      setFiles(results);
    } catch (err: any) {
      setStatusMessage(err?.message || 'Search failed');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    setIsCreatingNote(true);
    setStatusMessage(null);
    try {
      const newFile = await createQuickNoteFile(noteTitle.trim(), noteContent);
      setNoteTitle('');
      setNoteContent('');
      setShowNoteForm(false);
      setStatusMessage(`Created "${newFile.name}" in Google Drive!`);
      await loadFiles();
    } catch (err: any) {
      setStatusMessage(err?.message || 'Failed to create note in Drive');
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleDelete = async (file: DriveFile) => {
    try {
      const deleted = await deleteDriveFile(file.id, file.name);
      if (deleted) {
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
        setStatusMessage(`Deleted "${file.name}"`);
      }
    } catch (err: any) {
      setStatusMessage(err?.message || 'Failed to delete file');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl text-white max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border font-mono font-bold text-sm"
              style={{
                borderColor: `${vibe.primary}55`,
                backgroundColor: `${vibe.primary}20`,
                color: vibe.primary,
              }}
            >
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 id="drive-modal-title" className="text-base font-bold font-mono tracking-wider uppercase">
                Google Drive
              </h2>
              <span className="text-xs text-slate-400">
                {user ? user.email : 'Connect your Google Drive files'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center justify-between">
              <span>{statusMessage}</span>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!token ? (
            /* Sign in section with official Google button */
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <HardDrive className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-sm font-bold text-white">
                  Access Your Drive Files
                </h3>
                <p className="text-xs text-slate-400">
                  Sign in with your Google account to view files, create notes, and let Zoya assist you with your Drive.
                </p>
              </div>

              {/* Official Google Sign-in Button */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white text-slate-800 font-medium text-xs shadow-lg hover:bg-slate-100 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : (
            /* Logged in Drive controls */
            <>
              {/* User toolbar */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                      {user?.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <span className="text-xs text-white font-medium truncate max-w-[150px]">
                    {user?.displayName || user?.email}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    title="Sign out"
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* New note form */}
              {showNoteForm && (
                <form
                  onSubmit={handleCreateNote}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 animate-in fade-in"
                >
                  <span className="text-xs font-bold text-white block">
                    Save Note to Google Drive
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Note title (e.g. Ideas)..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-white/10 bg-black text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <textarea
                    rows={3}
                    placeholder="Note content..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-white/10 bg-black text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNoteForm(false)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingNote}
                      className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingNote ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Save Note</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search files in Drive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-white/10 bg-black text-white text-xs font-sans focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Files List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Recent Files
                </span>
                {isLoadingFiles ? (
                  <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                    <span className="text-xs font-mono">Loading Drive files...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono">
                    No files found in Drive.
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate max-w-[220px]">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {file.modifiedTime
                              ? new Date(file.modifiedTime).toLocaleDateString()
                              : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(file)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
