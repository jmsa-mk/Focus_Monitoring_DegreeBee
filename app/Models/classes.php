<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class classes extends Model
{
    /** @use HasFactory<\Database\Factories\ClassesFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'thumbnail',
        'creator_id',
        'visibility',
        'code',
    ];

    protected $appends = ['thumbnail_url'];

    protected function thumbnailUrl(): Attribute
    {
        return Attribute::get(function () {
            $value = $this->getRawOriginal('thumbnail');

            if (!$value) {
                return null;
            }

            if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
                return $value;
            }

            return '/storage/' . ltrim($value, '/');
        });
    }

    public function videos()
    {
        return $this->hasMany(Video::class, 'class_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function enrollments()
    {
        return $this->hasMany(enrollments::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'class_id', 'user_id');
    }

    public function students()
    {
        return $this->belongsToMany(
            User::class,
            'enrollments',
            'class_id',
            'user_id'
        );
    }
}
