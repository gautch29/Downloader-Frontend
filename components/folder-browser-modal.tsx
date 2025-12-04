'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, ChevronRight, CornerLeftUp, Loader2, FolderPlus, Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FolderBrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (path: string) => void;
    initialPath: string;
}

interface FolderItem {
    name: string;
    path: string;
}

export function FolderBrowserModal({ isOpen, onClose, onSelect, initialPath }: FolderBrowserModalProps) {
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);

    // New folder state
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creatingLoading, setCreatingLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialPath) {
            setCurrentPath(initialPath);
            setHistory([]);
            loadFolders(initialPath);
            setIsCreatingFolder(false);
            setNewFolderName('');
        }
    }, [isOpen, initialPath]);

    async function loadFolders(path: string) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/paths/browse?path=${encodeURIComponent(path)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to load folders');
            }

            setFolders(data.folders);
            setCurrentPath(data.currentPath);
        } catch (err: any) {
            setError(err.message);
            setFolders([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateFolder() {
        if (!newFolderName.trim()) return;

        setCreatingLoading(true);
        try {
            const res = await fetch('/api/paths/create-folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parentPath: currentPath,
                    folderName: newFolderName.trim()
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create folder');
            }

            // Refresh folders
            await loadFolders(currentPath);
            setIsCreatingFolder(false);
            setNewFolderName('');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreatingLoading(false);
        }
    }

    function handleNavigate(path: string) {
        setHistory(prev => [...prev, currentPath]);
        loadFolders(path);
        setIsCreatingFolder(false);
    }

    function handleGoUp() {
        if (history.length > 0) {
            const previousPath = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            loadFolders(previousPath);
            setIsCreatingFolder(false);
        }
    }

    function handleSelect() {
        onSelect(currentPath);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl dark:shadow-none rounded-3xl p-0 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Folder className="h-5 w-5 text-[#0071E3] dark:text-[#0A84FF]" />
                            Browse Folders
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-0">
                    {/* Navigation Bar */}
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleGoUp}
                            disabled={history.length === 0 || loading}
                            className={cn("h-9 w-9 shrink-0 rounded-lg", history.length === 0 && "opacity-0 pointer-events-none")}
                        >
                            <CornerLeftUp className="h-4 w-4" />
                        </Button>

                        <div className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono overflow-hidden flex items-center h-9">
                            <span className="truncate direction-rtl text-zinc-600 dark:text-zinc-300 w-full" title={currentPath}>
                                {currentPath || 'Select a root path first'}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                            className={cn("h-9 w-9 shrink-0 rounded-lg", isCreatingFolder && "bg-zinc-100 dark:bg-zinc-800")}
                        >
                            <FolderPlus className="h-4 w-4 text-[#0071E3] dark:text-[#0A84FF]" />
                        </Button>
                    </div>

                    {/* New Folder Input Area */}
                    {isCreatingFolder && (
                        <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center gap-2 animate-in slide-in-from-top-2">
                            <Input
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="New folder name"
                                className="h-9 text-sm"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                            />
                            <Button
                                size="sm"
                                onClick={handleCreateFolder}
                                disabled={creatingLoading || !newFolderName.trim()}
                                className="h-9 px-3 bg-[#0071E3] hover:bg-[#0077ED]"
                            >
                                {creatingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsCreatingFolder(false)}
                                className="h-9 w-9 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Folder List */}
                    <div className="h-[350px] overflow-y-auto custom-scrollbar p-2">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-[#0071E3]" />
                            </div>
                        ) : error ? (
                            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                                <p className="text-red-500 text-sm mb-2">{error}</p>
                                <Button variant="outline" size="sm" onClick={() => loadFolders(currentPath)}>
                                    Retry
                                </Button>
                            </div>
                        ) : folders.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-sm gap-2">
                                <Folder className="h-8 w-8 opacity-20" />
                                <p>No subfolders found</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {folders.map((folder) => (
                                    <button
                                        key={folder.path}
                                        onClick={() => handleNavigate(folder.path)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all group text-left border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                                            <div className="h-8 w-8 rounded-lg bg-[#0071E3]/10 dark:bg-[#0A84FF]/10 flex items-center justify-center flex-shrink-0">
                                                <Folder className="h-4 w-4 text-[#0071E3] dark:text-[#0A84FF]" />
                                            </div>
                                            <span className="text-sm font-medium truncate text-zinc-700 dark:text-zinc-200 max-w-[300px]" title={folder.name}>
                                                {folder.name}
                                            </span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSelect} disabled={loading || !currentPath} className="rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white">
                            Select This Folder
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
