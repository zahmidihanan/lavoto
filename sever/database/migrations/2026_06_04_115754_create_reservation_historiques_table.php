<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_historiques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
            $table->foreignId('employe_id')->nullable()->constrained('users');
            $table->string('ancien_statut', 50)->nullable();
            $table->string('nouveau_statut', 50);
            $table->string('localisation_employe', 255)->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamp('created_at')->useCurrent(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_historiques');
    }
};