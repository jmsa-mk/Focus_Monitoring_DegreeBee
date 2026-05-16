<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ForumPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'class_id',
        'parent_id',
        'body',
        'file_path',
        'file_name',
        'file_size',
    ];

    protected $appends = ['file_url'];

    protected function fileUrl(): Attribute
    {
        return Attribute::get(function () {
            $value = $this->getRawOriginal('file_path');
            if (!$value) return null;
            return '/storage/' . ltrim($value, '/');
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function class()
    {
        return $this->belongsTo(classes::class, 'class_id');
    }

    public function parent()
    {
        return $this->belongsTo(ForumPost::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(ForumPost::class, 'parent_id');
    }

    public function insights()
    {
        return $this->hasMany(ForumPostInsight::class);
    }
}
