<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, $videoId)
    {
        $request->validate([
            'body' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $video = Video::findOrFail($videoId);

        // Ensure parent (if any) belongs to same video & is itself a top-level comment
        // (we only allow 1 nesting level — replies to replies still attach to the top thread)
        $parentId = null;
        if ($request->parent_id) {
            $parent = Comment::find($request->parent_id);
            if ($parent && $parent->video_id === $video->id) {
                $parentId = $parent->parent_id ?? $parent->id;
            }
        }

        Comment::create([
            'user_id' => Auth::id(),
            'video_id' => $video->id,
            'parent_id' => $parentId,
            'body' => $request->body,
        ]);

        return back();
    }

    public function update(Request $request, Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $comment->update(['body' => $request->body]);

        return back();
    }

    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            abort(403);
        }

        $comment->delete();

        return back();
    }

    public function toggleLike(Comment $comment)
    {
        $userId = Auth::id();

        $existing = CommentLike::where('user_id', $userId)
            ->where('comment_id', $comment->id)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            CommentLike::create([
                'user_id' => $userId,
                'comment_id' => $comment->id,
            ]);
        }

        return back();
    }
}
