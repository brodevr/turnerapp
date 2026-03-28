<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = Schedule::query();
        if ($request->has('professional_id')) $query->where('professional_id', $request->professional_id);
        if ($request->has('day_of_week')) $query->where('day_of_week', $request->day_of_week);
        if ($request->has('is_enabled')) $query->where('is_enabled', $request->is_enabled);
        
        return response()->json(['data' => $query->get()]);
    }

    public function show(Schedule $schedule)
    {
        return response()->json(['data' => $schedule]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'professional_id' => 'required|exists:professionals,id',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_enabled' => 'boolean',
        ]);

        $schedule = Schedule::create($validated);
        return response()->json(['data' => $schedule]);
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'professional_id' => 'sometimes|exists:professionals,id',
            'day_of_week' => 'sometimes|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i', // should ideally validate after start_time if both are provided
            'is_enabled' => 'boolean',
        ]);

        $schedule->update($validated);
        return response()->json(['data' => $schedule]);
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return response()->noContent();
    }
}
