<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\WorkOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_unauthenticated_access_redirects_to_login(): void
    {
        $this->get('/customers')->assertRedirect('/login');
    }

    public function test_customers_index_returns_inertia_response(): void
    {
        $this->actingAs($this->user)
            ->get('/customers')
            ->assertOk();
    }

    public function test_customer_can_be_created(): void
    {
        $this->actingAs($this->user)
            ->post('/customers', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '555-0100',
                'address' => '123 Main St',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('customers', [
            'user_id' => $this->user->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);
    }

    public function test_customer_name_is_required(): void
    {
        $this->actingAs($this->user)
            ->post('/customers', ['name' => ''])
            ->assertSessionHasErrors('name');
    }

    public function test_customer_can_be_updated(): void
    {
        $customer = Customer::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->put("/customers/{$customer->id}", [
                'name' => 'Updated Name',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_customer_can_be_deleted(): void
    {
        $customer = Customer::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->delete("/customers/{$customer->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    public function test_cascade_delete_removes_work_orders(): void
    {
        $customer = Customer::factory()->create(['user_id' => $this->user->id]);
        WorkOrder::factory()->create(['customer_id' => $customer->id]);
        WorkOrder::factory()->create(['customer_id' => $customer->id]);

        $this->assertCount(2, $customer->workOrders);

        $this->actingAs($this->user)
            ->delete("/customers/{$customer->id}");

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
        $this->assertDatabaseCount('work_orders', 0);
    }

    public function test_user_cannot_access_other_users_customer(): void
    {
        $otherUser = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->put("/customers/{$customer->id}", ['name' => 'Hacked'])
            ->assertStatus(403);
    }

    public function test_user_cannot_delete_other_users_customer(): void
    {
        $otherUser = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->delete("/customers/{$customer->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('customers', ['id' => $customer->id]);
    }
}
