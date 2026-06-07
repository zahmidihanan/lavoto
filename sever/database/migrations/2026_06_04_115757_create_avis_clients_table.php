<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avis_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations');
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('employe_id')->constrained('users');
            $table->tinyInteger('note')->unsigned(); // Utilisation d'une validation dans le FormRequest Laravel ultérieurement pour le BETWEEN 1 AND 5
            $table->text('commentaire')->nullable();
            $table->boolean('recommande')->default(true);
            $table->enum('statut', ['en_attente', 'approuve', 'rejete'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis_clients');
    }
};