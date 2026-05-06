<?php

namespace App\Http\Controllers\Api;

use App\Jobs\SendPackageConfirmation;
use App\Models\CouponUse;
use App\Services\EmployerPackageService;
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
            $empPackageService->createFromStripe(
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
        }

        return response()->json(['status' => 'ok']);
    }
}
