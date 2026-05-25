<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'email',
        'password',
        'role',
        'legacy_password',
        'display_name',
        'ummahpass_id',
        'is_active',
        'email_verified_at',
        'deletion_requested_at',
        'deletion_warned_at',
        'deletion_reason',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'      => 'datetime',
            'password'               => 'hashed',
            'legacy_password'        => 'boolean',
            'is_active'              => 'boolean',
            'deletion_requested_at'  => 'datetime',
            'deletion_warned_at'     => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::ulid();
            }
        });
    }

    public function candidate()
    {
        return $this->hasOne(Candidate::class);
    }

    public function employer()
    {
        return $this->hasOne(Employer::class);
    }
}
