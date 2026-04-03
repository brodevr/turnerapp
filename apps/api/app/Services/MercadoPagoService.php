<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Setting;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

class MercadoPagoService
{
    public function __construct()
    {
        // In local env the SDK disables SSL verification automatically
        // (sets CURLOPT_SSL_VERIFYPEER/VERIFYHOST = false) when runtime = LOCAL.
        if (app()->environment('local')) {
            MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);
        }

        // Prefer the token stored via OAuth; fallback to .env for dev/testing
        $token = Setting::getValue('mp_access_token') ?: config('services.mercadopago.access_token');
        MercadoPagoConfig::setAccessToken($token);
    }

    public function createPreference(Appointment $appointment, float $depositAmount): array
    {
        $client = new PreferenceClient();

        $frontendUrl = config('services.mercadopago.frontend_url', 'http://localhost:5173');

        $serviceName = $appointment->service->name ?? 'Turno';
        $nameParts   = explode(' ', trim($appointment->customer_name), 2);
        $firstName   = $nameParts[0] ?? $appointment->customer_name;
        $lastName    = $nameParts[1] ?? '';

        $preference = $client->create([
            'items' => [
                [
                    'id'          => 'TURNO-' . $appointment->id,
                    'title'       => 'Seña - ' . $serviceName,
                    'description' => 'Seña por reserva de turno: ' . $serviceName,
                    'category_id' => 'services',
                    'quantity'    => 1,
                    'currency_id' => 'ARS',
                    'unit_price'  => (float) $depositAmount,
                ],
            ],
            'payer' => [
                'name'    => $firstName,
                'surname' => $lastName,
                'email'   => $appointment->customer_email,
                'phone'   => [
                    'area_code' => '',
                    'number'    => preg_replace('/\D/', '', $appointment->customer_phone ?? ''),
                ],
            ],
            'back_urls' => [
                'success' => "{$frontendUrl}/payment/success",
                'failure' => "{$frontendUrl}/payment/failure",
                'pending' => "{$frontendUrl}/payment/pending",
            ],
            'auto_return'          => 'approved',
            'external_reference'   => (string) $appointment->id,
            'notification_url'     => config('app.url') . '/api/webhooks/mercadopago',
            'statement_descriptor' => 'Virginia Rojas Beauty',
            'expires'              => true,
            'expiration_date_to'   => $appointment->payment_expires_at->toIso8601String(),
        ]);

        return [
            'id'                 => $preference->id,
            'init_point'         => $preference->init_point,
            'sandbox_init_point' => $preference->sandbox_init_point,
        ];
    }
}
