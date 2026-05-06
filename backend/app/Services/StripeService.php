<?php

namespace App\Services;

use App\Models\Employer;
use App\Models\Package;
use App\Models\User;

class StripeService
{
    public function __construct()
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createCheckoutSession(
        Employer $employer,
        Package $package,
        User $user,
        ?array $couponData = null
    ): \Stripe\Checkout\Session {
        $price = $couponData ? $couponData['final_price'] : (float) $package->price;
        $amountInCents = (int) round($price * 100);

        $metadata = [
            'employer_id' => $employer->id,
            'package_id'  => $package->id,
            'user_id'     => $user->id,
        ];

        if ($couponData) {
            $metadata['coupon_id']       = $couponData['coupon_id'];
            $metadata['coupon_code']     = $couponData['code'];
            $metadata['discount_amount'] = $couponData['discount_amount'];
            $metadata['original_price']  = $couponData['original_price'];
        }

        $description = $package->post_count . ' job post(s), ' . $package->duration_days . ' days each';
        if ($couponData) {
            $description .= ' — Coupon: ' . $couponData['code'];
        }

        return \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'line_items'           => [[
                'price_data' => [
                    'currency'     => 'usd',
                    'product_data' => [
                        'name'        => $package->name . ' — UmmahJobs',
                        'description' => $description,
                    ],
                    'unit_amount'  => $amountInCents,
                ],
                'quantity'   => 1,
            ]],
            'mode'                => 'payment',
            'success_url'         => config('services.app.frontend_url') . '/employer/packages?success=1',
            'cancel_url'          => config('services.app.frontend_url') . '/employer/packages?cancelled=1',
            'customer_email'      => $user->email,
            'receipt_email'       => null,
            'payment_intent_data' => [
                'receipt_email' => null,
                'description'   => 'UmmahJobs — ' . $package->name . ' Package',
            ],
            'metadata'            => $metadata,
        ]);
    }
}
