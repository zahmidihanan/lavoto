<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email', 255)->unique();
            $table->string('password', 255);
            $table->string('telephone', 20)->nullable();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->enum('statut', ['actif', 'inactif', 'conges'])->default('actif');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    

        // 3. Table Password Reset Tokens
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // 4. Table Sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    } // Fin de la méthode up()

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // On supprime d'abord les tables qui dépendent des autres (clés étrangères)
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        
    }
};