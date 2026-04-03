<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;

class CancelExpiredPayments extends Command
{
    protected $signature   = 'payments:cancel-expired';
    protected $description = 'Cancels appointments whose payment window has expired';

    public function handle(): void
    {
        $expired = Appointment::where('status', 'pending_payment')
            ->where('payment_expires_at', '<', now())
            ->get();

        foreach ($expired as $appointment) {
            $appointment->update([
                'status'         => 'cancelled',
                'payment_status' => 'cancelled',
            ]);
        }

        $this->info("Cancelled {$expired->count()} expired appointments.");
    }
}
