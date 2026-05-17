<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('focus_logs', function (Blueprint $table) {
            $table->unsignedInteger('cv_distract_time')->default(0)->after('unfocus_time');
        });
    }

    public function down(): void
    {
        Schema::table('focus_logs', function (Blueprint $table) {
            $table->dropColumn('cv_distract_time');
        });
    }
};
