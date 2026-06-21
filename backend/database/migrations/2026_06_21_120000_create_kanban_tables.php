<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('boards', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->timestamps();
        });

        Schema::create('members', function (Blueprint $t) {
            $t->id();
            $t->foreignId('board_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->timestamps();
        });

        Schema::create('lists', function (Blueprint $t) {
            $t->id();
            $t->foreignId('board_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->integer('position')->default(0);
            $t->timestamps();
        });

        Schema::create('cards', function (Blueprint $t) {
            $t->id();
            $t->foreignId('list_id')->constrained('lists')->cascadeOnDelete();
            $t->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $t->string('title');
            $t->text('description')->nullable();
            $t->date('due_date')->nullable();
            $t->integer('position')->default(0);
            $t->timestamps();
        });

        Schema::create('tags', function (Blueprint $t) {
            $t->id();
            $t->foreignId('card_id')->constrained('cards')->cascadeOnDelete();
            $t->string('name');
            $t->string('color')->default('#6b7280');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
        Schema::dropIfExists('cards');
        Schema::dropIfExists('lists');
        Schema::dropIfExists('members');
        Schema::dropIfExists('boards');
    }
};
