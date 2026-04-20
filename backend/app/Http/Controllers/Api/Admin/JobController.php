<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employer;
use App\Models\Job;
use App\Services\RevalidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'employer_id'      => 'required|exists:employers,id',
            'title'            => 'required|string|max:255',
            'description'      => 'required|string',
            'category_id'      => 'nullable|exists:job_categories,id',
            'job_type'         => 'nullable|string',
            'location'         => 'nullable|string',
            'country'          => 'nullable|string',
            'salary_min'       => 'nullable|integer|min:0',
            'salary_max'       => 'nullable|integer|min:0',
            'salary_currency'  => 'nullable|string',
            'salary_type'      => 'nullable|string',
            'experience_level' => 'nullable|string',
            'career_level'     => 'nullable|string',
            'apply_type'       => 'required|in:external,platform',
            'apply_url'        => 'required_if:apply_type,external',
            'is_featured'      => 'boolean',
            'is_urgent'        => 'boolean',
            'status'           => 'in:active,draft',
            'expires_at'       => 'nullable|date',
        ]);

        $employer = Employer::findOrFail($request->employer_id);

        $slug = Str::slug($request->title);
        $base = $slug;
        $i    = 1;
        while (Job::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        $job = Job::create([
            'employer_id'      => $request->employer_id,
            'employer_package_id' => null,
            'category_id'      => $request->category_id,
            'title'            => $request->title,
            'slug'             => $slug,
            'description'      => $request->description,
            'job_type'         => $request->job_type,
            'location'         => $request->location,
            'country'          => $request->country,
            'salary_min'       => $request->salary_min,
            'salary_max'       => $request->salary_max,
            'salary_currency'  => $request->salary_currency ?? 'USD',
            'salary_type'      => $request->salary_type,
            'experience_level' => $request->experience_level,
            'career_level'     => $request->career_level,
            'apply_type'       => $request->apply_type,
            'apply_url'        => $request->apply_url,
            'is_featured'      => $request->is_featured ?? false,
            'is_urgent'        => $request->is_urgent ?? false,
            'status'           => $request->status ?? 'active',
            'expires_at'       => $request->expires_at,
            'views_count'      => 0,
        ]);

        DB::table('admin_audit_log')->insert([
            'admin_id'   => $request->user()->id,
            'action'     => 'post_job',
            'notes'      => 'Posted job: ' . $job->title . ' for ' . $employer->company_name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        RevalidationService::trigger();

        return response()->json([
            'job'     => $job,
            'slug'    => $job->slug,
            'message' => 'Job posted successfully.',
        ], 201);
    }

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

        RevalidationService::trigger();

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

        RevalidationService::trigger();

        return response()->json(['message' => 'Job deleted.']);
    }
}
