<?php

namespace Database\Seeders;

use App\Models\Professional;
use App\Models\Schedule;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        $professionals = Professional::all();

        foreach ($professionals as $professional) {
            foreach ($days as $day) {
                Schedule::firstOrCreate(
                    [
                        'professional_id' => $professional->id,
                        'day_of_week' => $day,
                    ],
                    [
                        'start_time' => '09:00',
                        'end_time' => '17:00',
                        'is_enabled' => true,
                    ]
                );
            }
        }
    }
}
