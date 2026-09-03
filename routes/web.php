<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Foundation\Application;
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

Route::get('/dashboard', function () {
    $user = auth()->user();

    return Inertia::render('Dashboard', [
        'stats' => [
            'total_customers' => $user->customers()->count(),
            'active_work_orders' => $user->customers()->withCount('workOrders')->get()->sum('work_orders_count'),
            'scheduled_this_week' => \App\Models\WorkOrder::whereHas('customer', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->where('status', 'scheduled')
                ->whereBetween('scheduled_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('customers', CustomerController::class)->except(['show', 'edit', 'create']);
    Route::resource('work-orders', WorkOrderController::class)->except(['show', 'edit', 'create']);
});

require __DIR__.'/auth.php';
