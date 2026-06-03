<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsurePremium
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        if (($user->getRawOriginal('role') ?? 'student') === 'admin') {
            return $next($request);
        }

        $tier = $user->getRawOriginal('subscription_tier') ?? 'free';
        $expiry = $user->getRawOriginal('subscription_expires_at');
        $isPremium = $tier !== 'free' && $expiry && strtotime($expiry) > time();

        if (!$isPremium) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Premium subscription required to access this feature.',
                ], 403);
            }
            return redirect()->route('premium')->withErrors([
                'premium' => 'Fitur ini hanya tersedia untuk pengguna Premium. Silakan upgrade.',
            ]);
        }

        return $next($request);
    }
}
