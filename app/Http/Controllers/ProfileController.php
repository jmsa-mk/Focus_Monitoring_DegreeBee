<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\classes;
use App\Models\enrollments;
use App\Models\FocusLog;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit()
    {
        return Inertia::render('EditProfile', [
            'user' => Auth::user(),
        ]);
    }

    public function show()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Focus aggregates
        $base = FocusLog::where('user_id', $user->id);
        $totalFocus = (clone $base)->sum('focus_time');
        $totalUnfocus = (clone $base)->sum('unfocus_time');
        $sessionCount = (clone $base)->count();
        $avgScore = (clone $base)->avg('focus_score');
        $bestSession = (clone $base)
            ->with('video:id,title')
            ->orderByDesc('focus_score')
            ->orderByDesc('focus_time')
            ->first();

        // Paginated sessions (5 per page, 'session_page' query param)
        $recentSessions = FocusLog::where('user_id', $user->id)
            ->with('video:id,title,topic,youtube_link')
            ->latest()
            ->paginate(5, ['*'], 'session_page')
            ->withQueryString();

        // Daily stats — last 7 days (fill empty days with zeros)
        $rawDaily = FocusLog::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as date, AVG(focus_score) as avg_score, SUM(focus_time) as total_focus, COUNT(*) as sessions')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $dailyStats = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $row = $rawDaily->get($date);
            $dailyStats->push([
                'date' => $date,
                'label' => now()->subDays($i)->format('D'),
                'avg_score' => round($row->avg_score ?? 0, 1),
                'total_focus' => (int) ($row->total_focus ?? 0),
                'sessions' => (int) ($row->sessions ?? 0),
            ]);
        }

        // Top topic
        $topTopic = DB::table('focus_logs')
            ->join('videos', 'videos.id', '=', 'focus_logs.video_id')
            ->where('focus_logs.user_id', $user->id)
            ->whereNotNull('videos.topic')
            ->selectRaw('videos.topic, SUM(focus_logs.focus_time) as total')
            ->groupBy('videos.topic')
            ->orderByDesc('total')
            ->first();

        // Activity counts
        $stats = [
            'videos_uploaded' => Video::where('user_id', $user->id)->count(),
            'videos_watched' => FocusLog::where('user_id', $user->id)->distinct()->count('video_id'),
            'bookmarks_count' => Bookmark::where('user_id', $user->id)->count(),
            'classes_created' => classes::where('creator_id', $user->id)->count(),
            'classes_joined' => enrollments::where('user_id', $user->id)->count(),
        ];

        // Focus level (gamification, based on total focused hours)
        $hours = $totalFocus / 3600;
        $level = match (true) {
            $hours >= 50 => ['name' => 'Platinum Bee', 'icon' => 'fa-solid fa-crown', 'color' => '#172D9D'],
            $hours >= 10 => ['name' => 'Gold Bee', 'icon' => 'fa-solid fa-star', 'color' => '#01A9F2'],
            $hours >= 1 => ['name' => 'Silver Bee', 'icon' => 'fa-solid fa-award', 'color' => '#797CFF'],
            default => ['name' => 'Bronze Bee', 'icon' => 'fa-solid fa-medal', 'color' => '#00E2E0'],
        };

        // Achievements
        $achievements = [
            [
                'name' => 'First Session',
                'desc' => 'Complete your first focus session',
                'icon' => 'fa-regular fa-file-video',
                'unlocked' => $sessionCount >= 1,
            ],
            [
                'name' => '10 Sessions',
                'desc' => 'Complete 10 focus sessions',
                'icon' => 'fa-solid fa-bullseye',
                'unlocked' => $sessionCount >= 10,
            ],
            [
                'name' => '1 Hour Focused',
                'desc' => 'Accumulate 1 hour of focus time',
                'icon' => 'fa-regular fa-clock',
                'unlocked' => $totalFocus >= 3600,
            ],
            [
                'name' => 'Sharp Mind',
                'desc' => 'Average focus score above 80%',
                'icon' => 'fa-solid fa-brain',
                'unlocked' => ($avgScore ?? 0) >= 80,
            ],
            [
                'name' => 'Content Creator',
                'desc' => 'Upload your first video',
                'icon' => 'fa-regular fa-camera',
                'unlocked' => $stats['videos_uploaded'] >= 1,
            ],
            [
                'name' => 'Class Builder',
                'desc' => 'Create your first class',
                'icon' => 'fa-solid fa-school',
                'unlocked' => $stats['classes_created'] >= 1,
            ],
        ];

        return Inertia::render('Profile', [
            'profile_user' => $user,
            'stats' => $stats,
            'focus' => [
                'total_focus_seconds' => (int) $totalFocus,
                'total_unfocus_seconds' => (int) $totalUnfocus,
                'total_seconds' => (int) ($totalFocus + $totalUnfocus),
                'avg_focus_score' => round($avgScore ?? 0, 1),
                'session_count' => $sessionCount,
                'top_topic' => $topTopic?->topic,
                'best_session' => $bestSession,
            ],
            'level' => $level,
            'recent_sessions' => $recentSessions,
            'daily_stats' => $dailyStats,
            'achievements' => $achievements,
        ]);
    }

    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'university' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
        ]);

        $payload = [
            'name' => $validated['name'] ?? null,
            'email' => $validated['email'],
            'university' => $validated['university'] ?? null,
            'major' => $validated['major'] ?? null,
            'bio' => $validated['bio'] ?? null,
        ];

        if ($request->hasFile('avatar')) {
            $current = $user->getRawOriginal('avatar');
            if ($current && !str_starts_with($current, 'http')) {
                Storage::disk('public')->delete($current);
            }

            $payload['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($payload);

        return redirect()->route('editProfile')->with('success', 'Profile updated.');
    }

    public function showChangePassword()
    {
        return Inertia::render('ChangePassword');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }
}
