<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        // Base query: work orders belonging to this user's customers
        $userWorkOrders = WorkOrder::whereHas('customer', fn ($q) => $q->where('user_id', $user->id));

        // Summary stats
        $totalCustomers = $user->customers()->count();

        $activeWorkOrders = (clone $userWorkOrders)->where('status', 'in_progress')->count();

        $completedThisWeek = (clone $userWorkOrders)
            ->where('status', 'completed')
            ->whereBetween('updated_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        $scheduledThisWeek = (clone $userWorkOrders)
            ->where('status', 'scheduled')
            ->whereBetween('scheduled_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        // Upcoming scheduled work orders (next 7 days)
        $upcomingWorkOrders = (clone $userWorkOrders)
            ->with('customer:id,name,phone')
            ->where('status', 'scheduled')
            ->whereBetween('scheduled_at', [now(), now()->addDays(7)])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get()
            ->map(fn ($wo) => [
                'id' => $wo->id,
                'title' => $wo->title,
                'scheduled_at' => $wo->scheduled_at->format('M d, Y g:i A'),
                'estimated_cost' => $wo->estimated_cost,
                'customer' => [
                    'name' => $wo->customer->name,
                    'phone' => $wo->customer->phone,
                ],
            ]);

        // Recent activity (latest 10 work orders)
        $recentActivity = (clone $userWorkOrders)
            ->with('customer:id,name')
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get()
            ->map(fn ($wo) => [
                'id' => $wo->id,
                'title' => $wo->title,
                'status' => $wo->status,
                'updated_at' => $wo->updated_at->diffForHumans(),
                'customer_name' => $wo->customer->name,
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_customers' => $totalCustomers,
                'active_work_orders' => $activeWorkOrders,
                'completed_this_week' => $completedThisWeek,
                'scheduled_this_week' => $scheduledThisWeek,
            ],
            'upcomingWorkOrders' => $upcomingWorkOrders,
            'recentActivity' => $recentActivity,
        ]);
    }
}
