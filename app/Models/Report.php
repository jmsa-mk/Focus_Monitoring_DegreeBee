<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reportable_type',
        'reportable_id',
        'reason',
        'description',
        'status',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_REVIEWED = 'reviewed';
    public const STATUS_DISMISSED = 'dismissed';

    public const REASONS = [
        'inappropriate' => 'Konten tidak pantas',
        'spam'          => 'Spam atau menyesatkan',
        'copyright'     => 'Pelanggaran hak cipta',
        'harassment'    => 'Pelecehan / ujaran kebencian',
        'other'         => 'Lainnya',
    ];

    public function reportable()
    {
        return $this->morphTo();
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
