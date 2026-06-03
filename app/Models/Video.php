<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    /** @use HasFactory<\Database\Factories\VideoFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'youtube_link',
        'topic',
        'notes',
        'user_id',
        'class_id',
        'is_private'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function bookmarks(){
        return $this->hasMany(Bookmark::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function getAvgRatingAttribute()
    {
        return round($this->ratings()->avg('rating'), 1);
    }

    public function class()
    {
        return $this->belongsTo(classes::class, 'class_id');
    }

    public function focusLogs()
    {
        return $this->hasMany(FocusLog::class);
    }

    public function reports()
    {
        return $this->morphMany(Report::class, 'reportable');
    }
}
