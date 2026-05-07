<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'role',
        'university',
        'major',
        'bio',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['avatar_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::get(function () {
            $value = $this->getRawOriginal('avatar');

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
        return $this->hasMany(Video::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function bookmarkedVideos()
    {
        return $this->belongsToMany(Video::class, 'bookmarks');
    }

    public function classesCreated()
    {
        return $this->hasMany(classes::class, 'creator_id');
    }

    public function enrolledClasses()
    {
        return $this->belongsToMany(
            classes::class,
            'enrollments',
            'user_id',
            'class_id'
        )
            ->withPivot('progress')
            ->withTimestamps();
    }

    public function focusLogs()
    {
        return $this->hasMany(FocusLog::class);
    }
}
