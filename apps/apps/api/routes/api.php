<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProfessionalController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientAuthController;
use App\Http\Controllers\ClientAppointmentController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'Laravel API is running']);
});

// --- Public Routes (Booking Flow) ---
Route::get('/professionals', [ProfessionalController::class, 'index']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::get('/schedules', [ScheduleController::class, 'index']);
Route::get('/availability', [AvailabilityController::class, 'index']);
Route::post('/appointments', [AppointmentController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);

// --- Protected Routes (Admin Dashboard) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('professionals', ProfessionalController::class)->except(['index']);
    Route::apiResource('services', ServiceController::class)->except(['index', 'show']);
    Route::apiResource('schedules', ScheduleController::class)->except(['index']);
    Route::apiResource('appointments', AppointmentController::class)->except(['store']);
});

// --- Client (Patient) Portal Routes ---
Route::prefix('client')->group(function () {
    Route::post('/register', [ClientAuthController::class, 'register']);
    Route::post('/login', [ClientAuthController::class, 'login']);
    Route::post('/google-login', [ClientAuthController::class, 'googleLogin']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [ClientAuthController::class, 'user']);
        Route::post('/logout', [ClientAuthController::class, 'logout']);
        Route::get('/appointments', [ClientAppointmentController::class, 'index']);
        Route::patch('/appointments/{id}/cancel', [ClientAppointmentController::class, 'cancel']);
    });
});
