<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'duration_minutes' => $this->duration_minutes,
            'price'            => $this->price,
            'color'            => $this->color,
            'description'      => $this->description,
            'image_url'        => $this->image_url,
            'is_promo'         => (bool) $this->is_promo,
            'promo_label'      => $this->promo_label,
            'created'          => $this->created_at->toIso8601String(),
            'updated'          => $this->updated_at->toIso8601String(),
        ];
    }
}
