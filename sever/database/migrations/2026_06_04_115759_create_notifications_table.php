<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['reservation', 'paiement', 'rappel', 'systeme']);
            $table->string('titre', 255);
            $table->text('message');
            $table->enum('canal', ['app', 'email', 'sms'])->default('app');
            $table->boolean('lu')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};