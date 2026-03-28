<?php

namespace Database\Seeders;

use App\Models\Professional;
use Illuminate\Database\Seeder;

class ProfessionalSeeder extends Seeder
{
    public function run(): void
    {
        $professionals = [
            ['name' => 'Juan García', 'email' => 'juan.garcia@sistematuros.com', 'specialization' => 'Dermatólogo', 'color' => '#3B82F6'],
            ['name' => 'María López', 'email' => 'maria.lopez@sistematuros.com', 'specialization' => 'Nutricionista', 'color' => '#10B981'],
            ['name' => 'Carlos Rodríguez', 'email' => 'carlos.rodriguez@sistematuros.com', 'specialization' => 'Fisioterapeuta', 'color' => '#F59E0B'],
            ['name' => 'Ana Martínez', 'email' => 'ana.martinez@sistematuros.com', 'specialization' => 'Psicóloga', 'color' => '#8B5CF6'],
            ['name' => 'Roberto Silva', 'email' => 'roberto.silva@sistematuros.com', 'specialization' => 'Cardiólogo', 'color' => '#EF4444'],
        ];

        foreach ($professionals as $data) {
            Professional::firstOrCreate(['email' => $data['email']], $data);
        }
    }
}
