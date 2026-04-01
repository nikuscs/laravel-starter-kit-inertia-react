<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aircraft', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('model');
            $table->string('manufacturer');
            $table->string('location')->nullable();
            $table->string('status');
            $table->text('notes')->nullable();
            $table->timestamp('purchased_at')->nullable();
            $table->timestamp('last_flight_at')->nullable();
            $table->timestamp('last_maintenance_at')->nullable();
            $table->timestamps();
        });
    }
};
