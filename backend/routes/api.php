<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EmployerController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\PackageController;
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
});

// Public utility routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/job-types', [CategoryController::class, 'jobTypes']);
Route::get('/packages', [PackageController::class, 'index']);
