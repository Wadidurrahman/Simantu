<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PegawaiResource extends JsonResource
{
    /**
     * Format data resource ke array JSON.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nip' => $this->nip,
            'nama_lengkap' => $this->nama_lengkap,
            'jabatan' => $this->jabatan,
            'kontak' => [
                'email' => $this->email,
                'nomor_hp' => $this->nomor_hp,
            ],
            'status' => $this->is_active ? 'Aktif' : 'Non-Aktif',
            'dibuat_pada' => $this->created_at->toIso8601String(),
            'diperbarui_pada' => $this->updated_at->toIso8601String(),
        ];
    }
}
