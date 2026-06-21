<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = ['board_id', 'name'];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }
}
