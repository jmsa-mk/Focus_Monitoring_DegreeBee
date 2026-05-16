<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ForumPostInsight extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'forum_post_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function forumPost()
    {
        return $this->belongsTo(ForumPost::class);
    }
}
