<?php

namespace App\Http\Controllers;

use App\Models\classes;
use App\Models\enrollments;
use App\Models\ForumPost;
use App\Models\ForumPostInsight;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ForumPostController extends Controller
{
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

        $rawFile = $_FILES['file'] ?? null;
        if ($rawFile && isset($rawFile['error']) && $rawFile['error'] !== UPLOAD_ERR_OK && $rawFile['error'] !== UPLOAD_ERR_NO_FILE) {
            $errorMap = [
                UPLOAD_ERR_INI_SIZE => 'File terlalu besar (melebihi upload_max_filesize PHP).',
                UPLOAD_ERR_FORM_SIZE => 'File terlalu besar (melebihi MAX_FILE_SIZE form).',
                UPLOAD_ERR_PARTIAL => 'Upload tidak lengkap, coba lagi.',
                UPLOAD_ERR_NO_TMP_DIR => 'Server tidak punya temp directory.',
                UPLOAD_ERR_CANT_WRITE => 'Server tidak bisa menulis file.',
                UPLOAD_ERR_EXTENSION => 'PHP extension memblokir upload.',
            ];
            return back()->withErrors([
                'file' => $errorMap[$rawFile['error']] ?? 'Upload gagal (kode ' . $rawFile['error'] . ').',
            ])->withInput();
        }

        $request->validate([
            'body' => 'required|string|max:5000',
            'parent_id' => 'nullable|exists:forum_posts,id',
            'file' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,webp,zip,txt,csv',
        ]);

        $parentId = null;
        if ($request->parent_id) {
            $parent = ForumPost::find($request->parent_id);
            if ($parent && $parent->class_id === $class->id) {
                $parentId = $parent->parent_id ?? $parent->id;
            }
        }

        $filePath = null;
        $fileName = null;
        $fileSize = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('forum-files', 'public');
            $fileName = $file->getClientOriginalName();
            $fileSize = $file->getSize();
        }

        ForumPost::create([
            'user_id' => Auth::id(),
            'class_id' => $class->id,
            'parent_id' => $parentId,
            'body' => $request->body,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
        ]);

        return back();
    }

    public function update(Request $request, ForumPost $post)
    {
        if ($post->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $post->update(['body' => $request->body]);

        return back();
    }

    public function destroy(ForumPost $post)
    {
        if ($post->user_id !== Auth::id()) {
            abort(403);
        }

        $this->deleteFileTree($post);

        $post->delete();

        return back();
    }

    private function deleteFileTree(ForumPost $post): void
    {
        $path = $post->getRawOriginal('file_path');
        if ($path) {
            Storage::disk('public')->delete($path);
        }
        foreach ($post->replies as $reply) {
            $this->deleteFileTree($reply);
        }
    }

    public function toggleInsight(ForumPost $post)
    {
        $userId = Auth::id();

        $existing = ForumPostInsight::where('user_id', $userId)
            ->where('forum_post_id', $post->id)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            ForumPostInsight::create([
                'user_id' => $userId,
                'forum_post_id' => $post->id,
            ]);
        }

        return back();
    }
}
