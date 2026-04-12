<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\Candidate;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\Employer;
use App\Http\Controllers\Api\EmployerController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\WebhookController;
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

// Stripe webhook — no auth middleware
Route::post('webhooks/stripe', [WebhookController::class, 'handleStripe']);
