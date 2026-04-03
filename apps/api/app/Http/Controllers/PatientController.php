<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Patient::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('lastname', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%");
            });
        }

        $patients = $query->orderBy('lastname')->paginate(20);

        return \App\Http\Resources\PatientResource::collection($patients);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'required|email|unique:patients,email',
            'dni' => 'nullable|string|max:20',
            'birthdate' => 'nullable|date',
        ]);

        $validated['password'] = bcrypt('patient' . date('Y'));

        $patient = \App\Models\Patient::create($validated);
        return new \App\Http\Resources\PatientResource($patient);
    }

    public function show($id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        return new \App\Http\Resources\PatientResource($patient);
    }

    public function update(Request $request, $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'lastname' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:30',
            'email' => 'sometimes|email|unique:patients,email,' . $id,
            'dni' => 'sometimes|string|max:20',
        ]);

        $patient->update($validated);
        return new \App\Http\Resources\PatientResource($patient);
    }

    public function destroy($id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $patient->delete();
        return response()->noContent();
    }
}
