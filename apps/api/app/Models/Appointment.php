<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'patient_id',
        'professional_id',
        'service_id',
        'date',
        'start_time',
        'end_time',
        'status',
        'customer_name',
        'customer_email',
        'customer_phone',
        'reminder_sent_at',
        'payment_status',
        'mp_preference_id',
        'mp_payment_id',
        'deposit_amount',
        'deposit_percentage',
        'payment_expires_at',
    ];

    protected $casts = [
        'date'               => 'date',
        'reminder_sent_at'   => 'datetime',
        'payment_expires_at' => 'datetime',
        'deposit_amount'     => 'decimal:2',
        'deposit_percentage' => 'decimal:2',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function professional(): BelongsTo
    {
        return $this->belongsTo(Professional::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
