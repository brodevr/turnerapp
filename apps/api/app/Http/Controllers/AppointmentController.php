<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Http\Resources\AppointmentResource;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        $query = Appointment::with(['patient', 'professional', 'service'])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc');

        return AppointmentResource::collection($query->get());
    }

    public function store(Request $request, \App\Services\AvailabilityService $availabilityService)
    {
        $validated = $request->validate([
            'patient_id' => 'nullable|exists:patients,id',
            'professional_id' => 'required|exists:professionals,id',
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed,no_show',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:50',
        ]);

        // Phase 5: Server-side validation
        $professional = \App\Models\Professional::findOrFail($validated['professional_id']);
        $service = \App\Models\Service::findOrFail($validated['service_id']);

        if (!$availabilityService->isValidSlot($professional, $service, $validated['date'], $validated['start_time'])) {
            return response()->json([
                'message' => 'The selected time slot is no longer available.',
                'errors' => ['start_time' => ['This slot conflicts with another appointment or falls outside working hours.']]
            ], 422);
        }

        $appointment = Appointment::create($validated);

        return new AppointmentResource($appointment);
    }

    public function show($id)
    {
        $appointment = Appointment::with(['patient', 'professional', 'service'])->findOrFail($id);
        return new AppointmentResource($appointment);
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed,no_show',
            // other fields are usually not updated by admins, mainly status
        ]);

        $appointment->update($validated);

        $appointment->load(['patient', 'professional', 'service']);
        return new AppointmentResource($appointment);
    }

    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();
        return response()->noContent();
    }

    public function sendReminder($id)
    {
        $appointment = Appointment::with(['patient', 'professional', 'service'])->findOrFail($id);

        if (!$appointment->customer_email) {
            return response()->json(['message' => 'The customer has no email address.'], 422);
        }

        \Illuminate\Support\Facades\Mail::to($appointment->customer_email)->send(new \App\Mail\AppointmentReminder($appointment));

        $appointment->update(['reminder_sent_at' => now()]);

        return new AppointmentResource($appointment);
    }
}
