<?php

namespace App\Http\Controllers;

use App\Models\classes;
use App\Models\enrollments;
use App\Models\QuestionBankFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class QuestionBankController extends Controller
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
            'file' => 'required|file|max:20480|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,webp,gif,zip,txt,csv',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $file = $request->file('file');
        $filePath = $file->store('question-bank', 'public');

        QuestionBankFile::create([
            'user_id' => Auth::id(),
            'class_id' => $class->id,
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
        ]);

        return back();
    }

    public function update(Request $request, QuestionBankFile $file)
    {
        if ($file->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $file->update([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return back();
    }

    public function destroy(QuestionBankFile $file)
    {
        if ($file->user_id !== Auth::id()) {
            abort(403);
        }

        $path = $file->getRawOriginal('file_path');
        if ($path) {
            Storage::disk('public')->delete($path);
        }

        $file->delete();

        return back();
    }
}
