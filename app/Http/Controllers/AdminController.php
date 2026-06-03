<?php

namespace App\Http\Controllers;

use App\Models\classes;
use App\Models\FocusLog;
use App\Models\Report;
use App\Models\SubscriptionTransaction;
use App\Models\User;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $premiumUsers = User::where('subscription_tier', '!=', 'free')
            ->whereNotNull('subscription_expires_at')
            ->where('subscription_expires_at', '>', now())
            ->count();

        $revenue = SubscriptionTransaction::where('status', SubscriptionTransaction::STATUS_COMPLETED)
            ->whereIn('event', [SubscriptionTransaction::EVENT_SUBSCRIBE, SubscriptionTransaction::EVENT_RENEWAL])
            ->sum('amount');

        $studySeconds = (int) FocusLog::sum('total_time');

        $stats = [
            'total_users'        => User::count(),
            'admin_users'        => User::where('role', 'admin')->count(),
            'premium_users'      => $premiumUsers,
            'total_videos'       => Video::count(),
            'total_classes'      => classes::count(),
            'total_focus_logs'   => FocusLog::count(),
            'study_hours'        => round($studySeconds / 3600, 1),
            'total_transactions' => SubscriptionTransaction::count(),
            'total_revenue'      => (int) $revenue,
            'pending_reports'    => Report::where('status', Report::STATUS_PENDING)->count(),
        ];

        $recentUsers = User::latest()->take(5)->get()
            ->map(fn ($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->getRawOriginal('role') ?? 'student',
                'is_premium' => $u->is_premium,
                'avatar_url' => $u->avatar_url,
                'created_at' => $u->created_at?->toDateTimeString(),
            ]);

        $recentTransactions = SubscriptionTransaction::with('user:id,name,email')
            ->latest()
            ->take(6)
            ->get();

        $recentReports = Report::with(['reporter:id,name,email', 'reportable'])
            ->where('status', Report::STATUS_PENDING)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($r) => $this->transformReport($r));

        return Inertia::render('Admin/Dashboard', [
            'stats'              => $stats,
            'recentUsers'        => $recentUsers,
            'recentTransactions' => $recentTransactions,
            'recentReports'      => $recentReports,
        ]);
    }

    public function users(Request $request)
    {
        $search = $request->string('search')->trim();

        $users = User::query()
            ->when($search->isNotEmpty(), function ($q) use ($search) {
                $term = '%' . $search . '%';
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            })
            ->withCount(['videos', 'classesCreated'])
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Admin/Users', [
            'users'   => $users,
            'filters' => ['search' => (string) $search],
        ]);
    }

    public function togglePremium(User $user)
    {
        $isPremiumNow = $user->getRawOriginal('subscription_tier') !== 'free'
            && $user->getRawOriginal('subscription_expires_at')
            && strtotime($user->getRawOriginal('subscription_expires_at')) > time();

        if ($isPremiumNow) {
            $user->update([
                'subscription_tier'       => 'free',
                'subscription_started_at' => null,
                'subscription_expires_at' => null,
            ]);
            $message = "Premium {$user->email} dicabut.";
        } else {
            $user->update([
                'subscription_tier'       => 'monthly',
                'subscription_started_at' => now(),
                'subscription_expires_at' => now()->addDays(30),
            ]);
            $message = "Premium 30 hari diberikan ke {$user->email}.";
        }

        return back()->with('success', $message);
    }

    public function toggleRole(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->withErrors(['role' => 'Anda tidak dapat mengubah role akun sendiri.']);
        }

        $newRole = ($user->getRawOriginal('role') ?? 'student') === 'admin' ? 'student' : 'admin';
        $user->update(['role' => $newRole]);

        return back()->with('success', "Role {$user->email} diubah menjadi {$newRole}.");
    }

    public function destroyUser(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->withErrors(['delete' => 'Anda tidak dapat menghapus akun sendiri.']);
        }

        $email = $user->email;
        $user->delete();

        return back()->with('success', "Pengguna {$email} dihapus.");
    }

    public function videos(Request $request)
    {
        $search = $request->string('search')->trim();

        $videos = Video::query()
            ->with('user:id,name,email')
            ->withCount('ratings')
            ->when($search->isNotEmpty(), function ($q) use ($search) {
                $term = '%' . $search . '%';
                $q->where('title', 'like', $term)
                    ->orWhere('topic', 'like', $term);
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Admin/Videos', [
            'videos'  => $videos,
            'filters' => ['search' => (string) $search],
        ]);
    }

    public function destroyVideo(Video $video)
    {
        $title = $video->title;
        $video->delete();

        return back()->with('success', "Video \"{$title}\" dihapus.");
    }

    public function classes(Request $request)
    {
        $search = $request->string('search')->trim();

        $classes = classes::query()
            ->with('creator:id,name,email')
            ->withCount(['students', 'videos'])
            ->when($search->isNotEmpty(), function ($q) use ($search) {
                $term = '%' . $search . '%';
                $q->where('title', 'like', $term)
                    ->orWhere('code', 'like', $term);
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Admin/Classes', [
            'classes' => $classes,
            'filters' => ['search' => (string) $search],
        ]);
    }

    public function destroyClass(classes $class)
    {
        $title = $class->title;
        $class->delete();

        return back()->with('success', "Kelas \"{$title}\" dihapus.");
    }

    public function transactions()
    {
        $transactions = SubscriptionTransaction::with('user:id,name,email')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions,
        ]);
    }

    public function reports(Request $request)
    {
        $status = $request->string('status')->trim();

        $reports = Report::with(['reporter:id,name,email', 'reportable'])
            ->when($status->isNotEmpty() && $status != 'all', fn ($q) => $q->where('status', (string) $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $reports->getCollection()->transform(fn ($r) => $this->transformReport($r));

        return Inertia::render('Admin/Reports', [
            'reports' => $reports,
            'filters' => ['status' => (string) ($status ?: 'all')],
            'counts'  => [
                'all'       => Report::count(),
                'pending'   => Report::where('status', Report::STATUS_PENDING)->count(),
                'reviewed'  => Report::where('status', Report::STATUS_REVIEWED)->count(),
                'dismissed' => Report::where('status', Report::STATUS_DISMISSED)->count(),
            ],
            'reasons' => Report::REASONS,
        ]);
    }

    public function updateReport(Request $request, Report $report)
    {
        $request->validate([
            'status' => 'required|in:pending,reviewed,dismissed',
        ]);

        $report->update(['status' => $request->status]);

        return back()->with('success', 'Status laporan diperbarui.');
    }

    public function destroyReport(Report $report)
    {
        $report->delete();

        return back()->with('success', 'Laporan dihapus.');
    }

    public function destroyReportedContent(Report $report)
    {
        $target = $report->reportable;

        if (!$target) {
            $report->delete();
            return back()->with('success', 'Konten sudah tidak ada. Laporan dihapus.');
        }

        $type = $target instanceof Video ? 'Video' : 'Kelas';
        $label = $target->title ?? '';

        Report::where('reportable_type', get_class($target))
            ->where('reportable_id', $target->id)
            ->delete();

        $target->delete();

        return back()->with('success', "{$type} \"{$label}\" yang dilaporkan telah dihapus.");
    }

    private function transformReport(Report $r): array
    {
        $target = $r->reportable;
        $kind = null;
        $preview = null;

        if ($target instanceof Video) {
            $kind = 'video';
            $preview = [
                'id'           => $target->id,
                'title'        => $target->title,
                'topic'        => $target->topic,
                'youtube_link' => $target->youtube_link,
                'owner'        => optional($target->user)->name ?? optional($target->user)->email,
                'url'          => "/videos/{$target->id}",
            ];
        } elseif ($target instanceof classes) {
            $kind = 'class';
            $preview = [
                'id'            => $target->id,
                'title'         => $target->title,
                'code'          => $target->code,
                'thumbnail_url' => $target->thumbnail_url,
                'owner'         => optional($target->creator)->name ?? optional($target->creator)->email,
                'url'           => "/classes/{$target->id}",
            ];
        }

        return [
            'id'          => $r->id,
            'reason'      => $r->reason,
            'reason_label' => Report::REASONS[$r->reason] ?? $r->reason,
            'description' => $r->description,
            'status'      => $r->status,
            'created_at'  => $r->created_at?->toIso8601String(),
            'reporter'    => [
                'name'  => optional($r->reporter)->name,
                'email' => optional($r->reporter)->email,
            ],
            'kind'    => $kind,
            'target'  => $preview,
        ];
    }
}
