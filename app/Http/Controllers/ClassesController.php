<?php

namespace App\Http\Controllers;

use App\Models\classes;
use App\Models\enrollments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ClassesController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $classes = classes::with('creator')
            ->where(function ($query) use ($userId) {
                $query->where('visibility', 'public')
                    ->orWhere('creator_id', $userId)
                    ->orWhereIn('id', function ($sub) use ($userId) {
                        $sub->select('class_id')
                            ->from('enrollments')
                            ->where('user_id', $userId);
                    });
            })
            ->latest()
            ->get();

        return Inertia::render('ExploreClasses', [
            'classes' => $classes,
        ]);
    }

    public function create()
    {
        return Inertia::render('CreateClass');
    }

    public function showJoin()
    {
        return Inertia::render('JoinClass');
    }

    public function storeClass(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'visibility' => 'required|in:public,private',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        do {
            $code = strtoupper(Str::random(6));
        } while (classes::where('code', $code)->exists());

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('class-thumbnails', 'public');
        }

        $class = classes::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'visibility' => $validated['visibility'],
            'thumbnail' => $thumbnailPath,
            'creator_id' => Auth::id(),
            'code' => $code,
        ]);

        return redirect('/classes/' . $class->id)
            ->with('success', 'Class created successfully!');
    }

    public function show($id)
    {
        $class = classes::with([
            'creator',
            'videos' => function ($query) {
                $query->with('user')
                    ->withAvg('ratings as avg_rating', 'rating')
                    ->withCount('ratings')
                    ->latest();
            },
        ])->findOrFail($id);

        $userId = Auth::id();
        $isCreator = $class->creator_id === $userId;
        $isEnrolled = enrollments::where('class_id', $id)
            ->where('user_id', $userId)
            ->exists();

        if ($class->visibility === 'private' && !$isCreator && !$isEnrolled) {
            abort(403, 'This class is private.');
        }

        $notes = [];
        if ($isCreator || $isEnrolled) {
            $notes = \App\Models\Note::where('class_id', $class->id)
                ->with('user')
                ->latest()
                ->get();
        }
        
        $questionBankFiles = [];
        if ($isCreator || $isEnrolled) {
            $questionBankFiles = \App\Models\QuestionBankFile::where('class_id', $class->id)
                ->with('user')
                ->latest()
                ->get();
        }

        $forumPosts = [];
        if ($isCreator || $isEnrolled) {
            $replyLoader = function ($q) use ($userId) {
                $q->with('user')
                    ->withCount('insights')
                    ->withExists(['insights as has_insight' => fn ($iq) => $iq->where('user_id', $userId)])
                    ->oldest();
            };

            $forumPosts = \App\Models\ForumPost::where('class_id', $class->id)
                ->whereNull('parent_id')
                ->with('user')
                ->with(['replies' => $replyLoader])
                ->withCount('insights')
                ->withExists(['insights as has_insight' => fn ($q) => $q->where('user_id', $userId)])
                ->latest()
                ->get();
        }

        return Inertia::render('ClassDetail', [
            'class' => $class,
            'isCreator' => $isCreator,
            'isEnrolled' => $isEnrolled,
            'forumPosts' => $forumPosts,
            'notes' => $notes,
            'questionBankFiles' => $questionBankFiles,
        ]);
    }

    public function join(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $class = classes::where('code', strtoupper($request->code))->first();

        if (!$class) {
            return back()->with('error', 'Invalid class code.');
        }

        if ($class->creator_id === Auth::id()) {
            return redirect('/classes/' . $class->id);
        }

        enrollments::firstOrCreate([
            'user_id' => Auth::id(),
            'class_id' => $class->id,
        ]);

        return redirect('/classes/' . $class->id)
            ->with('success', 'Successfully joined class!');
    }

    public function edit($id)
    {
        $class = classes::findOrFail($id);

        if ($class->creator_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('EditClass', [
            'class' => $class,
        ]);
    }

    public function update(Request $request, $id)
    {
        $class = classes::findOrFail($id);

        if ($class->creator_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'visibility' => 'required|in:public,private',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'remove_thumbnail' => 'nullable|boolean',
        ]);

        $payload = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'visibility' => $validated['visibility'],
        ];

        $currentThumbnail = $class->getRawOriginal('thumbnail');

        if ($request->hasFile('thumbnail')) {
            if ($currentThumbnail && !str_starts_with($currentThumbnail, 'http')) {
                Storage::disk('public')->delete($currentThumbnail);
            }
            $payload['thumbnail'] = $request->file('thumbnail')->store('class-thumbnails', 'public');
        } elseif ($request->boolean('remove_thumbnail')) {
            if ($currentThumbnail && !str_starts_with($currentThumbnail, 'http')) {
                Storage::disk('public')->delete($currentThumbnail);
            }
            $payload['thumbnail'] = null;
        }

        $class->update($payload);

        return redirect('/classes/' . $class->id)
            ->with('success', 'Class updated successfully!');
    }

    public function destroy($id)
    {
        $class = classes::findOrFail($id);

        if ($class->creator_id !== Auth::id()) {
            abort(403);
        }

        $thumbnail = $class->getRawOriginal('thumbnail');
        if ($thumbnail && !str_starts_with($thumbnail, 'http')) {
            Storage::disk('public')->delete($thumbnail);
        }

        $class->delete();

        return redirect('/classes')->with('success', 'Class deleted successfully.');
    }
}
