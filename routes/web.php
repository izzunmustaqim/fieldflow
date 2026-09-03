<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Health check endpoint for Docker/load balancer monitoring
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        $dbOk = true;
    } catch (Exception $e) {
        $dbOk = false;
    }

    $status = $dbOk ? 200 : 503;

    return response()->json([
        'status' => $dbOk ? 'healthy' : 'degraded',
        'timestamp' => now()->toIso8601String(),
        'checks' => [
            'database' => $dbOk ? 'ok' : 'failed',
        ],
    ], $status);
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('customers', CustomerController::class)->except(['show', 'edit', 'create']);
    Route::resource('work-orders', WorkOrderController::class)->except(['show', 'edit', 'create']);
});

require __DIR__.'/auth.php';
