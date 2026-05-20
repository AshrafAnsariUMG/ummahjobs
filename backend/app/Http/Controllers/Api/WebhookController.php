<?php

namespace App\Http\Controllers\Api;

use App\Jobs\SendPackageConfirmation;
use App\Models\CouponUse;
use App\Models\Employer;
use App\Models\Package;
use App\Services\EmployerPackageService;
use App\Services\MattermostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController
{
    public function handleStripe(Request $request): JsonResponse
    {
        $payload       = $request->getContent();
        $sigHeader     = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            if ($webhookSecret === 'whsec_placeholder' || empty($webhookSecret)) {
                // Dev/test mode — skip signature verification
                $event = json_decode($payload);
            } else {
                $event = \Stripe\Webhook::constructEvent(
                    $payload,
                    $sigHeader,
                    $webhookSecret
                );
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session  = $event->data->object;
            $metadata = $session->metadata;

            $empPackageService = new EmployerPackageService();
            $empPackage = $empPackageService->createFromStripe(
                $session->id,
                (int) $metadata->employer_id,
                (int) $metadata->package_id
            );

            // Record coupon use if one was applied
            if (!empty($metadata->coupon_id)) {
                CouponUse::create([
                    'coupon_id'        => (int) $metadata->coupon_id,
                    'employer_id'      => (int) $metadata->employer_id,
                    'package_id'       => (int) $metadata->package_id,
                    'original_price'   => (float) $metadata->original_price,
                    'discount_amount'  => (float) $metadata->discount_amount,
                    'final_price'      => $session->amount_total / 100,
                    'stripe_session_id'=> $session->id,
                ]);
            }

            dispatch(new SendPackageConfirmation(
                (string) $metadata->user_id,
                (int) $metadata->package_id,
                $session->id
            ));

            // Mattermost notification — only fires on first webhook (createFromStripe returns null on retries)
            if ($empPackage !== null) {
                $this->notifyMattermostPackagePurchase(
                    (int) $metadata->employer_id,
                    (int) $metadata->package_id,
                    $session
                );
            }
        }

        return response()->json(['status' => 'ok']);
    }

    private function notifyMattermostPackagePurchase(int $employerId, int $packageId, $session): void
    {
        try {
            $employer = Employer::find($employerId);
            $package  = Package::find($packageId);
            if (!$employer || !$package) return;

            $employerName = $employer->company_name ?? 'Unknown Employer';
            $amountPaid   = number_format($session->amount_total / 100, 2);
            $currency     = strtoupper($session->currency ?? 'usd');

            $couponLine = '';
            if (!empty($session->metadata->coupon_id)) {
                $original = number_format((float) $session->metadata->original_price, 2);
                $discount = number_format((float) $session->metadata->discount_amount, 2);
                $couponLine = "**Coupon applied:** -{$discount} {$currency} (was {$original} {$currency})\n";
            }

            $message = "### :credit_card: New Package Purchase on UmmahJobs\n"
                . "**Employer:** {$employerName}\n"
                . "**Package:** {$package->name}\n"
                . "**Job posts:** {$package->post_count}\n"
                . "**Duration:** {$package->duration_days} days\n"
                . "**Amount paid:** {$amountPaid} {$currency}\n"
                . $couponLine
                . "Stripe payment confirmed :white_check_mark:";

            (new MattermostService())->post($message);
        } catch (\Throwable $e) {
            // Fire and forget — never affect webhook ack
        }
    }
}
