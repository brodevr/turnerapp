<?php

namespace App\Http\Controllers;

use App\Models\Professional;
use App\Models\Service;
use App\Services\AvailabilityService;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function __construct(protected AvailabilityService $availabilityService)
    {}

    public function index(Request $request)
    {
        $request->validate([
            'professional_id' => 'required|exists:professionals,id',
            'service_id'      => 'required|exists:services,id',
            'date'            => 'required|date',
        ]);

        $professional = Professional::findOrFail($request->professional_id);
        $service      = Service::findOrFail($request->service_id);

        $allSlots = $this->availabilityService->getAllSlotsWithStatus(
            $professional,
            $service,
            $request->date
        );

        $available = array_values(array_filter($allSlots, fn($s) => $s['available']));
        $available = array_column($available, 'time');

        return response()->json([
            'data' => [
                'available' => $available,
                'all_slots' => $allSlots,   // [{ time, available }]
            ],
        ]);
    }

    public function month(Request $request)
    {
        $request->validate([
            'professional_id' => 'required|exists:professionals,id',
            'service_id'      => 'required|exists:services,id',
            'year'            => 'required|integer|min:2020|max:2100',
            'month'           => 'required|integer|min:1|max:12',
        ]);

        $professional = Professional::findOrFail($request->professional_id);
        $service      = Service::findOrFail($request->service_id);

        $dates = $this->availabilityService->getAvailableDaysInMonth(
            $professional,
            $service,
            (int) $request->year,
            (int) $request->month
        );

        return response()->json(['data' => $dates]);
    }
}
