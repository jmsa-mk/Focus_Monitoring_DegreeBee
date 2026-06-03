<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $isAdmin = ($user->getRawOriginal('role') ?? 'student') === 'admin';

        if (!$isAdmin) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Admin access required.',
                ], 403);
            }
            abort(403, 'Halaman ini hanya dapat diakses oleh administrator.');
        }

        return $next($request);
    }
}
