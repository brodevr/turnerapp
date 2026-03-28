<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Mail\AppointmentReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envia recordatorios de email a clientes con turnos para mañana';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tomorrow = Carbon::tomorrow()->toDateString();

        $appointments = Appointment::where('date', $tomorrow)
            ->whereNull('reminder_sent_at')
            ->whereIn('status', ['pending', 'confirmed'])
            ->with(['service', 'professional'])
            ->get();

        $this->info("Procesando {$appointments->count()} recordatorios para el dia {$tomorrow}.");

        foreach ($appointments as $appointment) {
            try {
                if ($appointment->customer_email) {
                    Mail::to($appointment->customer_email)->send(new AppointmentReminder($appointment));
                    
                    $appointment->update([
                        'reminder_sent_at' => now()
                    ]);
                    
                    $this->line("Enviado recordatorio a: {$appointment->customer_name} ({$appointment->customer_email})");
                }
            } catch (\Exception $e) {
                $this->error("Error enviando recordatorio a {$appointment->customer_name}: " . $e->getMessage());
            }
        }

        $this->info('Proceso de recordatorios finalizado.');
    }
}
