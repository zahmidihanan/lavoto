<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('employe_id')->nullable()->constrained('users');
            $table->foreignId('service_id')->constrained('services');
            $table->foreignId('vehicule_id')->constrained('vehicules');
            $table->dateTime('date_debut');
            $table->dateTime('date_fin')->nullable();
            $table->string('adresse', 255);
            $table->string('ville', 100);
            $table->string('gps', 100)->nullable();
            $table->decimal('prix_estime', 10, 2)->nullable();
            $table->enum('statut', ['en_attente', 'confirme', 'en_route', 'en_cours', 'termine', 'annule'])->default('en_attente');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexations demandées dans votre script SQL
            $table->index('date_debut');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};