<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    protected $fillable = ['list_id', 'member_id', 'title', 'description', 'due_date', 'position'];

    protected $casts = ['due_date' => 'date'];

    public function list()
    {
        return $this->belongsTo(TaskList::class, 'list_id');
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }
}
