<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')->constrained('factures');
            $table->foreignId('client_id')->constrained('users');
            $table->decimal('montant', 10, 2);
            $table->enum('mode_paiement', ['espece', 'carte', 'cheque', 'virement', 'en_ligne']);
            $table->timestamp('date_paiement')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};