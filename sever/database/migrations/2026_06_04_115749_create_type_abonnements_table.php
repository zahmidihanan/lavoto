<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('types_abonnements', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 50);
            $table->decimal('prix', 10, 2);
            $table->integer('duree_mois');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('types_abonnements');
    }
};