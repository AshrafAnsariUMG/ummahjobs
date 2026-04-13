<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::with([
            'employer:id,company_name,slug',
            'category:id,name',
        ])->orderByDesc('created_at');

        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->employer_id) {
            $query->where('employer_id', $request->employer_id);
        }

        if ($request->has('is_featured') && $request->is_featured !== '') {
            $query->where('is_featured', filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN));
        }

        $jobs = $query->paginate(20);

        return response()->json([
            'data' => $jobs->items(),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page'    => $jobs->lastPage(),
                'per_page'     => $jobs->perPage(),
                'total'        => $jobs->total(),
            ],
        ]);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'status'      => 'sometimes|in:active,expired',
            'is_featured' => 'sometimes|boolean',
            'is_urgent'   => 'sometimes|boolean',
        ]);

        $job = Job::findOrFail($id);
        $job->update($request->only(['status', 'is_featured', 'is_urgent']));

        return response()->json($job->load(['employer:id,company_name,slug', 'category:id,name']));
    }

    public function destroy(Request $request, string $id)
    {
        $job = Job::findOrFail($id);
        $title = $job->title;
        $job->delete();

        DB::table('admin_audit_log')->insert([
            'admin_id'   => $request->user()->id,
            'action'     => 'delete_job',
            'notes'      => 'Deleted job: ' . $title,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Job deleted.']);
    }
}
