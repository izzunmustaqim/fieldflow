<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

class WorkOrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'scheduled_at' => fake()->dateTimeBetween('now', '+30 days'),
            'estimated_cost' => fake()->randomFloat(2, 50, 500),
            'status' => fake()->randomElement(['scheduled', 'in_progress', 'completed', 'cancelled']),
        ];
    }
}
