<?php

namespace App\Http\Controllers;

use App\Models\FocusLog;
use App\Http\Requests\StoreFocusLogRequest;
use App\Http\Requests\UpdateFocusLogRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FocusLogController extends Controller
{
    public function store(Request $request)
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return response()->json(['error' => 'Invalid data'], 400);
        }

        validator($data, [
            'video_id' => 'required|exists:videos,id',
            'total_time' => 'required|integer|min:1',
            'focus_time' => 'required|integer|min:0',
            'unfocus_time' => 'required|integer|min:0',
            'cv_distract_time' => 'nullable|integer|min:0',
        ])->validate();

        $focusScore = 0;

        if ($data['total_time'] > 0) {
            $focusScore = round(
                ($data['focus_time'] / $data['total_time']) * 100,
                2
            );
        }

        $cvDistract = min(
            (int) ($data['cv_distract_time'] ?? 0),
            (int) $data['unfocus_time']
        );

        FocusLog::create([
            'user_id' => Auth::id(),
            'video_id' => $data['video_id'],
            'total_time' => $data['total_time'],
            'focus_time' => $data['focus_time'],
            'unfocus_time' => $data['unfocus_time'],
            'cv_distract_time' => $cvDistract,
            'focus_score' => $focusScore,
        ]);

        return response()->json([
            'message' => 'Focus session saved',
            'focus_score' => $focusScore,
            'cv_distract_time' => $cvDistract,
        ]);
    }
}
