<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
        'name',
        'duration_minutes',
        'price',
        'color',
        'description',
        'image_url',
        'is_promo',
        'promo_label',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'price'            => 'decimal:2',
        'is_promo'         => 'boolean',
    ];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
