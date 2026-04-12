<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('display_name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($request->role && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        if ($request->status === 'active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'inactive') {
            $query->where('is_active', false);
        }

        $users = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
            'stats' => [
                'total'    => User::count(),
                'active'   => User::where('is_active', true)->count(),
                'inactive' => User::where('is_active', false)->count(),
            ],
        ]);
    }

    public function updateRole(Request $request, string $id)
    {
        $request->validate([
            'role' => 'required|in:candidate,employer,admin',
        ]);

        $user = User::findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot change your own role.'], 422);
        }

        $user->update(['role' => $request->role]);

        return response()->json($user);
    }

    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user = User::findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot deactivate yourself.'], 422);
        }

        $user->update(['is_active' => $request->is_active]);

        return response()->json($user);
    }

    public function destroy(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot delete yourself.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
