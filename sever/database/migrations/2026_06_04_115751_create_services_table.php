<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->enum('categorie', ['lavage', 'nettoyage', 'polissage', 'entretien']);
            $table->text('description')->nullable();
            $table->time('duree_estimee');
            $table->decimal('prix_base', 10, 2);
            $table->enum('statut', ['disponible', 'indisponible'])->default('disponible');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};