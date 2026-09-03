<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $customers = $request->user()
            ->customers()
            ->withCount('workOrders')
            ->orderBy('name')
            ->get();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $request->user()->customers()->create($validated);

        return back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $this->authorize($customer);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $customer->update($validated);

        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Customer $customer)
    {
        $this->authorize($customer);

        $customer->delete();

        return back();
    }

    /**
     * Authorize that the customer belongs to the authenticated user.
     */
    protected function authorize(Customer $customer): void
    {
        if ($customer->user_id !== auth()->id()) {
            abort(403);
        }
    }
}
