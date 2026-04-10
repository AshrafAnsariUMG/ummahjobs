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
        User $user
    ): \Stripe\Checkout\Session {
        return \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'line_items'           => [[
                'price_data' => [
                    'currency'     => 'usd',
                    'product_data' => [
                        'name'        => $package->name . ' — UmmahJobs',
                        'description' => $package->post_count
                            . ' job post(s), '
                            . $package->duration_days
                            . ' days each',
                    ],
                    'unit_amount'  => (int) ($package->price * 100),
                ],
                'quantity'   => 1,
            ]],
            'mode'           => 'payment',
            'success_url'    => env('FRONTEND_URL') . '/employer/packages?success=1',
            'cancel_url'     => env('FRONTEND_URL') . '/packages',
            'customer_email' => $user->email,
            'metadata'       => [
                'employer_id' => $employer->id,
                'package_id'  => $package->id,
                'user_id'     => $user->id,
            ],
        ]);
    }
}
