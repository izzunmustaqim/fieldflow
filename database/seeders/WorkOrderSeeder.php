<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\WorkOrder;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class WorkOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();

        $workOrders = [
            // Scheduled jobs
            [
                'customer_id' => $customers[0]->id,
                'title' => 'Bathroom Faucet Replacement',
                'description' => 'Replace kitchen faucet with new Moen pull-down model. Customer has already purchased the fixture.',
                'scheduled_at' => Carbon::tomorrow()->setTime(9, 0),
                'estimated_cost' => 285.00,
                'status' => 'scheduled',
            ],
            [
                'customer_id' => $customers[1]->id,
                'title' => 'Annual HVAC Maintenance',
                'description' => 'Complete HVAC system inspection and maintenance for commercial building. Includes filter replacement and duct cleaning.',
                'scheduled_at' => Carbon::tomorrow()->setTime(14, 0),
                'estimated_cost' => 450.00,
                'status' => 'scheduled',
            ],
            [
                'customer_id' => $customers[2]->id,
                'title' => 'Water Heater Inspection',
                'description' => 'Annual water heater inspection and flush. Customer reported lukewarm water.',
                'scheduled_at' => Carbon::tomorrow()->addDay()->setTime(10, 30),
                'estimated_cost' => 175.00,
                'status' => 'scheduled',
            ],
            // In progress jobs
            [
                'customer_id' => $customers[3]->id,
                'title' => 'Kitchen Sink Installation',
                'description' => 'Install new stainless steel double-basin sink. Remove old sink and dispose properly.',
                'scheduled_at' => Carbon::today()->setTime(8, 0),
                'estimated_cost' => 520.00,
                'actual_cost' => 485.50,
                'status' => 'in_progress',
            ],
            // Completed jobs
            [
                'customer_id' => $customers[0]->id,
                'title' => 'Toilet Repair',
                'description' => 'Fix running toilet in master bathroom. Replace flapper and fill valve.',
                'scheduled_at' => Carbon::yesterday()->setTime(11, 0),
                'estimated_cost' => 195.00,
                'actual_cost' => 180.00,
                'status' => 'completed',
            ],
            [
                'customer_id' => $customers[4]->id,
                'title' => 'Emergency Pipe Leak Repair',
                'description' => 'Emergency repair for burst pipe in Unit 4B. Water damage mitigation required.',
                'scheduled_at' => Carbon::now()->subDays(3)->setTime(16, 30),
                'estimated_cost' => 680.00,
                'actual_cost' => 725.00,
                'status' => 'completed',
            ],
            [
                'customer_id' => $customers[1]->id,
                'title' => 'Electrical Panel Upgrade',
                'description' => 'Upgrade electrical panel from 100A to 200A for commercial building. Includes permit and inspection.',
                'scheduled_at' => Carbon::now()->subDays(5)->setTime(7, 30),
                'estimated_cost' => 2400.00,
                'actual_cost' => 2350.00,
                'status' => 'completed',
            ],
            // Cancelled jobs
            [
                'customer_id' => $customers[2]->id,
                'title' => 'Garbage Disposal Installation',
                'description' => 'Install new InSinkErator garbage disposal. Customer cancelled due to change of plans.',
                'scheduled_at' => Carbon::now()->subDays(7)->setTime(13, 0),
                'estimated_cost' => 320.00,
                'status' => 'cancelled',
            ],
            [
                'customer_id' => $customers[4]->id,
                'title' => 'Apartment Complex Walkthrough',
                'description' => 'Initial walkthrough for maintenance contract. Rescheduled due to tenant availability.',
                'scheduled_at' => Carbon::now()->subDays(10)->setTime(10, 0),
                'estimated_cost' => 0.00,
                'status' => 'cancelled',
            ],
        ];

        foreach ($workOrders as $workOrder) {
            WorkOrder::create($workOrder);
        }
    }
}
