<?php

use App\Models\Board;
use App\Models\Card;
use App\Models\Tag;
use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- Boards ---
Route::get('/boards', fn () => Board::with(['members', 'lists.cards.tags', 'lists.cards.member'])->get());

Route::post('/boards', function (Request $r) {
    return Board::create($r->validate(['name' => 'required|string']));
});

Route::get('/boards/{board}', fn (Board $board) => $board->load(['members', 'lists.cards.tags', 'lists.cards.member']));

Route::delete('/boards/{board}', function (Board $board) {
    $board->delete();
    return response()->noContent();
});

// --- Members ---
Route::post('/boards/{board}/members', function (Request $r, Board $board) {
    return $board->members()->create($r->validate(['name' => 'required|string']));
});

// --- Lists ---
Route::post('/boards/{board}/lists', function (Request $r, Board $board) {
    $data = $r->validate(['name' => 'required|string']);
    $data['position'] = $board->lists()->count();
    return $board->lists()->create($data);
});

Route::delete('/lists/{list}', function (TaskList $list) {
    $list->delete();
    return response()->noContent();
});

// --- Cards ---
Route::post('/lists/{list}/cards', function (Request $r, TaskList $list) {
    $data = $r->validate([
        'title' => 'required|string',
        'description' => 'nullable|string',
        'due_date' => 'nullable|date',
        'member_id' => 'nullable|exists:members,id',
    ]);
    $data['position'] = $list->cards()->count();
    return $list->cards()->create($data)->load(['tags', 'member']);
});

// Move (list_id) / edit any field
Route::patch('/cards/{card}', function (Request $r, Card $card) {
    $card->update($r->validate([
        'list_id' => 'sometimes|exists:lists,id',
        'title' => 'sometimes|string',
        'description' => 'nullable|string',
        'due_date' => 'nullable|date',
        'member_id' => 'nullable|exists:members,id',
        'position' => 'sometimes|integer',
    ]));
    return $card->load(['tags', 'member']);
});

Route::delete('/cards/{card}', function (Card $card) {
    $card->delete();
    return response()->noContent();
});

// --- Tags ---
Route::post('/cards/{card}/tags', function (Request $r, Card $card) {
    return $card->tags()->create($r->validate([
        'name' => 'required|string',
        'color' => 'nullable|string',
    ]));
});

Route::delete('/tags/{tag}', function (Tag $tag) {
    $tag->delete();
    return response()->noContent();
});
