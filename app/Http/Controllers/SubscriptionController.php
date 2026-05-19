<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $startsAt = now();
        $currentExpiry = $user->getRawOriginal('subscription_expires_at');
        if ($currentExpiry && strtotime($currentExpiry) > time()) {
            $expiresAt = (new \DateTime($currentExpiry))->modify('+' . $plan['duration_days'] . ' days');
        } else {
            $expiresAt = (clone $startsAt)->modify('+' . $plan['duration_days'] . ' days');
        }

        $user->update([
            'subscription_tier' => $request->plan,
            'subscription_started_at' => $user->getRawOriginal('subscription_started_at') ?? $startsAt,
            'subscription_expires_at' => $expiresAt,
        ]);

        return redirect()->route('premium')
            ->with('success', 'Subscription activated. Selamat menjadi member Premium!');
    }

    public function cancel(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $user->update([
            'subscription_tier' => 'free',
            'subscription_started_at' => null,
            'subscription_expires_at' => null,
        ]);

        return redirect()->route('premium')
            ->with('success', 'Subscription cancelled.');
    }
}
