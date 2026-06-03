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
        'subscription_tier',
        'subscription_started_at',
        'subscription_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['avatar_url', 'is_premium', 'is_admin', 'subscription_label', 'subscription_days_left'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'subscription_started_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected function isPremium(): Attribute
    {
        return Attribute::get(function () {
            // Admins have full access to every premium feature.
            if (($this->getRawOriginal('role') ?? 'student') === 'admin') {
                return true;
            }
            $tier = $this->getRawOriginal('subscription_tier') ?? 'free';
            if ($tier === 'free') return false;
            $expiresRaw = $this->getRawOriginal('subscription_expires_at');
            if (!$expiresRaw) return false;
            return strtotime($expiresRaw) > time();
        });
    }

    protected function isAdmin(): Attribute
    {
        return Attribute::get(function () {
            return ($this->getRawOriginal('role') ?? 'student') === 'admin';
        });
    }

    protected function subscriptionLabel(): Attribute
    {
        return Attribute::get(function () {
            $tier = $this->getRawOriginal('subscription_tier') ?? 'free';
            return match ($tier) {
                'monthly' => 'Monthly Plan',
                'yearly' => 'Yearly Plan',
                default => 'Free Plan',
            };
        });
    }

    protected function subscriptionDaysLeft(): Attribute
    {
        return Attribute::get(function () {
            $expiresRaw = $this->getRawOriginal('subscription_expires_at');
            if (!$expiresRaw) return null;
            $diff = strtotime($expiresRaw) - time();
            if ($diff <= 0) return 0;
            return (int) ceil($diff / 86400);
        });
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
