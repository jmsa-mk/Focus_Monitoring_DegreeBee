<?php

namespace App\Http\Controllers;

use App\Models\enrollments;
use App\Http\Requests\StoreenrollmentsRequest;
use App\Http\Requests\UpdateenrollmentsRequest;
use App\Models\classes;
use Illuminate\Support\Facades\Auth;

class EnrollmentsController extends Controller
{
    public function unenroll(classes $class)
    {
        $user = Auth::user();

        if ($class->creator_id === $user->id) {
            return back()->with('error', 'Creator cannot unenroll their own class.');
        }

        $class->students()->detach($user->id);

        return redirect()->route('classes.index')
            ->with('success', 'Successfully unenrolled.');
    }
}
