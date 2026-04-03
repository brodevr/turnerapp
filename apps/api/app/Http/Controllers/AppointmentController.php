<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Professional;
use App\Models\Service;
use App\Models\Setting;
use App\Http\Resources\AppointmentResource;
use App\Mail\AppointmentConfirmation;
use App\Mail\AppointmentCancellation;
use App\Services\AvailabilityService;
use App\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'professional', 'service'])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc');

        if ($request->has('professional_id')) {
            $query->where('professional_id', $request->professional_id);
        }
        if ($request->has('start_date')) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        return AppointmentResource::collection($query->get());
    }

    public function store(Request $request, AvailabilityService $availabilityService)
    {
        $validated = $request->validate([
            'patient_id'     => 'nullable|exists:patients,id',
            'professional_id'=> 'required|exists:professionals,id',
            'service_id'     => 'required|exists:services,id',
            'date'           => 'required|date',
            'start_time'     => 'required|date_format:H:i',
            'end_time'       => 'required|date_format:H:i|after:start_time',
            'customer_name'  => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:50',
        ]);

        $professional = Professional::findOrFail($validated['professional_id']);
        $service      = Service::findOrFail($validated['service_id']);

        if (!$availabilityService->isValidSlot($professional, $service, $validated['date'], $validated['start_time'])) {
            return response()->json([
                'message' => 'The selected time slot is no longer available.',
                'errors'  => ['start_time' => ['This slot conflicts with another appointment or falls outside working hours.']],
            ], 422);
        }

        // Determine if payment is required
        $paymentEnabled    = Setting::getValue('payment_enabled', true);
        $depositPercentage = Setting::getValue('deposit_percentage', 30);
        $expiryMinutes     = Setting::getValue('payment_expiry_minutes', 30);
        $requiresPayment   = $paymentEnabled && $service->price > 0;

        $appointmentData = array_merge($validated, [
            'status'         => $requiresPayment ? 'pending_payment' : 'pending',
            'payment_status' => $requiresPayment ? 'pending' : 'not_required',
        ]);

        if ($requiresPayment) {
            $depositAmount                          = round($service->price * $depositPercentage / 100, 2);
            $appointmentData['deposit_amount']      = $depositAmount;
            $appointmentData['deposit_percentage']  = $depositPercentage;
            $appointmentData['payment_expires_at']  = now()->addMinutes($expiryMinutes);
        }

        if ($requiresPayment) {
            try {
                [$appointment, $preference] = DB::transaction(function () use ($appointmentData, $depositAmount) {
                    $appt = Appointment::create($appointmentData);
                    $appt->load('service');
                    $preference = app(MercadoPagoService::class)->createPreference($appt, $depositAmount);
                    $appt->update(['mp_preference_id' => $preference['id']]);
                    return [$appt, $preference];
                });
            } catch (\MercadoPago\Exceptions\MPApiException $e) {
                $apiBody = $e->getApiResponse()->getContent();
                return response()->json([
                    'message'    => 'MercadoPago API error',
                    'mp_status'  => $e->getStatusCode(),
                    'mp_body'    => $apiBody,
                ], 500);
            } catch (\Throwable $e) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'trace'   => $e->getTraceAsString(),
                ], 500);
            }

            $appointment->load(['professional', 'service']);
            if ($appointment->customer_email) {
                Mail::to($appointment->customer_email)->send(new AppointmentConfirmation($appointment));
            }

            return response()->json([
                'data'    => (new AppointmentResource($appointment))->toArray($request),
                'payment' => [
                    'preference_id'      => $preference['id'],
                    'init_point'         => $preference['init_point'],
                    'sandbox_init_point' => $preference['sandbox_init_point'],
                ],
            ], 201);
        }

        $appointment = Appointment::create($appointmentData);
        $appointment->load(['professional', 'service']);
        if ($appointment->customer_email) {
            Mail::to($appointment->customer_email)->send(new AppointmentConfirmation($appointment));
        }

        return response()->json([
            'data' => (new AppointmentResource($appointment))->toArray($request),
        ], 201);
    }

    public function show($id)
    {
        $appointment = Appointment::with(['patient', 'professional', 'service'])->findOrFail($id);
        return new AppointmentResource($appointment);
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        $previousStatus = $appointment->status;

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,pending_payment,confirmed,cancelled,completed,no_show',
        ]);

        $appointment->update($validated);
        $appointment->load(['patient', 'professional', 'service']);

        if (isset($validated['status']) && $validated['status'] === 'cancelled' && $previousStatus !== 'cancelled') {
            if ($appointment->customer_email) {
                Mail::to($appointment->customer_email)->send(new AppointmentCancellation($appointment));
            }
        }

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

        \Illuminate\Support\Facades\Mail::to($appointment->customer_email)
            ->send(new \App\Mail\AppointmentReminder($appointment));

        $appointment->update(['reminder_sent_at' => now()]);

        return new AppointmentResource($appointment);
    }
}
