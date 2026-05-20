<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SubscriptionTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reference_code',
        'event',
        'plan',
        'amount',
        'status',
        'payment_method',
        'completed_at',
        'note',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public const EVENT_SUBSCRIBE = 'subscribe';
    public const EVENT_RENEWAL = 'renewal';
    public const EVENT_CANCEL = 'cancel';
    public const EVENT_REFUND = 'refund';

    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a unique TXN-XXXXXXXX reference code.
     */
    public static function generateReferenceCode(): string
    {
        do {
            $code = 'TXN-' . strtoupper(Str::random(8));
        } while (self::where('reference_code', $code)->exists());

        return $code;
    }
}
