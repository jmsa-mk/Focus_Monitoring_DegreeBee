<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public const PLANS = [
        'monthly' => [
            'label' => 'Monthly',
            'price' => 50000,
            'duration_days' => 30,
        ],
        'yearly' => [
            'label' => 'Yearly',
            'price' => 400000,
            'duration_days' => 365,
        ],
    ];

    public function index()
    {
        return Inertia::render('Subscription', [
            'plans' => self::PLANS,
        ]);
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:monthly,yearly',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $plan = self::PLANS[$request->plan];

        DB::beginTransaction();
        try {
            $txn = SubscriptionTransaction::create([
                'user_id' => $user->id,
                'reference_code' => SubscriptionTransaction::generateReferenceCode(),
                'event' => $user->getRawOriginal('subscription_tier') !== 'free'
                    ? SubscriptionTransaction::EVENT_RENEWAL
                    : SubscriptionTransaction::EVENT_SUBSCRIBE,
                'plan' => $request->plan,
                'amount' => $plan['price'],
                'status' => SubscriptionTransaction::STATUS_PENDING,
                'payment_method' => 'mock_payment',
                'note' => 'Payment initiated (demo mode, no real charge)',
            ]);


            $startsAt = now();
            $currentExpiry = $user->getRawOriginal('subscription_expires_at');
            if ($currentExpiry && strtotime($currentExpiry) > time()) {
                $expiresAt = (new \DateTime($currentExpiry))
                    ->modify('+' . $plan['duration_days'] . ' days');
            } else {
                $expiresAt = (clone $startsAt)
                    ->modify('+' . $plan['duration_days'] . ' days');
            }

            $user->update([
                'subscription_tier' => $request->plan,
                'subscription_started_at' => $user->getRawOriginal('subscription_started_at') ?? $startsAt,
                'subscription_expires_at' => $expiresAt,
            ]);

            $txn->update([
                'status' => SubscriptionTransaction::STATUS_COMPLETED,
                'completed_at' => now(),
                'note' => 'Payment settled successfully (demo mode)',
            ]);

            DB::commit();

            return redirect()->route('premium')->with(
                'success',
                "Subscription activated. Ref: {$txn->reference_code}"
            );
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors([
                'payment' => 'Pembayaran gagal diproses. Silakan coba lagi.',
            ]);
        }
    }

    public function cancel(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->getRawOriginal('subscription_tier') === 'free') {
            return redirect()->route('premium')->with(
                'success',
                'Tidak ada subscription aktif untuk dibatalkan.'
            );
        }

        DB::beginTransaction();
        try {
            $txn = SubscriptionTransaction::create([
                'user_id' => $user->id,
                'reference_code' => SubscriptionTransaction::generateReferenceCode(),
                'event' => SubscriptionTransaction::EVENT_CANCEL,
                'plan' => $user->getRawOriginal('subscription_tier'),
                'amount' => 0,
                'status' => SubscriptionTransaction::STATUS_COMPLETED,
                'payment_method' => 'mock_payment',
                'completed_at' => now(),
                'note' => 'User cancelled subscription, reverted to free tier',
            ]);

            $user->update([
                'subscription_tier' => 'free',
                'subscription_started_at' => null,
                'subscription_expires_at' => null,
            ]);

            DB::commit();

            return redirect()->route('premium')->with(
                'success',
                "Subscription cancelled. Ref: {$txn->reference_code}"
            );
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors([
                'cancel' => 'Gagal membatalkan subscription. Silakan coba lagi.',
            ]);
        }
    }

    public function transactions()
    {
        $userId = Auth::id();
        $transactions = SubscriptionTransaction::where('user_id', $userId)
            ->latest()
            ->paginate(15);

        return Inertia::render('TransactionHistory', [
            'transactions' => $transactions,
        ]);
    }
}
