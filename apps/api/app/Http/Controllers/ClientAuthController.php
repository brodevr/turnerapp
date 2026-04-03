<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Patient;

class ClientAuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:50',
            'dni' => 'nullable|string|max:50',
            'birthdate' => 'nullable|date',
            'google_id' => 'nullable|string|unique:patients,google_id',
        ]);

        // Attempt to find existing patient by email (they might have booked before without a password)
        $patient = Patient::where('email', $validated['email'])->first();

        if ($patient) {
            if ($patient->password) {
                return response()->json(['message' => 'Email already registered.'], 422);
            }
            // Upgrade existing patient record with auth details
            $patient->update([
                'password' => Hash::make($validated['password']),
                'name' => $validated['name'],
                'lastname' => $validated['lastname'],
                'phone' => $validated['phone'] ?? $patient->phone,
                'dni' => $validated['dni'] ?? $patient->dni,
                'birthdate' => $validated['birthdate'] ?? $patient->birthdate,
                'google_id' => $validated['google_id'] ?? $patient->google_id,
            ]);
        } else {
            $validated['password'] = Hash::make($validated['password']);
            $patient = Patient::create($validated);
        }

        $token = $patient->createToken('client-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'record' => $patient,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $patient = Patient::where('email', $request->email)->first();

        if (!$patient || !Hash::check($request->password, $patient->password)) {
            return response()->json([
                'message' => 'The provided credentials do not match our records.'
            ], 401);
        }

        $token = $patient->createToken('client-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'record' => $patient,
        ]);
    }

    public function googleLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'google_id' => 'required|string',
            'name' => 'required|string',
            'lastname' => 'nullable|string',
        ]);

        // Find patient by google_id OR email
        $patient = Patient::where('google_id', $request->google_id)
                          ->orWhere('email', $request->email)
                          ->first();

        if ($patient) {
            // Update google_id if matched by email
            if (!$patient->google_id) {
                $patient->update(['google_id' => $request->google_id]);
            }
        } else {
            // Create new patient from Google data
            // Generate a random password since they logged in with Google
            $randomPassword = Hash::make(\Illuminate\Support\Str::random(16));
            $patient = Patient::create([
                'name' => $request->name,
                'lastname' => $request->lastname ?? '',
                'email' => $request->email,
                'google_id' => $request->google_id,
                'password' => $randomPassword,
            ]);
        }

        $token = $patient->createToken('client-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'record' => $patient,
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'data' => $request->user()
        ]);
    }

    public function updateProfile(Request $request)
    {
        $patient = $request->user();
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'lastname' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:50',
            'dni' => 'nullable|string|max:50',
            'birthdate' => 'nullable|date',
        ]);

        $patient->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'record' => $patient
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $patient = $request->user();

        if (!Hash::check($request->current_password, $patient->password)) {
            return response()->json([
                'message' => 'The provided password does not match your current password.'
            ], 422);
        }

        $patient->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $patient = Patient::where('email', $request->email)->first();

        if (!$patient) {
            return response()->json(['message' => 'If your email is registered, you will receive a reset link.'], 200);
        }

        // Generate token and send email logic
        // For simplicity in this specialized setup, we'll use a direct token approach
        $token = \Illuminate\Support\Str::random(64);
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $patient->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $resetUrl = env('FRONTEND_URL') . "/client/reset-password?token=" . $token . "&email=" . urlencode($patient->email);

        // Send Email (Reusing reminder logic style)
        \Illuminate\Support\Facades\Mail::to($patient->email)->send(new \App\Mail\GenericMail(
            "Recuperar Contraseña - Virginia Rojas Beauty",
            "Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar:",
            $resetUrl,
            "Restablecer Contraseña"
        ));

        return response()->json(['message' => 'Reset link sent to your email.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid or expired token.'], 422);
        }

        $patient = Patient::where('email', $request->email)->first();
        if ($patient) {
            $patient->update(['password' => Hash::make($request->password)]);
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        }

        return response()->json(['message' => 'Password has been reset successfully.']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
