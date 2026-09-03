<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        $customers = [
            [
                'name' => 'Sarah Mitchell',
                'email' => 'sarah.mitchell@email.com',
                'phone' => '(555) 123-4567',
                'address' => '142 Oak Street, Springfield, IL 62701',
                'notes' => 'Preferred contact via text. Has two bathrooms that need renovation.',
            ],
            [
                'name' => 'James Rodriguez',
                'email' => 'james.r@email.com',
                'phone' => '(555) 234-5678',
                'address' => '89 Maple Avenue, Springfield, IL 62702',
                'notes' => 'Commercial property owner. Multiple units available for maintenance contracts.',
            ],
            [
                'name' => 'Emily Chen',
                'email' => 'emily.chen@email.com',
                'phone' => '(555) 345-6789',
                'address' => '215 Pine Road, Springfield, IL 62703',
                'notes' => 'Emergency contact: (555) 999-0000. Older home, may have plumbing issues.',
            ],
            [
                'name' => 'Michael Thompson',
                'email' => 'm.thompson@email.com',
                'phone' => '(555) 456-7890',
                'address' => '67 Cedar Lane, Springfield, IL 62704',
                'notes' => 'New homeowner. First-time customer referral from Sarah Mitchell.',
            ],
            [
                'name' => 'Linda Patel',
                'email' => 'linda.patel@email.com',
                'phone' => '(555) 567-8901',
                'address' => '330 Birch Drive, Springfield, IL 62705',
                'notes' => 'Property manager for 12-unit apartment complex. Regular maintenance needed.',
            ],
        ];

        foreach ($customers as $customer) {
            Customer::create(array_merge($customer, ['user_id' => $user->id]));
        }
    }
}
