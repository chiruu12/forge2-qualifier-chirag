<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    protected $fillable = ['name'];

    public function lists()
    {
        return $this->hasMany(TaskList::class)->orderBy('position');
    }

    public function members()
    {
        return $this->hasMany(Member::class);
    }
}
