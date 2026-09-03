<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $workOrders = WorkOrder::whereHas('customer', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
            ->with('customer')
            ->orderBy('scheduled_at', 'desc')
            ->get();

        $customers = $request->user()->customers()->orderBy('name')->get();

        return Inertia::render('WorkOrders/Index', [
            'workOrders' => $workOrders,
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'scheduled_at' => 'required|date',
            'estimated_cost' => 'nullable|numeric|min:0',
            'status' => 'in:scheduled,in_progress,completed,cancelled',
        ]);

        // Verify customer belongs to user
        $customer = Customer::where('id', $validated['customer_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated['status'] = $validated['status'] ?? 'scheduled';

        WorkOrder::create($validated);

        return back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WorkOrder $workOrder)
    {
        $this->authorizeWorkOrder($request, $workOrder);

        $validated = $request->validate([
            'customer_id' => 'sometimes|exists:customers,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'scheduled_at' => 'sometimes|required|date',
            'estimated_cost' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:scheduled,in_progress,completed,cancelled',
        ]);

        $workOrder->update($validated);

        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, WorkOrder $workOrder)
    {
        $this->authorizeWorkOrder($request, $workOrder);

        $workOrder->delete();

        return back();
    }

    /**
     * Authorize that the work order belongs to the authenticated user.
     */
    protected function authorizeWorkOrder(Request $request, WorkOrder $workOrder): void
    {
        $workOrder->load('customer');

        if ($workOrder->customer->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}
