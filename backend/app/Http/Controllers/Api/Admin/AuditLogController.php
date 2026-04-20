<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AdminAuditLog::orderByDesc('created_at');

        if ($request->action && $request->action !== 'all') {
            $query->where('action', $request->action);
        }

        if ($request->days) {
            $query->where('created_at', '>=', now()->subDays((int) $request->days));
        }

        $log = $query->paginate(20);

        $adminIds  = $log->pluck('admin_id')->unique()->filter();
        $targetIds = $log->pluck('target_user_id')->unique()->filter();
        $allIds    = $adminIds->merge($targetIds)->unique();
        $users     = User::whereIn('id', $allIds)->pluck('display_name', 'id');

        $items = $log->map(function ($entry) use ($users) {
            return [
                'id'             => $entry->id,
                'action'         => $entry->action,
                'admin_name'     => $users[$entry->admin_id] ?? 'Unknown',
                'target_user_id' => $entry->target_user_id,
                'target_name'    => $entry->target_user_id ? ($users[$entry->target_user_id] ?? null) : null,
                'notes'          => $entry->notes,
                'created_at'     => $entry->created_at,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $log->currentPage(),
                'last_page'    => $log->lastPage(),
                'per_page'     => $log->perPage(),
                'total'        => $log->total(),
            ],
        ]);
    }
}
