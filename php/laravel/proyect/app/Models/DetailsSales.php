<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailsSales extends Model
{
    use HasFactory;
    protected $table = 'detailssales';
    public $timestamps = false;
    
    protected $fillable = [
        'sale',
        'product',
        'quantity',
    ];
}

