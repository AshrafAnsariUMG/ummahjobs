<?php

namespace App\Http\Controllers\Api;

use App\Models\Candidate;
use App\Models\Employer;
use App\Models\Job;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController
{
    public function inbox(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Get latest message per conversation thread
        $messages = Message::where('sender_id', $userId)
            ->orWhere('recipient_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        // Group into threads — key is sorted pair of user IDs
        // so A↔B and B↔A are the same thread
        $threads = [];
        foreach ($messages as $message) {
            $otherId = $message->sender_id === $userId
                ? $message->recipient_id
                : $message->sender_id;

            $ids = [$userId, $otherId];
            sort($ids);
            $threadKey = implode('-', $ids);

            // Only keep the latest message per thread
            if (!isset($threads[$threadKey])) {
                $threads[$threadKey] = [
                    'other_user_id'  => $otherId,
                    'latest_message' => $message,
                    'unread_count'   => 0,
                ];
            }
        }

        // Load other user details + unread counts
        foreach ($threads as $key => &$thread) {
            $otherUser = User::select('id', 'display_name', 'role')
                ->find($thread['other_user_id']);

            if (!$otherUser) {
                unset($threads[$key]);
                continue;
            }

            if ($otherUser->role === 'employer') {
                $employer = Employer::where('user_id', $otherUser->id)
                    ->first(['company_name', 'slug', 'logo_path']);
                $thread['other_user'] = [
                    'id'           => $otherUser->id,
                    'display_name' => $employer->company_name ?? $otherUser->display_name,
                    'role'         => 'employer',
                    'slug'         => $employer->slug ?? null,
                    'logo_path'    => $employer->logo_path ?? null,
                ];
            } else {
                $candidate = Candidate::where('user_id', $otherUser->id)
                    ->first(['profile_photo_path']);
                $thread['other_user'] = [
                    'id'           => $otherUser->id,
                    'display_name' => $otherUser->display_name,
                    'role'         => $otherUser->role,
                    'photo'        => $candidate->profile_photo_path ?? null,
                ];
            }

            // Count unread messages in this thread
            $thread['unread_count'] = Message::where('sender_id', $thread['other_user_id'])
                ->where('recipient_id', $userId)
                ->whereNull('read_at')
                ->count();

            // Add job context if latest message has a job_id
            $jobId = $thread['latest_message']->job_id;
            if ($jobId) {
                $thread['job'] = Job::find($jobId, ['id', 'title', 'slug']);
            } else {
                $thread['job'] = null;
            }

            // Format latest message preview
            $thread['latest_message'] = [
                'id'      => $thread['latest_message']->id,
                'body'    => Str::limit($thread['latest_message']->body, 80),
                'sent_at' => $thread['latest_message']->created_at,
                'is_mine' => $thread['latest_message']->sender_id === $userId,
                'read_at' => $thread['latest_message']->read_at,
            ];
        }
        unset($thread);

        $threads = array_values($threads);

        // Sort by latest message time descending
        usort($threads, function ($a, $b) {
            return $b['latest_message']['sent_at'] <=> $a['latest_message']['sent_at'];
        });

        $totalUnread = array_sum(array_column($threads, 'unread_count'));

        return response()->json([
            'threads'      => $threads,
            'total_unread' => $totalUnread,
        ]);
    }

    public function thread(Request $request, string $userId): JsonResponse
    {
        $currentUserId = $request->user()->id;
        $otherUserId   = $userId;

        // Mark all messages from other user as read
        Message::where('sender_id', $otherUserId)
            ->where('recipient_id', $currentUserId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Fetch all messages in thread
        $messages = Message::where(function ($q) use ($currentUserId, $otherUserId) {
            $q->where('sender_id', $currentUserId)
              ->where('recipient_id', $otherUserId);
        })->orWhere(function ($q) use ($currentUserId, $otherUserId) {
            $q->where('sender_id', $otherUserId)
              ->where('recipient_id', $currentUserId);
        })
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($msg) use ($currentUserId) {
            return [
                'id'      => $msg->id,
                'body'    => $msg->body,
                'is_mine' => $msg->sender_id === $currentUserId,
                'job_id'  => $msg->job_id,
                'read_at' => $msg->read_at,
                'sent_at' => $msg->created_at,
            ];
        });

        // Load other user info
        $otherUser = User::with(['employer', 'candidate'])->find($otherUserId);

        if (!$otherUser) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        $otherUserData = [
            'id'           => $otherUser->id,
            'display_name' => $otherUser->display_name,
            'role'         => $otherUser->role,
        ];

        if ($otherUser->role === 'employer' && $otherUser->employer) {
            $otherUserData['company_name'] = $otherUser->employer->company_name;
            $otherUserData['slug']         = $otherUser->employer->slug;
            $otherUserData['logo_path']    = $otherUser->employer->logo_path;
        } elseif ($otherUser->candidate) {
            $otherUserData['photo'] = $otherUser->candidate->profile_photo_path;
        }

        return response()->json([
            'messages'   => $messages,
            'other_user' => $otherUserData,
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_id' => 'required|string|exists:users,id',
            'body'         => 'required|string|min:1|max:2000',
            'job_id'       => 'nullable|exists:jobs,id',
        ]);

        $senderId = $request->user()->id;

        // Cannot message yourself
        if ($request->recipient_id === $senderId) {
            return response()->json([
                'message' => 'You cannot message yourself.',
            ], 422);
        }

        // Verify recipient exists and is active
        User::where('id', $request->recipient_id)
            ->where('is_active', true)
            ->firstOrFail();

        $message = Message::create([
            'sender_id'    => $senderId,
            'recipient_id' => $request->recipient_id,
            'body'         => $request->body,
            'job_id'       => $request->job_id,
        ]);

        return response()->json([
            'message' => [
                'id'      => $message->id,
                'body'    => $message->body,
                'is_mine' => true,
                'job_id'  => $message->job_id,
                'read_at' => null,
                'sent_at' => $message->created_at,
            ],
        ], 201);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Message::where('recipient_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    public function markRead(Request $request, string $userId): JsonResponse
    {
        $otherUserId = $userId;

        Message::where('sender_id', $otherUserId)
            ->where('recipient_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Marked as read']);
    }
}
