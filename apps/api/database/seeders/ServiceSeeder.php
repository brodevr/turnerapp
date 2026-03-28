<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Consulta General', 'duration_minutes' => 30, 'color' => '#3B82F6', 'price' => 50.00],
            ['name' => 'Consulta Especializada', 'duration_minutes' => 45, 'color' => '#10B981', 'price' => 80.00],
            ['name' => 'Tratamiento', 'duration_minutes' => 60, 'color' => '#F59E0B', 'price' => 120.00],
            ['name' => 'Seguimiento', 'duration_minutes' => 20, 'color' => '#8B5CF6', 'price' => 30.00],
            ['name' => 'Evaluación Inicial', 'duration_minutes' => 50, 'color' => '#EF4444', 'price' => 100.00],
            ['name' => 'Sesión de Terapia', 'duration_minutes' => 60, 'color' => '#06B6D4', 'price' => 90.00],
            ['name' => 'Revisión', 'duration_minutes' => 30, 'color' => '#EC4899', 'price' => 40.00],
            ['name' => 'Consulta Online', 'duration_minutes' => 25, 'color' => '#14B8A6', 'price' => 45.00],
        ];

        foreach ($services as $data) {
            Service::firstOrCreate(['name' => $data['name']], $data);
        }
    }
}
