<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'duration' => $this->duration_minutes, // mapped map to what frontend expects
            'price' => $this->price,
            'color' => $this->color,
            'created' => $this->created_at->toIso8601String(),
            'updated' => $this->updated_at->toIso8601String(),
        ];
    }
}
