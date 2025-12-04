'use client';

import { useState, useEffect } from 'react';
import { changePasswordAction, getSettingsAction } from './actions';
import { addPathShortcutAction, deletePathShortcutAction } from '../paths/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ArrowLeft, Folder, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { useI18n } from '@/lib/i18n';
import { FolderBrowserModal } from '@/components/folder-browser-modal';

export default function SettingsPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const [paths, setPaths] = useState<any[]>([]);
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);
    const [newPathName, setNewPathName] = useState('');
    const [selectedPath, setSelectedPath] = useState('');

    // Fetch settings on mount
    useEffect(() => {
        getSettingsAction().then((data) => {
            if (data) {
                if (data.paths) {
                    setPaths(data.paths);
                }
            }
        });
    }, []);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const result = await changePasswordAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else if (result?.success) {
            setSuccess(true);
            setLoading(false);
            // Clear form
            (document.getElementById('password-form') as HTMLFormElement)?.reset();
        }
    }

    async function handleDeletePath(name: string) {
        try {
            await deletePathShortcutAction(name);
            const data = await getSettingsAction();
            if (data?.paths) setPaths(data.paths);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleAddPath() {
        if (!newPathName || !selectedPath) return;
        try {
            const formData = new FormData();
            formData.append('name', newPathName);
            formData.append('path', selectedPath);
            await addPathShortcutAction(formData);

            const data = await getSettingsAction();
            if (data?.paths) setPaths(data.paths);

            setNewPathName('');
            setSelectedPath('');
            setIsBrowserOpen(false);
        } catch (err) {
            console.error(err);
        }
    }

    const { t } = useI18n();

    return (
        <div className="container mx-auto p-6 max-w-2xl animate-fade-in-up">
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('nav.back')}
                </Link>
            </div>

            <GlassCard className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                    <span className="h-8 w-1 rounded-full bg-[#0071E3] dark:bg-[#0A84FF]"></span>
                    {t('settings.password.title')}
                </h1>

                <form id="password-form" action={handleSubmit} className="space-y-6">
                    {/* Current Password */}
                    <div>
                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
                            {t('settings.password.current')}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <Input
                                name="currentPassword"
                                type="password"
                                required
                                className="pl-12 h-12 bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 focus:border-[#0071E3] dark:focus:border-[#0A84FF] focus:ring-[#0071E3]/20 dark:focus:ring-[#0A84FF]/20 rounded-xl text-zinc-900 dark:text-white shadow-sm"
                            />
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
                            {t('settings.password.new')}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <Input
                                name="newPassword"
                                type="password"
                                required
                                minLength={8}
                                className="pl-12 h-12 bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 focus:border-[#0071E3] dark:focus:border-[#0A84FF] focus:ring-[#0071E3]/20 dark:focus:ring-[#0A84FF]/20 rounded-xl text-zinc-900 dark:text-white shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
                            {t('settings.password.confirm')}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <Input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={8}
                                className="pl-12 h-12 bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 focus:border-[#0071E3] dark:focus:border-[#0A84FF] focus:ring-[#0071E3]/20 dark:focus:ring-[#0A84FF]/20 rounded-xl text-zinc-900 dark:text-white shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-[#FF3B30] dark:text-[#FF453A] text-sm flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30] dark:bg-[#FF453A]"></span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-[#34C759] dark:text-[#30D158] text-sm flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] dark:bg-[#30D158]"></span>
                            {t('settings.success')}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#0071E3] dark:bg-[#0A84FF] hover:bg-[#0077ED] dark:hover:bg-[#0071E3] text-white rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {loading ? 'Saving...' : t('settings.password.save')}
                    </Button>
                </form>
            </GlassCard>

            <GlassCard className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                    <span className="h-8 w-1 rounded-full bg-[#0071E3] dark:bg-[#0A84FF]"></span>
                    Download Paths
                </h1>

                <div className="space-y-4">
                    {paths.map((path) => (
                        <div key={path.name} className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center gap-3">
                                <Folder className="h-5 w-5 text-[#0071E3] dark:text-[#0A84FF]" />
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-white">{path.name}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{path.path}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePath(path.name)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    <div className="flex gap-2">
                        <Input
                            placeholder="Name (e.g. Movies)"
                            value={newPathName}
                            onChange={(e) => setNewPathName(e.target.value)}
                            className="flex-1 h-10 bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 rounded-lg"
                        />
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Path"
                                value={selectedPath}
                                readOnly
                                onClick={() => setIsBrowserOpen(true)}
                                className="h-10 bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer"
                            />
                        </div>
                        <Button
                            onClick={handleAddPath}
                            disabled={!newPathName || !selectedPath}
                            className="h-10 bg-[#0071E3] dark:bg-[#0A84FF] text-white rounded-lg"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <FolderBrowserModal
                    isOpen={isBrowserOpen}
                    onClose={() => setIsBrowserOpen(false)}
                    onSelect={setSelectedPath}
                    initialPath={selectedPath || '/'}
                />
            </GlassCard>


        </div>
    );
}



