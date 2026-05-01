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
        $service->subscribe(
            $request->email,
            $request->first_name ?? '',
            '67b761b0de47463b8b7f285f'
        );

        return response()->json([
            'message' => "You're subscribed! JazakAllah Khayran for joining the UmmahJobs community.",
        ]);
    }
}
