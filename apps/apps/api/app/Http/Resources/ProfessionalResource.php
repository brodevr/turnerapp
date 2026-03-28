<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfessionalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'specialization' => $this->specialization,
            'color' => $this->color,
            'active' => $this->active,
            'created' => $this->created_at->toIso8601String(),
            'updated' => $this->updated_at->toIso8601String(),
        ];
    }
}
