<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Setting;
use App\Mail\PaymentConfirmation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\MercadoPagoConfig;

class PaymentController extends Controller
{
    /**
     * POST /api/webhooks/mercadopago
     * Receives IPN notifications from MercadoPago.
     * Must always return 200 to avoid retries.
     */
    public function webhook(Request $request)
    {
        try {
            Log::info('MercadoPago webhook received', ['payload' => $request->all(), 'headers' => $request->headers->all()]);

            $type   = $request->input('type') ?? $request->input('topic');
            $dataId = $request->input('data.id') ?? $request->input('id');

            if ($type !== 'payment' || !$dataId) {
                Log::info('MercadoPago webhook ignored', ['type' => $type, 'data_id' => $dataId]);
                return response()->json(['status' => 'ignored'], 200);
            }

            // Validate HMAC-SHA256 signature from MP (skip in local to allow testing)
            if (!app()->environment('local')) {
                $signature = $request->header('x-signature');
                $secret    = config('services.mercadopago.webhook_secret', '');
                if ($signature && $secret) {
                    [$ts, $hash] = $this->parseSignature($signature);
                    $signedTemplate = "id:{$dataId};request-date:{$ts};";
                    $expectedHash   = hash_hmac('sha256', $signedTemplate, $secret);
                    if ($hash && !hash_equals($expectedHash, $hash)) {
                        Log::warning('MercadoPago: invalid webhook signature', [
                            'data_id'   => $dataId,
                            'expected'  => $expectedHash,
                            'received'  => $hash,
                            'template'  => $signedTemplate,
                        ]);
                        return response()->json(['status' => 'ignored'], 200);
                    }
                }
            }

            // Always fetch payment from MP API — never trust webhook body alone
            if (app()->environment('local')) {
                MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);
            }
            $token = Setting::getValue('mp_access_token') ?: config('services.mercadopago.access_token');
            MercadoPagoConfig::setAccessToken($token);
            $client  = new PaymentClient();
            $payment = $client->get((int) $dataId);

            $appointmentId = $payment->external_reference;
            $appointment   = Appointment::find($appointmentId);

            if (!$appointment) {
                Log::warning('MercadoPago webhook: appointment not found', ['external_reference' => $appointmentId]);
                return response()->json(['status' => 'not_found'], 200);
            }

            // Idempotency guard
            if ($appointment->payment_status === 'approved') {
                return response()->json(['status' => 'already_processed'], 200);
            }

            $mpStatus = $payment->status;

            if ($mpStatus === 'approved') {
                $appointment->update([
                    'status'         => 'confirmed',
                    'payment_status' => 'approved',
                    'mp_payment_id'  => (string) $payment->id,
                ]);
                $appointment->load(['professional', 'service']);
                if ($appointment->customer_email) {
                    Mail::to($appointment->customer_email)->send(new PaymentConfirmation($appointment));
                }
            } elseif (in_array($mpStatus, ['rejected', 'cancelled'])) {
                $appointment->update(['payment_status' => 'rejected']);
            }
            // 'pending' / 'in_process' → leave as-is, MP will send another webhook

        } catch (\Throwable $e) {
            Log::error('MercadoPago webhook error: ' . $e->getMessage(), ['exception' => $e]);
        }

        return response()->json(['status' => 'ok'], 200);
    }

    /**
     * GET /api/settings/payment  (public + admin)
     */
    public function getPaymentSettings()
    {
        return response()->json($this->buildSettingsResponse());
    }

    /**
     * PATCH /api/settings/payment  (admin only)
     */
    public function updatePaymentSettings(Request $request)
    {
        $validated = $request->validate([
            'deposit_percentage'     => 'sometimes|numeric|min:1|max:100',
            'payment_enabled'        => 'sometimes|boolean',
            'payment_expiry_minutes' => 'sometimes|integer|min:5|max:1440',
        ]);

        foreach ($validated as $key => $value) {
            Setting::where('key', $key)->update(['value' => (string) $value]);
        }

        return response()->json($this->buildSettingsResponse());
    }

    private function buildSettingsResponse(): array
    {
        $accessToken = Setting::getValue('mp_access_token');
        return [
            'deposit_percentage'     => Setting::getValue('deposit_percentage', 30),
            'payment_enabled'        => Setting::getValue('payment_enabled', true),
            'payment_expiry_minutes' => Setting::getValue('payment_expiry_minutes', 30),
            'mp_connected'           => !empty($accessToken),
            'mp_email'               => Setting::getValue('mp_email', ''),
            'mp_user_id'             => Setting::getValue('mp_user_id', ''),
        ];
    }

    private function parseSignature(string $signature): array
    {
        $ts   = '';
        $hash = '';
        foreach (explode(',', $signature) as $part) {
            [$key, $value] = explode('=', trim($part), 2);
            if ($key === 'ts') $ts   = $value;
            if ($key === 'v1') $hash = $value;
        }
        return [$ts, $hash];
    }
}
