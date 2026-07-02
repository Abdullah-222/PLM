"use client";

import { useState } from "react";
import { useCadStore } from "@/store/cad-store";
import { users, currentUser } from "@/constants/users";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  CheckCircle,
  CornerDownRight,
  Send,
  AtSign,
} from "lucide-react";
import type { CadFile, CadComment } from "@/types/cad";

interface CadCommentsProps {
  file: CadFile;
}

export function CadComments({ file }: CadCommentsProps) {
  const { addComment, addReply, resolveThread } = useCadStore();

  const [newCommentText, setNewCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Mention autocomplete helper
  const [mentionSearch, setMentionSearch] = useState(false);
  const [mentionList, setMentionList] = useState(users);

  const handleCommentChange = (text: string) => {
    setNewCommentText(text);
    if (text.endsWith("@")) {
      setMentionSearch(true);
      setMentionList(users);
    } else if (mentionSearch) {
      const parts = text.split("@");
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes(" ") || lastPart.includes("\n")) {
        setMentionSearch(false);
      } else {
        const filtered = users.filter((u) => u.name.toLowerCase().includes(lastPart.toLowerCase()));
        setMentionList(filtered);
      }
    }
  };

  const insertMention = (userName: string, isForReply = false) => {
    if (isForReply) {
      const parts = replyText.split("@");
      parts.pop();
      setReplyText(parts.join("@") + `@${userName} `);
    } else {
      const parts = newCommentText.split("@");
      parts.pop();
      setNewCommentText(parts.join("@") + `@${userName} `);
    }
    setMentionSearch(false);
  };

  const handlePostComment = () => {
    if (newCommentText.trim()) {
      addComment(file.id, newCommentText.trim());
      setNewCommentText("");
      setMentionSearch(false);
    }
  };

  const handlePostReply = (commentId: string) => {
    if (replyText.trim()) {
      addReply(file.id, commentId, replyText.trim());
      setReplyText("");
      setActiveReplyId(null);
      setMentionSearch(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="border border-border rounded-xl p-4 bg-card shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground font-semibold">Threaded Design Discussion</h4>
          <p className="text-[10px] text-muted-foreground">Collaborate with quality, manufacturing, and design engineers.</p>
        </div>

        {/* Create new thread block */}
        <div className="space-y-2.5 relative">
          <div className="relative">
            <Textarea
              value={newCommentText}
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder="Start a discussion thread... Use @ to mention other engineers (e.g. @James, @Alex)"
              rows={3}
              className="text-xs pr-8"
            />
            <AtSign className="absolute right-2.5 bottom-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Mentions dropdown list */}
          {mentionSearch && mentionList.length > 0 && (
            <div className="absolute z-10 bottom-full mb-1 left-0 w-44 bg-popover border rounded-lg shadow-lg p-1 space-y-0.5">
              <p className="text-[9px] text-muted-foreground px-2 py-1 font-semibold uppercase tracking-wider">Mention Team Member</p>
              {mentionList.map((u) => (
                <button
                  key={u.id}
                  onClick={() => insertMention(u.name)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-muted rounded text-[11px] font-medium flex items-center gap-1.5"
                >
                  <div className="h-4 w-4 rounded-full bg-slate-200 text-[8px] flex items-center justify-center font-bold">
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  {u.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button size="sm" onClick={handlePostComment} className="text-xs gap-1.5 h-8 bg-blue-600 hover:bg-blue-700">
              <Send className="h-3.5 w-3.5" />
              Post Thread
            </Button>
          </div>
        </div>

        {/* List of comments */}
        <div className="space-y-4 pt-2 border-t">
          {file.comments.length > 0 ? (
            file.comments.map((comment) => (
              <div
                key={comment.id}
                className={`space-y-3 p-3.5 border rounded-xl bg-muted/5 transition-opacity ${
                  comment.resolved ? "opacity-60 border-emerald-200 bg-emerald-50/5" : "border-border"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700 flex items-center justify-center">
                      {comment.author.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{comment.author.name}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {comment.author.role} · {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {!comment.resolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 px-1.5 text-[9px] text-emerald-600 hover:text-emerald-700 focus:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => resolveThread(file.id, comment.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                      Resolve
                    </Button>
                  )}

                  {comment.resolved && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Resolved
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="text-muted-foreground whitespace-pre-line pl-8">
                  {comment.content}
                </p>

                {/* Sub replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-8 space-y-2.5 border-l-2 border-slate-100 dark:border-slate-800 ml-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div className="h-5 w-5 rounded-full bg-slate-200 text-[9px] font-bold text-slate-700 flex items-center justify-center">
                            {reply.author.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">{reply.author.name}</span>
                            <span className="text-[8px] text-muted-foreground ml-1.5">
                              {new Date(reply.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground pl-5">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply action triggers */}
                {!comment.resolved && (
                  <div className="pl-8">
                    {activeReplyId === comment.id ? (
                      <div className="space-y-2 mt-2">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type reply..."
                          rows={2}
                          className="text-xs"
                        />
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveReplyId(null);
                              setReplyText("");
                            }}
                            className="h-7 text-[10px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePostReply(comment.id)}
                            className="h-7 text-[10px] bg-blue-600 hover:bg-blue-700"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setActiveReplyId(comment.id);
                          setReplyText("");
                        }}
                      >
                        <MessageSquare className="h-3 w-3" />
                        Reply to thread
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MessageSquare className="h-6 w-6 mb-1 text-muted-foreground/60" />
              <p>No discussion threads opened yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
