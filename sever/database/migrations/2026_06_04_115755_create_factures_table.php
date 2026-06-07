<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->unique()->constrained('reservations');
            $table->foreignId('client_id')->constrained('users');
            $table->string('numero_facture', 50)->unique();
            $table->decimal('montant_ht', 10, 2);
            $table->decimal('taux_tva', 5, 2)->default(20.00);
            $table->decimal('montant_ttc', 10, 2);
            $table->decimal('frais_deplacement', 10, 2)->default(0.00);
            $table->date('date_facture');
            $table->date('date_echeance')->nullable();
            $table->enum('statut_paiement', ['en_attente', 'partiel', 'paye', 'retard', 'annule'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};