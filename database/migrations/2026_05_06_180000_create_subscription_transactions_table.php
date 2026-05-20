<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference_code', 32)->unique();
            $table->string('event', 20);
            $table->string('plan', 20)->nullable();
            $table->unsignedInteger('amount')->default(0);
            $table->string('status', 20)->default('pending');
            $table->string('payment_method', 32)->default('mock_payment');
            $table->timestamp('completed_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_transactions');
    }
};
