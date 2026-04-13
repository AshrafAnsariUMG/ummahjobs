<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FlodeskService;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email'      => 'required|email|max:255',
            'first_name' => 'nullable|string|max:100',
        ]);

        $service = new FlodeskService();
        $result  = $service->subscribe(
            $request->email,
            $request->first_name ?? ''
        );

        if ($result['success']) {
            return response()->json([
                'message' => "You're subscribed! JazakAllah Khayran for joining the UmmahJobs community.",
            ]);
        }

        return response()->json([
            'message' => $result['error'] ?? 'Subscription failed.',
        ], 422);
    }
}
