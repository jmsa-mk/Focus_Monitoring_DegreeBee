<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Video;
use App\Support\YoutubeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VideoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'youtube_link' => 'required|url',
            'topic' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        Video::create([
            'user_id' => Auth::id(),
            'title' => YoutubeHelper::fetchTitle($request->youtube_link),
            'youtube_link' => $request->youtube_link,
            'topic' => $request->topic,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Video uploaded successfully!');
    }

    public function show($id)
    {
        $video = Video::with('user')
            ->withAvg('ratings as avg_rating', 'rating')
            ->withCount('ratings')
            ->withExists([
                'bookmarks as is_bookmarked' => function ($q) {
                    $q->where('user_id', Auth::id());
                },
            ])
            ->findOrFail($id);

        $userId = Auth::id();

        $userRating = Rating::where('video_id', $id)
            ->where('user_id', $userId)
            ->value('rating');

        // Cumulative stats for End Session summary preview (achievement diff)
        $userStats = [
            'total_focus_seconds' => (int) \App\Models\FocusLog::where('user_id', $userId)->sum('focus_time'),
            'session_count' => \App\Models\FocusLog::where('user_id', $userId)->count(),
            'avg_focus_score' => round(\App\Models\FocusLog::where('user_id', $userId)->avg('focus_score') ?? 0, 2),
            'videos_uploaded' => Video::where('user_id', $userId)->count(),
            'classes_created' => \App\Models\classes::where('creator_id', $userId)->count(),
        ];

        return Inertia::render('VideoDetail', [
            'video' => $video,
            'userRating' => $userRating,
            'userStats' => $userStats,
        ]);
    }

    public function explore(Request $request)
    {
        $seed = $request->session()->get('random_seed');
        if (!$seed) {
            $seed = rand();
            $request->session()->put('random_seed', $seed);
        }

        $search = $request->search;

        $query = Video::whereNull('class_id')
            ->with('user')
            ->withAvg('ratings as avg_rating', 'rating')
            ->withCount('ratings')
            ->withExists([
                'bookmarks as is_bookmarked' => function ($q) {
                    $q->where('user_id', Auth::id());
                },
            ]);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('topic', 'like', "%{$search}%");
            });
            $videos = $query->latest()
                ->paginate(6)
                ->withQueryString();
        } else {
            $videos = $query
                ->orderByRaw('RAND(?)', [$seed])
                ->paginate(6)
                ->withQueryString();
        }

        return Inertia::render('ExploreVideos', [
            'videos' => $videos,
            'user' => $request->user(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function rate(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        Rating::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'video_id' => $id,
            ],
            [
                'rating' => $request->rating,
            ]
        );

        return back();
    }

    public function manage(Request $request)
    {
        $videos = Video::where('user_id', Auth::id())
            ->withAvg('ratings as avg_rating', 'rating')
            ->withCount('ratings')
            ->withExists([
                'bookmarks as is_bookmarked' => function ($q) {
                    $q->where('user_id', Auth::id());
                },
            ])
            ->latest()
            ->paginate(6);

        return Inertia::render('ManageVideo', [
            'videos' => $videos,
        ]);
    }

    public function update(Request $request, $id)
    {
        $video = Video::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $request->validate([
            'youtube_link' => 'required|url',
            'topic' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $video->update([
            'title' => YoutubeHelper::fetchTitle($request->youtube_link, $video->title),
            'youtube_link' => $request->youtube_link,
            'topic' => $request->topic,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Video updated successfully!');
    }

    public function destroy($id)
    {
        $video = Video::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $video->delete();

        return redirect()->back()->with('success', 'Video deleted successfully!');
    }

    public function saved()
    {
        $videos = Auth::user()
            ->bookmarkedVideos()
            ->with('user')
            ->paginate(9);

        return inertia('SavedVideos', compact('videos'));
    }
}
