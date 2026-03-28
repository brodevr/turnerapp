<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Appointment;
use App\Models\Professional;
use App\Models\Service;
use App\Services\AvailabilityService;

$professional = Professional::first();
$service = Service::first();

// Create an appointment for exactly tomorrow at 09:00
$date = now()->addDay()->format('Y-m-d');
$apt = Appointment::create([
    'patient_id' => 1,
    'professional_id' => $professional->id,
    'service_id' => $service->id,
    'date' => $date,
    'start_time' => '09:00',
    'end_time' => '09:30',
    'status' => 'pending',
    'customer_name' => 'Test',
    'customer_email' => 'test@test.com',
    'customer_phone' => '123'
]);

$serviceAvail = app(AvailabilityService::class);
echo "Available slots for $date:\n";
print_r($serviceAvail->getAvailableSlots($professional, $service, $date));

// Clean up
$apt->delete();
