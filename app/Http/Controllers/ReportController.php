<?php

namespace App\Http\Controllers;

use App\Models\classes;
use App\Models\Report;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'        => 'required|in:video,class',
            'id'          => 'required|integer',
            'reason'      => 'required|in:' . implode(',', array_keys(Report::REASONS)),
            'description' => 'nullable|string|max:1000',
        ]);

        $target = $validated['type'] === 'video'
            ? Video::find($validated['id'])
            : classes::find($validated['id']);

        if (!$target) {
            return back()->withErrors(['report' => 'Konten yang dilaporkan tidak ditemukan.']);
        }

        $userId = Auth::id();

        $alreadyReported = Report::where('user_id', $userId)
            ->where('reportable_type', get_class($target))
            ->where('reportable_id', $target->id)
            ->where('status', Report::STATUS_PENDING)
            ->exists();

        if ($alreadyReported) {
            return back()->with('success', 'Kamu sudah melaporkan konten ini. Tim admin sedang meninjau.');
        }

        Report::create([
            'user_id'         => $userId,
            'reportable_type' => get_class($target),
            'reportable_id'   => $target->id,
            'reason'          => $validated['reason'],
            'description'     => $validated['description'] ?? null,
            'status'          => Report::STATUS_PENDING,
        ]);

        return back()->with('success', 'Laporan terkirim. Terima kasih, tim admin akan meninjaunya.');
    }
}
