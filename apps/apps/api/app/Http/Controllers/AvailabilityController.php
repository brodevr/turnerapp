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
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date',
        ]);

        $professional = Professional::findOrFail($request->professional_id);
        $service = Service::findOrFail($request->service_id);

        $slots = $this->availabilityService->getAvailableSlots(
            $professional, 
            $service, 
            $request->date
        );

        return response()->json(['data' => $slots]);
    }
}
