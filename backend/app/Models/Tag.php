<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['card_id', 'name', 'color'];

    public function card()
    {
        return $this->belongsTo(Card::class);
    }
}
