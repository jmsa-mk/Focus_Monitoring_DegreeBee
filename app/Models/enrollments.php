<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class enrollments extends Model
{
    /** @use HasFactory<\Database\Factories\EnrollmentsFactory> */
    use HasFactory;

     protected $fillable = [
        'user_id',
        'class_id'
    ];
    public function class()
    {
        return $this->belongsTo(classes::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
