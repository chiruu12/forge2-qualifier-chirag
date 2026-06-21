<?php

namespace Database\Seeders;

use App\Models\Board;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $board = Board::create(['name' => 'Forge 2 Demo Board']);

        $alice = $board->members()->create(['name' => 'Alice']);
        $bob = $board->members()->create(['name' => 'Bob']);

        $todo = $board->lists()->create(['name' => 'To-Do', 'position' => 0]);
        $doing = $board->lists()->create(['name' => 'Doing', 'position' => 1]);
        $done = $board->lists()->create(['name' => 'Done', 'position' => 2]);

        $c1 = $todo->cards()->create([
            'title' => 'Design the board UI',
            'description' => 'Columns, cards, move between lists.',
            'member_id' => $alice->id,
            'due_date' => now()->addDays(3)->toDateString(),
            'position' => 0,
        ]);
        $c1->tags()->create(['name' => 'design', 'color' => '#8b5cf6']);

        $c2 = $todo->cards()->create([
            'title' => 'Write the REST API',
            'description' => 'Laravel + SQLite.',
            'member_id' => $bob->id,
            'due_date' => now()->subDays(1)->toDateString(), // overdue on purpose
            'position' => 1,
        ]);
        $c2->tags()->create(['name' => 'backend', 'color' => '#10b981']);
        $c2->tags()->create(['name' => 'urgent', 'color' => '#ef4444']);

        $c3 = $doing->cards()->create([
            'title' => 'Wire frontend to the API',
            'member_id' => $alice->id,
            'position' => 0,
        ]);
        $c3->tags()->create(['name' => 'frontend', 'color' => '#3b82f6']);

        $done->cards()->create([
            'title' => 'Set up the GitHub repo',
            'description' => 'Public repo + docs.',
            'position' => 0,
        ]);
    }
}
