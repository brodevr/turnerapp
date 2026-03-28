<?php

namespace App\Services;

use App\Models\Professional;
use App\Models\Service;
use App\Models\Schedule;
use App\Models\Appointment;
use Carbon\Carbon;

class AvailabilityService
{
    /**
     * Get available start times for a given professional, service, and date.
     *
     * @return array<string> Return array of 'H:i' strings (e.g. ['09:00', '09:30'])
     */
    public function getAvailableSlots(Professional $professional, Service $service, string $dateStr): array
    {
        $date = Carbon::parse($dateStr);
        $dayName = $date->format('l'); // 'Monday', 'Tuesday', etc.

        // Fetch professional's schedule for this day
        $schedule = Schedule::where('professional_id', $professional->id)
            ->where('day_of_week', $dayName)
            ->where('is_enabled', true)
            ->first();

        if (!$schedule) {
            return []; // No schedule configured for this day
        }

        $serviceDuration = $service->duration_minutes;

        // Generate all possible 30-minute interval slots between schedule start and end
        $startSchedule = Carbon::parse($schedule->start_time);
        $endSchedule = Carbon::parse($schedule->end_time);

        $slots = [];
        $current = $startSchedule->copy();

        while ($current < $endSchedule) {
            $slotStart = $current->copy();
            $slotEnd = $current->copy()->addMinutes($serviceDuration);

            // If the service fits within the schedule before closing
            if ($slotEnd <= $endSchedule) {
                $slots[] = [
                    'start' => $slotStart,
                    'end'   => $slotEnd,
                ];
            }

            // Move to next 30-minute interval
            $current->addMinutes(30);
        }

        // Fetch existing active appointments for this professional on this date
        $existingAppointments = Appointment::where('professional_id', $professional->id)
            ->whereDate('date', $date->toDateString())
            ->where('status', '!=', 'cancelled')
            ->get();

        $availableSlots = [];

        foreach ($slots as $slot) {
            $isOverlapping = false;

            foreach ($existingAppointments as $apt) {
                $clean_apt_start = Carbon::parse($apt->start_time);
                $clean_apt_end = Carbon::parse($apt->end_time);

                // Check overlap condition: StartA < EndB AND EndA > StartB
                if ($slot['start'] < $clean_apt_end && $slot['end'] > $clean_apt_start) {
                    $isOverlapping = true;
                    break;
                }
            }

            if (!$isOverlapping) {
                // Return 'H:i' format to match frontend expectations
                $availableSlots[] = $slot['start']->format('H:i');
            }
        }

        return $availableSlots;
    }

    /**
     * Determine if a specific slot is valid (e.g. for booking validation)
     */
    public function isValidSlot(Professional $professional, Service $service, string $date, string $startTime): bool
    {
        $availableSlots = $this->getAvailableSlots($professional, $service, $date);
        
        // Carbon formats to H:i to compare with strings properly
        $startFormatted = Carbon::parse($startTime)->format('H:i');
        
        return in_array($startFormatted, $availableSlots);
    }
}
