<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ClassesController;
use App\Http\Controllers\ClassVideoController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\EnrollmentsController;
use App\Http\Controllers\ForumPostController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\QuestionBankController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\FocusLogController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/register', [AuthController::class, 'showRegister']);
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/premium', [SubscriptionController::class, 'index'])->name('premium');


Route::middleware('auth')->group(function () {

    Route::get('/explore', [VideoController::class, 'explore'])->name('explore');

    Route::get('/uploadVideo', function () {
        return Inertia::render('UploadVideo', [
            'user' => Auth::user(),
        ]);
    })->name('uploadVideo');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::get('/editProfile', [ProfileController::class, 'edit'])->name('editProfile');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profileUpdate');

    Route::get('/profile/change-password', [ProfileController::class, 'showChangePassword'])
        ->name('changePassword');
    Route::post('/profile/change-password', [ProfileController::class, 'updatePassword'])
        ->name('changePassword.update');

    Route::post('/videos/upload', [VideoController::class, 'store'])->name('videos.upload');
    Route::post('/videos/{id}/rate', [VideoController::class, 'rate']);
    Route::get('/videos/{id}', [VideoController::class, 'show']);

    Route::get('/edit-video/{id}', function ($id) {
        $video = \App\Models\Video::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('EditVideo', [
            'video' => $video,
        ]);
    });

    Route::get('/manageVideos', [VideoController::class, 'manage']);
    Route::put('/videos/{id}', [VideoController::class, 'update']);
    Route::delete('/videos/{id}', [VideoController::class, 'destroy']);

    Route::get('/bookmark', [BookmarkController::class, 'index']);
    Route::post('/bookmark/{video}', [BookmarkController::class, 'toggle']);

    Route::middleware('premium')->group(function () {
        Route::get('/classes', [ClassesController::class, 'index'])->name('classes.index');
        Route::get('/classes/create', [ClassesController::class, 'create'])->name('classes.create');
        Route::get('/join', [ClassesController::class, 'showJoin']);
        Route::post('/classes/store', [ClassesController::class, 'storeClass']);
        Route::post('/classes/join', [ClassesController::class, 'join']);
        Route::get('/classes/{class}', [ClassesController::class, 'show'])->name('classes.show');
        Route::get('/classes/{class}/edit', [ClassesController::class, 'edit'])->name('classes.edit');
        Route::post('/classes/{class}/edit', [ClassesController::class, 'update'])->name('classes.update');
        Route::delete('/classes/{class}', [ClassesController::class, 'destroy']);
        Route::delete('/classes/{class}/unenroll', [EnrollmentsController::class, 'unenroll'])
            ->name('classes.unenroll');
    });

    Route::post('/focus-session', [FocusLogController::class, 'store']);

    Route::post('/subscription/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscription.subscribe');
    Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel');
    Route::get('/subscription/transactions', [SubscriptionController::class, 'transactions'])->name('subscription.transactions');

    Route::post('/videos/{video}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::put('/comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('/comments/{comment}/like', [CommentController::class, 'toggleLike'])->name('comments.like');
});

Route::prefix('classes/{classId}')->middleware(['auth', 'premium'])->group(function () {
    Route::get('/resources', [ClassVideoController::class, 'index']);
    Route::post('/videos', [ClassVideoController::class, 'store']);
    Route::put('/videos/{id}', [ClassVideoController::class, 'update']);
    Route::delete('/videos/{id}', [ClassVideoController::class, 'destroy']);

    Route::post('/forum', [ForumPostController::class, 'store'])->name('forum.store');
    Route::post('/notes', [NoteController::class, 'store'])->name('notes.store');
    Route::post('/question-bank', [QuestionBankController::class, 'store'])->name('questionBank.store');
});

Route::middleware(['auth', 'premium'])->group(function () {
    Route::put('/forum/{post}', [ForumPostController::class, 'update'])->name('forum.update');
    Route::delete('/forum/{post}', [ForumPostController::class, 'destroy'])->name('forum.destroy');
    Route::post('/forum/{post}/insight', [ForumPostController::class, 'toggleInsight'])->name('forum.insight');

    Route::put('/notes/{note}', [NoteController::class, 'update'])->name('notes.update');
    Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');

    Route::put('/question-bank/{file}', [QuestionBankController::class, 'update'])->name('questionBank.update');
    Route::delete('/question-bank/{file}', [QuestionBankController::class, 'destroy'])->name('questionBank.destroy');
});
