<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Health endpoint returns 200 with healthy status.
     */
    public function test_health_endpoint_returns_200(): void
    {
        $response = $this->get('/health');

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'healthy',
            'checks' => [
                'database' => 'ok',
            ],
        ]);
    }

    /**
     * Health endpoint includes timestamp.
     */
    public function test_health_endpoint_includes_timestamp(): void
    {
        $response = $this->get('/health');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'timestamp',
            'checks',
        ]);
    }
}
