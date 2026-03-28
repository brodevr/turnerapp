<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Http\Resources\AppointmentResource;

class ClientAppointmentController extends Controller
{
    public function index(Request $request)
    {
        // Get appointments specifically for the logged-in patient
        $patientId = $request->user()->id;

        $appointments = Appointment::with(['professional', 'service'])
            ->where('patient_id', $patientId)
            ->orWhere('customer_email', $request->user()->email) // Fallback for legacy appointments
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return AppointmentResource::collection($appointments);
    }

    public function cancel(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        // Verify ownership
        $user = $request->user();
        if ($appointment->patient_id !== $user->id && $appointment->customer_email !== $user->email) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($appointment->status === 'cancelled') {
            return response()->json(['message' => 'Already cancelled'], 422);
        }

        $appointment->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Appointment cancelled successfully']);
    }
}
