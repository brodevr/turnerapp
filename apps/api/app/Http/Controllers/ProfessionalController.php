<?php

namespace App\Http\Controllers;

use App\Models\Professional;
use App\Http\Resources\ProfessionalResource;
use Illuminate\Http\Request;

class ProfessionalController extends Controller
{
    public function index()
    {
        // Admin dashboard needs all professionals, not just active ones
        return ProfessionalResource::collection(
            Professional::orderBy('name')->get()
        );
    }

    public function show(Professional $professional)
    {
        return new ProfessionalResource($professional);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:professionals,email',
            'specialization' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:50',
            'active' => 'boolean',
        ]);

        $professional = Professional::create($validated);
        return new ProfessionalResource($professional);
    }

    public function update(Request $request, Professional $professional)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:professionals,email,' . $professional->id,
            'specialization' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:50',
            'active' => 'boolean',
        ]);

        $professional->update($validated);
        return new ProfessionalResource($professional);
    }

    public function destroy(Professional $professional)
    {
        $professional->delete();
        return response()->noContent();
    }
}
