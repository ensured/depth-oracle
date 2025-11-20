// Thread Selector Component for managing conversation threads
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    MessagesSquare,
    Plus,
    Trash2,
    Check,
    X,
    ChevronDown,
} from "lucide-react";
import { ChatThread } from "@/lib/chat-storage";

interface ThreadSelectorProps {
    threads: ChatThread[];
    currentThreadId: string | null;
    onThreadSelect: (threadId: string) => void;
    onNewThread: () => void;
    onDeleteThread: (threadId: string) => void;
    onRenameThread: (threadId: string, newTitle: string) => void;
    maxThreads: number;
}

export function ThreadSelector({
    threads,
    currentThreadId,
    onThreadSelect,
    onNewThread,
    onDeleteThread,
    onRenameThread,
    maxThreads,
}: ThreadSelectorProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
    const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const currentThread = threads.find(t => t.id === currentThreadId);
    const isAtLimit = threads.length >= maxThreads;

    const handleDeleteClick = (threadId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setThreadToDelete(threadId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (threadToDelete) {
            onDeleteThread(threadToDelete);
            setThreadToDelete(null);
        }
        setDeleteDialogOpen(false);
    };

    const handleSaveEdit = (threadId: string) => {
        if (editTitle.trim()) {
            onRenameThread(threadId, editTitle.trim());
        }
        setEditingThreadId(null);
        setEditTitle("");
    };

    const handleCancelEdit = () => {
        setEditingThreadId(null);
        setEditTitle("");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto justify-between gap-2 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-700 dark:hover:bg-indigo-900/20"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <MessagesSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate text-sm">
                                {currentThread?.title || "Select Thread"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {threads.length > 0 && (
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded dark:bg-indigo-900/50 dark:text-indigo-300">
                                    {threads.length}
                                </span>
                            )}
                            <ChevronDown className="h-3 w-3" />
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-[300px] sm:w-[400px] max-h-[400px] overflow-y-auto"
                >
                    <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Conversation Threads</span>
                        <Button
                            size="sm"
                            onClick={onNewThread}
                            disabled={isAtLimit}
                            className="h-6 px-2 cursor-pointer"
                            title={
                                isAtLimit
                                    ? `Maximum ${maxThreads} threads reached`
                                    : "Start new conversation"
                            }
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            New
                        </Button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {threads.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No threads yet. Click &quot;New&quot; to start!
                        </div>
                    ) : (
                        threads.map(thread => (
                            <DropdownMenuItem
                                key={thread.id}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${thread.id === currentThreadId
                                    ? "bg-indigo-50 dark:bg-indigo-900/30"
                                    : ""
                                    }`}
                                onSelect={() => onThreadSelect(thread.id)}
                            >
                                {editingThreadId === thread.id ? (
                                    <div
                                        className="flex items-center gap-2 w-full"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Input
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                            className="h-7 text-sm flex-1"
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === "Enter") {
                                                    handleSaveEdit(thread.id);
                                                } else if (e.key === "Escape") {
                                                    handleCancelEdit();
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleSaveEdit(thread.id)}
                                        >
                                            <Check className="h-3 w-3 text-green-600" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={handleCancelEdit}
                                        >
                                            <X className="h-3 w-3 text-red-600" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {thread.title}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <span>{thread.messages.length} messages</span>
                                                    <span>•</span>
                                                    <span>{formatDate(thread.updatedAt)}</span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 shrink-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                onClick={e => handleDeleteClick(thread.id, e)}
                                                title="Delete thread"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </DropdownMenuItem>
                        ))
                    )}

                    {isAtLimit && (
                        <div className="p-3 mt-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 rounded-md mx-2">
                            Maximum {maxThreads} threads reached. Delete some to create new
                            ones.
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Thread?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this conversation thread and all its
                            messages. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="cursor-pointer"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
