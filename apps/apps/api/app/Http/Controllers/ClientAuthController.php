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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
