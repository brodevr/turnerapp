<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MercadoPagoOAuthController extends Controller
{
    /**
     * GET /api/auth/mercadopago/connect  (admin protected)
     * Returns the MP OAuth authorization URL.
     */
    public function connect()
    {
        $state       = Str::random(32);
        $clientId    = config('services.mercadopago.client_id');
        $redirectUri = config('app.url') . '/api/auth/mercadopago/callback';

        Cache::put("mp_oauth_{$state}", true, now()->addMinutes(10));

        $authUrl = 'https://auth.mercadopago.com.ar/authorization?' . http_build_query([
            'client_id'     => $clientId,
            'response_type' => 'code',
            'platform_id'   => 'mp',
            'redirect_uri'  => $redirectUri,
            'state'         => $state,
        ]);

        return response()->json(['url' => $authUrl]);
    }

    /**
     * GET /api/auth/mercadopago/callback  (public — called by MP after authorization)
     */
    public function callback(Request $request)
    {
        $frontendUrl = config('services.mercadopago.frontend_url', 'http://localhost:5173');
        $settingsUrl = "{$frontendUrl}/admin/payment-settings";

        // Verify CSRF state
        $state = $request->input('state');
        if (!$state || !Cache::has("mp_oauth_{$state}")) {
            return redirect("{$settingsUrl}?mp_error=invalid_state");
        }
        Cache::forget("mp_oauth_{$state}");

        $code = $request->input('code');
        if (!$code) {
            return redirect("{$settingsUrl}?mp_error=no_code");
        }

        // Exchange authorization code for access_token
        $tokenResponse = Http::asForm()->post('https://api.mercadopago.com/oauth/token', [
            'grant_type'    => 'authorization_code',
            'client_id'     => config('services.mercadopago.client_id'),
            'client_secret' => config('services.mercadopago.client_secret'),
            'code'          => $code,
            'redirect_uri'  => config('app.url') . '/api/auth/mercadopago/callback',
        ]);

        if (!$tokenResponse->successful()) {
            return redirect("{$settingsUrl}?mp_error=token_exchange_failed");
        }

        $data        = $tokenResponse->json();
        $accessToken = $data['access_token'];
        $userId      = (string) ($data['user_id'] ?? '');

        // Fetch account email from MP Users API
        $email = '';
        if ($userId) {
            $userResponse = Http::withToken($accessToken)
                ->get("https://api.mercadopago.com/users/{$userId}");
            if ($userResponse->successful()) {
                $email = $userResponse->json('email', '');
            }
        }

        // Persist to settings table
        $toSave = [
            'mp_access_token'  => $accessToken,
            'mp_refresh_token' => $data['refresh_token'] ?? '',
            'mp_public_key'    => $data['public_key']    ?? '',
            'mp_user_id'       => $userId,
            'mp_email'         => $email,
        ];

        foreach ($toSave as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'type' => 'string', 'description' => "MercadoPago OAuth"]
            );
        }

        return redirect("{$settingsUrl}?mp_connected=1");
    }

    /**
     * DELETE /api/auth/mercadopago/connect  (admin protected)
     * Removes the stored MP credentials.
     */
    public function disconnect()
    {
        Setting::whereIn('key', [
            'mp_access_token', 'mp_refresh_token',
            'mp_public_key', 'mp_user_id', 'mp_email',
        ])->delete();

        return response()->json(['status' => 'disconnected']);
    }
}
