<?php

use App\Http\Controllers\AuthController;
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

Route::get('/premium', function () {
    return Inertia::render('Subscription');
});

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
    Route::get('/videos/{id}', [VideoController::class, 'show']);



});

