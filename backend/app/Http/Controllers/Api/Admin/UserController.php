<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Employer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    // ── List / search ────────────────────────────────────────────────────────

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

    // ── Admin own profile ────────────────────────────────────────────────────

    public function showProfile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateOwnProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'display_name'          => 'nullable|string|max:255',
            'email'                 => 'nullable|email|unique:users,email,' . $user->id,
            'current_password'      => 'required_with:password',
            'password'              => 'nullable|min:8|confirmed',
            'password_confirmation' => 'nullable',
        ]);

        if ($request->filled('display_name')) {
            $user->display_name = $request->display_name;
        }

        if ($request->filled('email') && $request->email !== $user->email) {
            $user->email = $request->email;
        }

        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect.',
                    'errors'  => ['current_password' => ['Current password is incorrect.']],
                ], 422);
            }
            $user->password        = bcrypt($request->password);
            $user->legacy_password = false;
        }

        $user->save();

        return response()->json($user);
    }

    // ── Create user ──────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $request->validate([
            'display_name' => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|min:8',
            'role'         => 'required|in:candidate,employer,admin',
            'company_name' => 'required_if:role,employer|nullable|string|max:255',
        ]);

        $user = User::create([
            'id'                => (string) Str::ulid(),
            'display_name'      => $request->display_name,
            'email'             => $request->email,
            'password'          => bcrypt($request->password),
            'role'              => $request->role,
            'is_active'         => true,
            'legacy_password'   => false,
            'email_verified_at' => now(),
        ]);

        if ($request->role === 'candidate') {
            Candidate::create(['user_id' => $user->id]);
        } elseif ($request->role === 'employer') {
            $slug = Str::slug($request->company_name);
            $base = $slug;
            $i    = 1;
            while (Employer::where('slug', $slug)->exists()) {
                $slug = $base . '-' . $i++;
            }
            Employer::create([
                'user_id'      => $user->id,
                'company_name' => $request->company_name,
                'slug'         => $slug,
            ]);
        }

        DB::table('admin_audit_log')->insert([
            'admin_id'       => $request->user()->id,
            'target_user_id' => $user->id,
            'action'         => 'create_user',
            'notes'          => 'Created ' . $request->role . ': ' . $request->email,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return response()->json([
            'user'    => $user,
            'message' => 'User created successfully.',
        ], 201);
    }

    // ── Existing role/status/delete ──────────────────────────────────────────

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
