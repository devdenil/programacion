<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'client',
        'seller',
        'mount',
        'type',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client');
    }
}
