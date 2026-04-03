<?php

namespace App\Http\Controllers;

use App\Models\PatientHistory;
use Illuminate\Http\Request;

class PatientHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
        ]);

        $history = PatientHistory::with('professional')
            ->where('patient_id', $request->patient_id)
            ->orderBy('date', 'desc')
            ->get();

        return \App\Http\Resources\PatientHistoryResource::collection($history);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'professional_id' => 'required|exists:professionals,id',
            'date' => 'required|date',
            'observations' => 'required|string',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // Max 5MB per image
            'extra_data' => 'nullable|array',
        ]);

        $imageUrls = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // Store on R2/S3
                $path = $image->store('patient-history', 's3');
                $imageUrls[] = \Illuminate\Support\Facades\Storage::disk('s3')->url($path);
            }
        }

        $history = PatientHistory::create([
            'patient_id' => $validated['patient_id'],
            'professional_id' => $validated['professional_id'],
            'date' => $validated['date'],
            'observations' => $validated['observations'],
            'images' => $imageUrls,
            'extra_data' => $validated['extra_data'] ?? [],
        ]);

        return new \App\Http\Resources\PatientHistoryResource($history->load('professional'));
    }

    public function show($id)
    {
        $history = PatientHistory::with('professional')->findOrFail($id);
        return new \App\Http\Resources\PatientHistoryResource($history);
    }

    public function update(Request $request, PatientHistory $patientHistory)
    {
        // Simple update for now (observations/date/extra_data)
        $validated = $request->validate([
            'date' => 'sometimes|date',
            'observations' => 'sometimes|string',
            'extra_data' => 'nullable|array',
        ]);

        $patientHistory->update($validated);
        return new \App\Http\Resources\PatientHistoryResource($patientHistory);
    }

    public function destroy(PatientHistory $patientHistory)
    {
        // Delete images from R2/S3 first
        if ($patientHistory->images) {
            foreach ($patientHistory->images as $url) {
                // Extract relative path from URL (simplified approach)
                $path = str_replace(\Illuminate\Support\Facades\Storage::disk('s3')->url(''), '', $url);
                \Illuminate\Support\Facades\Storage::disk('s3')->delete($path);
            }
        }

        $patientHistory->delete();
        return response()->noContent();
    }
}
