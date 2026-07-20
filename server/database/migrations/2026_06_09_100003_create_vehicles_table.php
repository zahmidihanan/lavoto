<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('brand', 100);
            $table->string('model', 100);
            $table->smallInteger('year')->nullable();
            $table->string('color', 50)->nullable();
            $table->string('plate_number', 30);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['plate_number', 'company_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
