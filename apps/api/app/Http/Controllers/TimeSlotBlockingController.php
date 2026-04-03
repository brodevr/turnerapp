<?php

namespace App\Http\Controllers;

use App\Models\TimeSlotBlocking;
use Illuminate\Http\Request;

class TimeSlotBlockingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TimeSlotBlocking::with('professional');

        if ($request->has('professional_id')) {
            $query->where('professional_id', $request->professional_id);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        return $query->orderBy('date', 'desc')->orderBy('start_time', 'asc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'professional_id' => 'required|exists:professionals,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'reason' => 'nullable|string|max:255',
        ]);

        $blocking = TimeSlotBlocking::create($validated);

        return response()->json($blocking, 201);
    }

    public function show(TimeSlotBlocking $timeSlotBlocking)
    {
        return $timeSlotBlocking->load('professional');
    }

    public function update(Request $request, TimeSlotBlocking $timeSlotBlocking)
    {
        $validated = $request->validate([
            'professional_id' => 'sometimes|exists:professionals,id',
            'date' => 'sometimes|date',
            'start_time' => 'sometimes',
            'end_time' => 'sometimes',
            'reason' => 'nullable|string|max:255',
        ]);

        $timeSlotBlocking->update($validated);

        return response()->json($timeSlotBlocking);
    }

    public function destroy(TimeSlotBlocking $timeSlotBlocking)
    {
        $timeSlotBlocking->delete();
        return response()->noContent();
    }
}
