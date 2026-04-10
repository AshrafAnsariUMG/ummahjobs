<?php

namespace App\Http\Controllers\Api;

use App\Jobs\SendPackageConfirmation;
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
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );
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

            dispatch(new SendPackageConfirmation(
                (int) $metadata->user_id,
                (int) $metadata->package_id
            ));
        }

        return response()->json(['status' => 'ok']);
    }
}
