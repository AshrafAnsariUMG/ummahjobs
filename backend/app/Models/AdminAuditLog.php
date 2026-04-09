<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminAuditLog extends Model
{
    protected $table = 'admin_audit_log';

    protected $fillable = [
        'admin_id', 'target_user_id', 'action', 'notes',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
