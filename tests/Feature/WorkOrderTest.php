<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\WorkOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Customer $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->customer = Customer::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_unauthenticated_access_redirects_to_login(): void
    {
        $this->get('/work-orders')->assertRedirect('/login');
    }

    public function test_work_orders_index_returns_inertia_response(): void
    {
        $this->actingAs($this->user)
            ->get('/work-orders')
            ->assertOk();
    }

    public function test_work_order_can_be_created(): void
    {
        $this->actingAs($this->user)
            ->post('/work-orders', [
                'customer_id' => $this->customer->id,
                'title' => 'Fix plumbing',
                'description' => 'Leaky faucet',
                'scheduled_at' => now()->addDays(3)->format('Y-m-d H:i:s'),
                'estimated_cost' => 150.00,
                'status' => 'scheduled',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('work_orders', [
            'customer_id' => $this->customer->id,
            'title' => 'Fix plumbing',
            'status' => 'scheduled',
        ]);
    }

    public function test_work_order_title_is_required(): void
    {
        $this->actingAs($this->user)
            ->post('/work-orders', [
                'customer_id' => $this->customer->id,
                'title' => '',
                'scheduled_at' => now()->format('Y-m-d H:i:s'),
            ])
            ->assertSessionHasErrors('title');
    }

    public function test_work_order_customer_must_belong_to_user(): void
    {
        $otherCustomer = Customer::factory()->create();

        $this->actingAs($this->user)
            ->post('/work-orders', [
                'customer_id' => $otherCustomer->id,
                'title' => 'Unauthorized job',
                'scheduled_at' => now()->format('Y-m-d H:i:s'),
            ])
            ->assertStatus(404);
    }

    public function test_work_order_can_be_updated(): void
    {
        $workOrder = WorkOrder::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'scheduled',
        ]);

        $this->actingAs($this->user)
            ->put("/work-orders/{$workOrder->id}", [
                'title' => 'Updated Title',
                'status' => 'in_progress',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('work_orders', [
            'id' => $workOrder->id,
            'title' => 'Updated Title',
            'status' => 'in_progress',
        ]);
    }

    public function test_work_order_status_can_be_patched(): void
    {
        $workOrder = WorkOrder::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'scheduled',
        ]);

        $this->actingAs($this->user)
            ->patch("/work-orders/{$workOrder->id}", ['status' => 'completed'])
            ->assertRedirect();

        $this->assertDatabaseHas('work_orders', [
            'id' => $workOrder->id,
            'status' => 'completed',
        ]);
    }

    public function test_invalid_status_is_rejected(): void
    {
        $workOrder = WorkOrder::factory()->create([
            'customer_id' => $this->customer->id,
        ]);

        $this->actingAs($this->user)
            ->patch("/work-orders/{$workOrder->id}", ['status' => 'invalid_status'])
            ->assertSessionHasErrors('status');
    }

    public function test_work_order_can_be_deleted(): void
    {
        $workOrder = WorkOrder::factory()->create([
            'customer_id' => $this->customer->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/work-orders/{$workOrder->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('work_orders', ['id' => $workOrder->id]);
    }

    public function test_user_cannot_access_other_users_work_order(): void
    {
        $otherUser = User::factory()->create();
        $otherCustomer = Customer::factory()->create(['user_id' => $otherUser->id]);
        $workOrder = WorkOrder::factory()->create(['customer_id' => $otherCustomer->id]);

        $this->actingAs($this->user)
            ->put("/work-orders/{$workOrder->id}", ['title' => 'Hacked'])
            ->assertStatus(403);
    }

    public function test_dashboard_returns_stats(): void
    {
        WorkOrder::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'scheduled',
            'scheduled_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertOk();
    }
}
