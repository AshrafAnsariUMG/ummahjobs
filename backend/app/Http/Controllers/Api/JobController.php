<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Employer;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\JobMatchCache;
use App\Services\JobMatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Job::with([
            'employer:id,company_name,slug,logo_path,is_verified',
            'category:id,name,slug',
        ])
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->category) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->job_type) {
            // Frontend sends job_type slug (e.g. "full-time"); DB stores name ("Full Time")
            $jobTypeRow = DB::table('job_types')
                ->where('slug', $request->job_type)
                ->first();
            $jobTypeName = $jobTypeRow ? $jobTypeRow->name : $request->job_type;
            $query->whereRaw('LOWER(job_type) = ?', [strtolower($jobTypeName)]);
        }

        if ($request->location) {
            $loc = strtolower($request->location);
            $query->where(function ($q) use ($loc) {
                $q->whereRaw('LOWER(location) LIKE ?', ['%' . $loc . '%'])
                  ->orWhereRaw('LOWER(country) LIKE ?', ['%' . $loc . '%']);
            });
        }

        if ($request->date_posted) {
            $map = [
                '1h'  => now()->subHour(),
                '24h' => now()->subDay(),
                '7d'  => now()->subDays(7),
                '14d' => now()->subDays(14),
                '30d' => now()->subDays(30),
            ];
            if (isset($map[$request->date_posted])) {
                $query->where('created_at', '>=', $map[$request->date_posted]);
            }
        }

        if ($request->experience_level) {
            $query->whereRaw('LOWER(experience_level) LIKE ?', ['%' . strtolower($request->experience_level) . '%']);
        }

        if ($request->career_level) {
            $query->whereRaw('LOWER(career_level) = ?', [strtolower($request->career_level)]);
        }

        if ($request->salary_min) {
            $query->where('salary_min', '>=', (int) $request->salary_min);
        }

        if ($request->salary_max) {
            $query->where('salary_max', '<=', (int) $request->salary_max);
        }

        if ($request->featured === 'true' || $request->featured === '1') {
            $query->where('is_featured', true);
        }

        if ($request->remote === 'true' || $request->remote === '1') {
            $query->where(function ($q) {
                $q->whereRaw('LOWER(location) LIKE ?', ['%remote%'])
                  ->orWhereRaw('LOWER(country) LIKE ?', ['%remote%'])
                  ->orWhereRaw('LOWER(job_type) LIKE ?', ['%remote%']);
            });
        }

        if ($request->work_type && $request->work_type !== 'all') {
            $workTypes = is_array($request->work_type)
                ? $request->work_type
                : [$request->work_type];

            $query->where(function ($q) use ($workTypes) {
                foreach ($workTypes as $type) {
                    $t = strtolower(trim($type));
                    if ($t === 'on-site') {
                        $q->orWhere(function ($inner) {
                            $inner->whereRaw('LOWER(COALESCE(job_type, \'\')) NOT LIKE ?', ['%remote%'])
                                  ->whereRaw('LOWER(COALESCE(job_type, \'\')) NOT LIKE ?', ['%hybrid%'])
                                  ->whereRaw('LOWER(COALESCE(location, \'\')) NOT LIKE ?', ['%remote%'])
                                  ->whereRaw('LOWER(COALESCE(location, \'\')) NOT LIKE ?', ['%hybrid%'])
                                  ->where(function ($loc) {
                                      $loc->where(function ($a) {
                                          $a->whereNotNull('location')->where('location', '!=', '');
                                      })->orWhere(function ($b) {
                                          $b->whereNotNull('country')->where('country', '!=', '');
                                      });
                                  });
                        });
                    } else {
                        $q->orWhere(function ($inner) use ($t) {
                            $inner->orWhereRaw('LOWER(location) LIKE ?', ['%' . $t . '%'])
                                  ->orWhereRaw('LOWER(country) LIKE ?', ['%' . $t . '%'])
                                  ->orWhereRaw('LOWER(job_type) LIKE ?', ['%' . $t . '%']);
                        });
                    }
                }
            });
        }

        match ($request->sort) {
            'newest'   => $query->orderBy('created_at', 'desc'),
            'oldest'   => $query->orderBy('created_at', 'asc'),
            'featured' => $query->orderByDesc('is_featured')->orderByDesc('created_at'),
            default    => $query->orderByDesc('is_featured')->orderByDesc('created_at'),
        };

        $perPage = min((int) ($request->per_page ?? 12), 50);
        $jobs    = $query->paginate($perPage);

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

    public function show(string $slug): JsonResponse
    {
        $job = Job::with([
            'employer:id,company_name,slug,logo_path,cover_photo_path,is_verified,category,email,socials',
            'category:id,name,slug',
        ])
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $job->increment('views_count');

        return response()->json($job);
    }

    public function featured(): JsonResponse
    {
        $jobs = Job::with([
            'employer:id,company_name,slug,logo_path',
            'category:id,name,slug',
        ])
            ->where('status', 'active')
            ->where('is_featured', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->orderByDesc('created_at')
            ->limit(6)
            ->get();

        return response()->json($jobs);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total_jobs'        => Job::where('status', 'active')->count(),
            'total_employers'   => Employer::count(),
            'total_candidates'  => Candidate::count(),
            'total_categories'  => JobCategory::count(),
        ]);
    }

    public function matchScore(Request $request, string $slug): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'candidate') {
            return response()->json(['score' => null, 'status' => 'not_candidate']);
        }

        $candidate = Candidate::where('user_id', $user->id)->first();
        if (!$candidate) {
            return response()->json(['score' => null, 'status' => 'no_profile']);
        }

        $job = Job::with('category')
            ->where('slug', $slug)
            ->where('status', 'active')
            ->first();

        if (!$job) {
            return response()->json(['score' => null, 'status' => 'job_not_found'], 404);
        }

        // Check 24-hour cache
        $cache = JobMatchCache::where('job_id', $job->id)
            ->where('candidate_id', $candidate->id)
            ->where('cached_at', '>=', now()->subHours(24))
            ->first();

        if ($cache) {
            return response()->json([
                'status'     => 'ready',
                'score'      => $cache->match_score,
                'reasons'    => $cache->match_reasons ?? [],
                'dimensions' => $cache->dimensions ?? [],
            ]);
        }

        // Calculate fresh score
        $result = (new JobMatchService())->score($candidate, $job);

        // Upsert cache row — dimensions stored in dedicated column
        JobMatchCache::updateOrCreate(
            ['job_id' => $job->id, 'candidate_id' => $candidate->id],
            [
                'match_score'   => $result['score'],
                'match_reasons' => array_merge($result['reasons'], $result['missing']),
                'dimensions'    => $result['dimensions'],
                'cached_at'     => now(),
            ]
        );

        return response()->json([
            'status'     => 'ready',
            'score'      => $result['score'],
            'reasons'    => $result['reasons'],
            'missing'    => $result['missing'],
            'dimensions' => $result['dimensions'],
        ]);
    }

    public function batchMatchScores(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->role !== 'candidate') {
            return response()->json([]);
        }

        $candidate = Candidate::where('user_id', $user->id)->first();
        if (!$candidate) {
            return response()->json([]);
        }

        $request->validate([
            'slugs'   => 'required|array|max:20',
            'slugs.*' => 'string',
        ]);

        $jobs = Job::with('category')
            ->whereIn('slug', $request->slugs)
            ->where('status', 'active')
            ->get();

        if ($jobs->isEmpty()) {
            return response()->json([]);
        }

        $service = new JobMatchService();
        $results = [];

        foreach ($jobs as $job) {
            // Check 24-hour cache
            $cached = JobMatchCache::where('job_id', $job->id)
                ->where('candidate_id', $candidate->id)
                ->where('cached_at', '>=', now()->subHours(24))
                ->first();

            if ($cached) {
                $results[$job->slug] = [
                    'score' => $cached->match_score,
                    'label' => $this->scoreLabel($cached->match_score),
                ];
                continue;
            }

            // Score and cache
            $result = $service->score($candidate, $job);

            JobMatchCache::updateOrCreate(
                ['job_id' => $job->id, 'candidate_id' => $candidate->id],
                [
                    'match_score'   => $result['score'],
                    'match_reasons' => array_merge($result['reasons'], $result['missing']),
                    'dimensions'    => $result['dimensions'],
                    'cached_at'     => now(),
                ]
            );

            $results[$job->slug] = [
                'score' => $result['score'],
                'label' => $this->scoreLabel($result['score']),
            ];
        }

        return response()->json($results);
    }

    private function scoreLabel(int $score): string
    {
        return match (true) {
            $score >= 90 => 'Excellent Match',
            $score >= 75 => 'Strong Match',
            $score >= 60 => 'Good Match',
            $score >= 40 => 'Moderate Match',
            default      => 'Low Match',
        };
    }
}
