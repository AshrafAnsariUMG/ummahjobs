'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { MessageThread, Message } from '@/types'
import { timeAgo } from '@/lib/timeAgo'
import IslamicEmptyState from '@/components/ui/IslamicEmptyState'
import { MessageIcon } from '@/components/ui/IslamicIcons'

// ── Helpers ───────────────────────────────────────────────────────────────────

function dateSeparator(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function sameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function Avatar({
  displayName, logoPath, photo, size = 40,
}: {
  displayName: string
  logoPath?: string | null
  photo?: string | null
  size?: number
}) {
  const src = logoPath ?? photo ?? null
  if (src) {
    return (
      <img
        src={src}
        alt={displayName}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: '#033BB0',
        fontSize: Math.round(size * 0.32),
      }}
    >
      {initials(displayName)}
    </div>
  )
}

// ── Main content (needs Suspense for useSearchParams) ─────────────────────────

interface InboxData {
  threads: MessageThread[]
  total_unread: number
}

interface ThreadData {
  messages: Message[]
  other_user: MessageThread['other_user']
}

function MessagesContent() {
  const searchParams = useSearchParams()

  const [threads, setThreads] = useState<MessageThread[]>([])
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<MessageThread['other_user'] | null>(null)
  const [otherUserJob, setOtherUserJob] = useState<MessageThread['job']>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [totalUnread, setTotalUnread] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 60)
  }

  function loadThread(userId: string, currentThreads: MessageThread[]) {
    setActiveUserId(userId)
    setLoadingMessages(true)
    setMessages([])

    const thread = currentThreads.find((t) => t.other_user_id === userId)
    if (thread) {
      setOtherUser(thread.other_user)
      setOtherUserJob(thread.job ?? null)
      // Optimistically clear unread
      setThreads((prev) =>
        prev.map((t) =>
          t.other_user_id === userId ? { ...t, unread_count: 0 } : t
        )
      )
      setTotalUnread((prev) => Math.max(0, prev - (thread.unread_count ?? 0)))
    }

    api
      .get(`/api/messages/thread/${userId}`)
      .then((data: ThreadData) => {
        setMessages(data.messages)
        setOtherUser(data.other_user)
        setLoadingMessages(false)
        scrollToBottom()
      })
      .catch(() => setLoadingMessages(false))
  }

  // On mount: fetch inbox + handle ?compose= or auto-select first thread
  useEffect(() => {
    api
      .get('/api/messages')
      .then((data: InboxData) => {
        setThreads(data.threads)
        setTotalUnread(data.total_unread)

        const composeId = searchParams.get('compose')
        if (composeId) {
          loadThread(composeId, data.threads)
        } else if (
          data.threads.length > 0 &&
          typeof window !== 'undefined' &&
          window.innerWidth >= 1024
        ) {
          loadThread(data.threads[0].other_user_id, data.threads)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingThreads(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sendMessage() {
    if (!newMessage.trim() || !activeUserId || sending) return
    const body = newMessage.trim()
    setSending(true)
    try {
      const res = (await api.post('/api/messages', {
        recipient_id: activeUserId,
        body,
      })) as { message: Message }
      const msg = res.message
      setMessages((prev) => [...prev, msg])
      setNewMessage('')
      scrollToBottom()

      // Update thread preview
      setThreads((prev) => {
        const exists = prev.some((t) => t.other_user_id === activeUserId)
        if (exists) {
          return prev.map((t) =>
            t.other_user_id === activeUserId
              ? {
                  ...t,
                  latest_message: {
                    id: msg.id,
                    body,
                    sent_at: msg.sent_at,
                    is_mine: true,
                    read_at: null,
                  },
                }
              : t
          )
        }
        // New thread — refresh inbox asynchronously
        api.get('/api/messages').then((d: InboxData) => setThreads(d.threads)).catch(() => {})
        return prev
      })
    } catch {
      // silent
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredThreads = search
    ? threads.filter((t) =>
        t.other_user.display_name.toLowerCase().includes(search.toLowerCase())
      )
    : threads

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex -mx-6 -my-6 lg:-mx-8 lg:-my-8 overflow-hidden bg-white"
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      {/* ── Left: Thread list ─────────────────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bold text-gray-900 text-sm">Messages</h2>
            {totalUnread > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {totalUnread} unread
              </span>
            )}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          />
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="p-3 space-y-2 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 px-3 py-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredThreads.length === 0 ? (
            search ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">No conversations match.</p>
              </div>
            ) : (
              <IslamicEmptyState
                icon={<MessageIcon size={28} />}
                title="No messages yet"
                message="Reach out to an employer or wait for them to contact you. Good communication opens doors."
              />
            )
          ) : (
            filteredThreads.map((thread) => {
              const isActive = thread.other_user_id === activeUserId
              const isUnread = thread.unread_count > 0
              return (
                <button
                  key={thread.other_user_id}
                  onClick={() => loadThread(thread.other_user_id, threads)}
                  className={`w-full text-left px-4 py-3 flex gap-3 border-b border-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <Avatar
                    displayName={thread.other_user.display_name}
                    logoPath={thread.other_user.logo_path}
                    photo={thread.other_user.photo}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-sm truncate ${
                          isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        }`}
                      >
                        {thread.other_user.display_name}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {timeAgo(thread.latest_message.sent_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${isUnread ? 'text-gray-700' : 'text-gray-400'}`}>
                        {thread.latest_message.is_mine && (
                          <span className="text-gray-400">You: </span>
                        )}
                        {thread.latest_message.body.slice(0, 50)}
                      </p>
                      {isUnread && (
                        <span
                          className="shrink-0 text-white font-bold rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: '#033BB0',
                            minWidth: 18,
                            height: 18,
                            fontSize: 10,
                            padding: '0 4px',
                          }}
                        >
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                    {thread.job && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#033BB0' }}>
                        {thread.job.title}
                      </p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Right: Thread view ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {!activeUserId ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: '#E6EDFF' }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Select a conversation</h3>
            <p className="text-sm text-gray-400">
              Choose a conversation from the left to start messaging
            </p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            {otherUser && (
              <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center gap-3 shrink-0">
                <Avatar
                  displayName={otherUser.display_name}
                  logoPath={otherUser.logo_path}
                  photo={otherUser.photo}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">
                      {otherUser.display_name}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">
                      {otherUser.role}
                    </span>
                  </div>
                  {otherUserJob && (
                    <Link
                      href={`/jobs/${otherUserJob.slug}`}
                      className="text-xs hover:underline"
                      style={{ color: '#033BB0' }}
                    >
                      Re: {otherUserJob.title}
                    </Link>
                  )}
                </div>
                {otherUser.role === 'employer' && otherUser.slug && (
                  <Link
                    href={`/employers/${otherUser.slug}`}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 shrink-0 bg-white"
                  >
                    View Profile
                  </Link>
                )}
              </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loadingMessages ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`h-12 rounded-2xl w-48 ${
                          i % 2 === 0 ? 'bg-blue-100' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400 text-center">
                    No messages yet. Send a message to start the conversation.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg, idx) => {
                    const prev = idx > 0 ? messages[idx - 1] : null
                    const showSep = !prev || !sameDay(prev.sent_at, msg.sent_at)
                    return (
                      <div key={msg.id}>
                        {showSep && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 shrink-0">
                              {dateSeparator(msg.sent_at)}
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                        )}
                        <div
                          className={`flex mb-1 ${msg.is_mine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                            <div
                              className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words"
                              style={{
                                backgroundColor: msg.is_mine ? '#033BB0' : '#F3F4F6',
                                color: msg.is_mine ? '#FFFFFF' : '#111827',
                              }}
                            >
                              {msg.body}
                            </div>
                            <p
                              className={`text-xs text-gray-400 mt-0.5 ${
                                msg.is_mine ? 'text-right' : 'text-left'
                              }`}
                            >
                              {timeAgo(msg.sent_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Compose area */}
            <div className="px-4 py-3 border-t border-gray-200 bg-white flex gap-3 items-end shrink-0">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                maxLength={2000}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0"
                style={{ backgroundColor: '#033BB0' }}
                aria-label="Send"
              >
                {sending ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  )
}
