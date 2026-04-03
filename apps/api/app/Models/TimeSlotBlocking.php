<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeSlotBlocking extends Model
{
    protected $fillable = [
        'professional_id',
        'date',
        'start_time',
        'end_time',
        'reason',
    ];

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }
}
