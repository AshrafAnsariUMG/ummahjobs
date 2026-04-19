<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key'            => env('STRIPE_KEY'),
        'secret'         => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'app' => [
        'frontend_url' => env('FRONTEND_URL', 'http://localhost:3003'),
    ],

    'flodesk' => [
        'api_key'    => env('FLODESK_API_KEY'),
        'segment_id' => env('FLODESK_SEGMENT_ID'),
    ],

    'gmail' => [
        'client_id'     => env('GMAIL_OAUTH_CLIENT_ID'),
        'client_secret' => env('GMAIL_OAUTH_CLIENT_SECRET'),
        'refresh_token' => env('GMAIL_REFRESH_TOKEN'),
        'from_address'  => env('GMAIL_FROM_ADDRESS'),
        'from_name'     => env('GMAIL_FROM_NAME', 'UmmahJobs'),
    ],

];
