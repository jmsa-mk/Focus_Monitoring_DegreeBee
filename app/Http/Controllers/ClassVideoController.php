<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Support\YoutubeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClassVideoController extends Controller
{
    private function authorizeClassAccess($classId)
    {
        $class = \App\Models\classes::findOrFail($classId);

        $userId = Auth::id();
        $isCreator = $class->creator_id === $userId;
        $isEnrolled = \App\Models\enrollments::where('class_id', $classId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isCreator && !$isEnrolled) {
            abort(403, 'You are not allowed to access this class.');
        }

        return $class;
    }

    public function index(Request $request, $classId)
    {
        $this->authorizeClassAccess($classId);

        $search = $request->search;

        $query = Video::where('class_id', $classId)
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
        }

        $videos = $query->latest()
            ->paginate(6)
            ->withQueryString();

        return Inertia::render('Class/LearningResources', [
            'videos' => $videos,
            'classId' => $classId,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request, $classId)
    {
        $this->authorizeClassAccess($classId);

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
            'class_id' => $classId,
        ]);

        return back()->with('success', 'Video added to class!');
    }

    public function update(Request $request, $classId, $id)
    {
        $this->authorizeClassAccess($classId);

        $video = Video::where('id', $id)
            ->where('class_id', $classId)
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

        return back()->with('success', 'Video updated successfully!');
    }

    public function destroy($classId, $id)
    {
        $this->authorizeClassAccess($classId);

        $video = Video::where('id', $id)
            ->where('class_id', $classId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $video->delete();

        return back()->with('success', 'Video deleted successfully!');
    }
}
