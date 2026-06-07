<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('type_vehicule_id')->constrained('types_vehicules');
            $table->string('marque', 100);
            $table->string('modele', 100);
            $table->integer('annee')->nullable();
            $table->string('immatriculation', 20)->unique();
            $table->string('couleur', 50)->nullable();
            $table->integer('kilometrage')->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicules');
    }
};