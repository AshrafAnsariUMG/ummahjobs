<?php

namespace App\Services;

use App\Models\EmployerPackage;
use App\Models\Package;
use App\Models\StripeOrder;

class EmployerPackageService
{
    public function createFromStripe(
        string $stripeSessionId,
        int $employerId,
        int $packageId
    ): ?EmployerPackage {
        // Idempotency check
        $existing = StripeOrder::where('stripe_session_id', $stripeSessionId)->first();
        if ($existing) {
            return null;
        }

        $package = Package::findOrFail($packageId);

        StripeOrder::create([
            'employer_id'       => $employerId,
            'package_id'        => $packageId,
            'stripe_session_id' => $stripeSessionId,
            'amount'            => $package->price,
            'status'            => 'completed',
            'completed_at'      => now(),
        ]);

        $empPackage = EmployerPackage::create([
            'employer_id'      => $employerId,
            'package_id'       => $packageId,
            'stripe_order_id'  => $stripeSessionId,
            'credits_remaining' => $package->post_count,
            'duration_days'    => $package->duration_days,
            'granted_by_admin' => false,
            'expires_at'       => null,
        ]);

        return $empPackage;
    }

    public function debitCredit(int $employerId): EmployerPackage
    {
        $package = EmployerPackage::where('employer_id', $employerId)
            ->where('credits_remaining', '>', 0)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->orderBy('created_at', 'asc')
            ->first();

        if (!$package) {
            throw new \Exception('No active package credits available.');
        }

        $package->decrement('credits_remaining');

        return $package;
    }

    public function hasCredits(int $employerId): bool
    {
        return EmployerPackage::where('employer_id', $employerId)
            ->where('credits_remaining', '>', 0)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    public function creditBalance(int $employerId): array
    {
        return [
            'total_credits' => EmployerPackage::where('employer_id', $employerId)
                ->where('credits_remaining', '>', 0)
                ->sum('credits_remaining'),
            'packages'      => EmployerPackage::where('employer_id', $employerId)
                ->with('package')
                ->orderBy('created_at', 'asc')
                ->get(),
        ];
    }
}
