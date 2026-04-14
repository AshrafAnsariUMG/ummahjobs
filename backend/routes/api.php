<?php

use App\Http\Controllers\Api\Admin\CreditsController;
use App\Http\Controllers\Api\Admin\SiteSettingsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\Candidate;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\Employer;
use App\Http\Controllers\Api\EmployerController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

// Authenticated auth routes
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::put('password', [AuthController::class, 'changePassword']);
});

// Public job routes
Route::prefix('jobs')->group(function () {
    Route::get('/', [JobController::class, 'index']);
    Route::get('/featured', [JobController::class, 'featured']);
    Route::get('/stats', [JobController::class, 'stats']);
    Route::get('/{slug}', [JobController::class, 'show']);
});

// Public employer routes
Route::prefix('employers')->group(function () {
    Route::get('/{slug}', [EmployerController::class, 'show']);
    Route::get('/{slug}/reviews', [EmployerController::class, 'reviews']);
});

// Auth required routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/employers/{slug}/reviews', [EmployerController::class, 'storeReview']);
    // Batch match — registered before {slug} pattern to avoid route collision
    Route::post('/jobs/batch-match-scores', [JobController::class, 'batchMatchScores']);
    Route::get('/jobs/{slug}/match-score', [JobController::class, 'matchScore']);

    // Messages
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'inbox']);
        Route::get('/unread-count', [MessageController::class, 'unreadCount']);
        Route::post('/', [MessageController::class, 'send']);
        Route::get('/thread/{userId}', [MessageController::class, 'thread']);
        Route::put('/thread/{userId}/read', [MessageController::class, 'markRead']);
    });
});

// Public utility routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/job-types', [CategoryController::class, 'jobTypes']);
Route::get('/packages', [PackageController::class, 'index']);

// Blog routes
Route::prefix('blog')->group(function () {
    Route::get('/', [BlogController::class, 'index']);
    Route::get('/{slug}', [BlogController::class, 'show']);
});

// Newsletter
Route::middleware('throttle:3,1')
    ->post('newsletter/subscribe', [NewsletterController::class, 'subscribe']);

// Employer authenticated routes
Route::middleware('auth:sanctum')->prefix('employer')->group(function () {
    // Packages
    Route::post('packages/checkout', [Employer\PackageController::class, 'checkout']);
    Route::get('packages/balance', [Employer\PackageController::class, 'balance']);
    Route::get('packages/history', [Employer\PackageController::class, 'history']);

    // Profile
    Route::get('profile', [Employer\ProfileController::class, 'show']);
    Route::put('profile', [Employer\ProfileController::class, 'update']);

    // Jobs
    Route::post('jobs/generate-description', [Employer\JobController::class, 'generateDescription']);
    Route::get('jobs', [Employer\JobController::class, 'index']);
    Route::post('jobs', [Employer\JobController::class, 'store']);
    Route::put('jobs/{id}', [Employer\JobController::class, 'update']);
    Route::delete('jobs/{id}', [Employer\JobController::class, 'destroy']);
    Route::get('jobs/{id}/analytics', [Employer\JobController::class, 'analytics']);

    // Applicants
    Route::get('applicants', [Employer\ApplicantController::class, 'index']);
    Route::put('applicants/{id}/status', [Employer\ApplicantController::class, 'updateStatus']);
});

// Candidate authenticated routes
Route::middleware('auth:sanctum')->prefix('candidate')->group(function () {
    // Profile
    Route::get('profile', [Candidate\ProfileController::class, 'show']);
    Route::put('profile', [Candidate\ProfileController::class, 'update']);
    Route::post('profile/cv', [Candidate\ProfileController::class, 'uploadCV']);
    Route::post('profile/photo', [Candidate\ProfileController::class, 'uploadPhoto']);

    // Saved jobs
    Route::get('saved-jobs', [Candidate\SavedJobController::class, 'index']);
    Route::post('saved-jobs', [Candidate\SavedJobController::class, 'store']);
    Route::delete('saved-jobs/{jobId}', [Candidate\SavedJobController::class, 'destroy']);

    // Applications
    Route::get('applications', [Candidate\ApplicationController::class, 'index']);
    Route::post('applications', [Candidate\ApplicationController::class, 'store']);
    Route::get('applications/check/{jobId}', [Candidate\ApplicationController::class, 'checkApplied']);

    // Alerts
    Route::get('alerts', [Candidate\AlertController::class, 'index']);
    Route::post('alerts', [Candidate\AlertController::class, 'store']);
    Route::put('alerts/{id}', [Candidate\AlertController::class, 'update']);
    Route::delete('alerts/{id}', [Candidate\AlertController::class, 'destroy']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // Admin own profile
    Route::get('profile', [Admin\UserController::class, 'showProfile']);
    Route::put('profile', [Admin\UserController::class, 'updateOwnProfile']);

    // Users (create before {id} routes)
    Route::post('users', [Admin\UserController::class, 'store']);
    Route::get('users', [Admin\UserController::class, 'index']);
    Route::put('users/{id}/role', [Admin\UserController::class, 'updateRole']);
    Route::put('users/{id}/status', [Admin\UserController::class, 'updateStatus']);
    Route::delete('users/{id}', [Admin\UserController::class, 'destroy']);

    // Credits
    Route::post('credits/grant', [CreditsController::class, 'grant']);
    Route::get('credits/history', [CreditsController::class, 'history']);

    // Stats
    Route::get('stats', function () {
        return response()->json([
            'total_users'        => App\Models\User::count(),
            'total_jobs'         => App\Models\Job::where('status', 'active')->count(),
            'total_employers'    => App\Models\Employer::count(),
            'total_candidates'   => App\Models\Candidate::count(),
            'total_applications' => App\Models\JobApplication::count(),
        ]);
    });

    // Audit log
    Route::get('audit-log', [Admin\AuditLogController::class, 'index']);

    // Jobs (post before {id} routes)
    Route::post('jobs', [Admin\JobController::class, 'store']);
    Route::get('jobs', [Admin\JobController::class, 'index']);
    Route::put('jobs/{id}', [Admin\JobController::class, 'update']);
    Route::delete('jobs/{id}', [Admin\JobController::class, 'destroy']);

    // Employers (search before {id} to avoid collision)
    Route::get('employers/search', [Admin\EmployerController::class, 'search']);
    Route::get('employers', [Admin\EmployerController::class, 'index']);
    Route::put('employers/{id}', [Admin\EmployerController::class, 'update']);
    Route::put('employers/{id}/profile', [Admin\EmployerController::class, 'updateProfile']);
    Route::post('employers/{id}/logo', [Admin\EmployerController::class, 'uploadEmployerLogo']);
    Route::post('employers/{id}/cover', [Admin\EmployerController::class, 'uploadEmployerCover']);

    // Candidates
    Route::get('candidates', [Admin\CandidateController::class, 'index']);
    Route::put('candidates/{id}/profile', [Admin\CandidateController::class, 'updateProfile']);
    Route::post('candidates/{id}/photo', [Admin\CandidateController::class, 'uploadCandidatePhoto']);
    Route::post('candidates/{id}/cv', [Admin\CandidateController::class, 'uploadCandidateCV']);

    // Packages (admin — store/destroy before {id} routes)
    Route::post('packages', [Admin\PackageController::class, 'store']);
    Route::get('packages', [Admin\PackageController::class, 'index']);
    Route::put('packages/{id}', [Admin\PackageController::class, 'update']);
    Route::delete('packages/{id}', [Admin\PackageController::class, 'destroy']);

    // Blog (upload-image before {slug} to avoid collision)
    Route::get('blog', [Admin\BlogController::class, 'index']);
    Route::post('blog', [Admin\BlogController::class, 'store']);
    Route::post('blog/upload-image', [Admin\BlogController::class, 'uploadImage']);
    Route::get('blog/{slug}', [Admin\BlogController::class, 'show']);
    Route::put('blog/{slug}', [Admin\BlogController::class, 'update']);
    Route::delete('blog/{slug}', [Admin\BlogController::class, 'destroy']);
});

// Site settings (admin)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('settings', [SiteSettingsController::class, 'index']);
    Route::post('settings', [SiteSettingsController::class, 'update']);
    Route::post('settings/logo', [SiteSettingsController::class, 'uploadLogo']);
});

// Public settings endpoint (no auth)
Route::get('settings', [SiteSettingsController::class, 'publicSettings']);

// Stripe webhook — no auth middleware
Route::post('webhooks/stripe', [WebhookController::class, 'handleStripe']);
