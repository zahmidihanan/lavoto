<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('quality_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->boolean('passed')->default(false);
            $table->unsignedTinyInteger('rating')->nullable()->comment('1-5');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quality_checks');
    }
};
