<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientHistory extends Model
{
    protected $fillable = [
        'patient_id',
        'professional_id',
        'date',
        'observations',
        'images',
        'extra_data',
    ];

    protected $casts = [
        'date' => 'date',
        'images' => 'array',
        'extra_data' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }
}
