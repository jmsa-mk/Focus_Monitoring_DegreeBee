<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    public function index()
    {
        $videos = auth()
            ->user()
            ->bookmarkedVideos()
            ->with('user')
            ->withAvg('ratings as avg_rating', 'rating')
            ->withCount('ratings')
            ->withExists([
                'bookmarks as is_bookmarked' => function ($q) {
                    $q->where('user_id', auth()->id());
                }
            ])
            ->latest('bookmarks.created_at')
            ->paginate(6);

        return inertia('Bookmark', [
            'videos' => $videos
        ]);
    }
   public function toggle($videoId)
    {
        $userId = Auth::id();

        $bookmark = Bookmark::where('user_id', $userId)
            ->where('video_id', $videoId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();

            return back()->with(
                'success',
                'Removed from bookmarks'
            );
        }

        Bookmark::create([
            'user_id' => $userId,
            'video_id' => $videoId,
        ]);

        return back()->with(
            'success',
            'Saved to bookmarks'
        );
    }
}
