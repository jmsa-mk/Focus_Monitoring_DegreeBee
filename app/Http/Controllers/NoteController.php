<?php

namespace App\Http\Controllers;

use App\Models\classes;
use App\Models\enrollments;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    private const COLORS = ['yellow', 'blue', 'purple', 'pink', 'green', 'orange'];

    private function authorizeClassAccess($classId): classes
    {
        $class = classes::findOrFail($classId);
        $userId = Auth::id();

        $isCreator = $class->creator_id === $userId;
        $isEnrolled = enrollments::where('class_id', $classId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isCreator && !$isEnrolled) {
            abort(403, 'You are not a member of this class.');
        }

        return $class;
    }

    public function store(Request $request, $classId)
    {
        $class = $this->authorizeClassAccess($classId);

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
            'color' => 'nullable|in:' . implode(',', self::COLORS),
        ]);

        Note::create([
            'user_id' => Auth::id(),
            'class_id' => $class->id,
            'body' => $validated['body'],
            'color' => $validated['color'] ?? 'yellow',
        ]);

        return back();
    }

    public function update(Request $request, Note $note)
    {
        if ($note->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
            'color' => 'nullable|in:' . implode(',', self::COLORS),
        ]);

        $note->update([
            'body' => $validated['body'],
            'color' => $validated['color'] ?? $note->color,
        ]);

        return back();
    }

    public function destroy(Note $note)
    {
        if ($note->user_id !== Auth::id()) {
            abort(403);
        }

        $note->delete();

        return back();
    }
}
