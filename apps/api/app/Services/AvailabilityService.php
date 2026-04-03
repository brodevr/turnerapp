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

        // Fetch existing active appointments for this professional on this date.
        // Treat pending_payment as blocking only if the payment window hasn't expired.
        $existingAppointments = Appointment::where('professional_id', $professional->id)
            ->whereDate('date', $date->toDateString())
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) {
                $q->where('status', '!=', 'pending_payment')
                  ->orWhere('payment_expires_at', '>', now());
            })
            ->get();

        // Fetch manual time slot blockings
        $blockings = \App\Models\TimeSlotBlocking::where('professional_id', $professional->id)
            ->whereDate('date', $date->toDateString())
            ->get();

        $availableSlots = [];

        foreach ($slots as $slot) {
            $isOverlapping = false;

            // Check against appointments
            foreach ($existingAppointments as $apt) {
                $apt_start = Carbon::parse($apt->start_time);
                $apt_end = Carbon::parse($apt->end_time);

                if ($slot['start'] < $apt_end && $slot['end'] > $apt_start) {
                    $isOverlapping = true;
                    break;
                }
            }

            if ($isOverlapping) continue;

            // Check against manual blockings
            foreach ($blockings as $block) {
                $block_start = Carbon::parse($block->start_time);
                $block_end = Carbon::parse($block->end_time);

                if ($slot['start'] < $block_end && $slot['end'] > $block_start) {
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
     * Get all possible slots for a date with their availability status.
     * Returns [['time' => 'H:i', 'available' => bool], ...]
     */
    public function getAllSlotsWithStatus(Professional $professional, Service $service, string $dateStr): array
    {
        $date = Carbon::parse($dateStr);
        $dayName = $date->format('l');

        $schedule = Schedule::where('professional_id', $professional->id)
            ->where('day_of_week', $dayName)
            ->where('is_enabled', true)
            ->first();

        if (!$schedule) {
            return [];
        }

        $serviceDuration = $service->duration_minutes;
        $startSchedule   = Carbon::parse($schedule->start_time);
        $endSchedule     = Carbon::parse($schedule->end_time);

        $allSlots = [];
        $current  = $startSchedule->copy();

        while ($current < $endSchedule) {
            $slotStart = $current->copy();
            $slotEnd   = $current->copy()->addMinutes($serviceDuration);

            if ($slotEnd <= $endSchedule) {
                $allSlots[] = ['start' => $slotStart, 'end' => $slotEnd];
            }

            $current->addMinutes(30);
        }

        if (empty($allSlots)) {
            return [];
        }

        $existingAppointments = Appointment::where('professional_id', $professional->id)
            ->whereDate('date', $date->toDateString())
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) {
                $q->where('status', '!=', 'pending_payment')
                  ->orWhere('payment_expires_at', '>', now());
            })
            ->get();

        $blockings = \App\Models\TimeSlotBlocking::where('professional_id', $professional->id)
            ->whereDate('date', $date->toDateString())
            ->get();

        $result = [];

        foreach ($allSlots as $slot) {
            $isOverlapping = false;

            foreach ($existingAppointments as $apt) {
                $apt_start = Carbon::parse($apt->start_time);
                $apt_end   = Carbon::parse($apt->end_time);
                if ($slot['start'] < $apt_end && $slot['end'] > $apt_start) {
                    $isOverlapping = true;
                    break;
                }
            }

            if (!$isOverlapping) {
                foreach ($blockings as $block) {
                    $block_start = Carbon::parse($block->start_time);
                    $block_end   = Carbon::parse($block->end_time);
                    if ($slot['start'] < $block_end && $slot['end'] > $block_start) {
                        $isOverlapping = true;
                        break;
                    }
                }
            }

            $result[] = [
                'time'      => $slot['start']->format('H:i'),
                'available' => !$isOverlapping,
            ];
        }

        return $result;
    }

    /**
     * Return list of date strings in a given month that have at least one available slot.
     */
    public function getAvailableDaysInMonth(Professional $professional, Service $service, int $year, int $month): array
    {
        $start = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $end   = $start->copy()->endOfMonth();
        $today = Carbon::today();

        // Only look at days from today onward
        $current = $start->lt($today) ? $today->copy() : $start->copy();

        // Cache the enabled day names for this professional to avoid N+1 schedule queries
        $enabledDays = Schedule::where('professional_id', $professional->id)
            ->where('is_enabled', true)
            ->pluck('day_of_week')
            ->toArray();

        $availableDates = [];

        while ($current <= $end) {
            $dayName = $current->format('l');

            if (in_array($dayName, $enabledDays)) {
                $slots = $this->getAvailableSlots($professional, $service, $current->toDateString());
                if (!empty($slots)) {
                    $availableDates[] = $current->toDateString(); // 'Y-m-d'
                }
            }

            $current->addDay();
        }

        return $availableDates;
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
