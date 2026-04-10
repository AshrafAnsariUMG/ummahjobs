<?php

namespace App\Http\Controllers\Api\Employer;

use App\Models\Package;
use App\Models\StripeOrder;
use App\Services\EmployerPackageService;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController
{
    public function checkout(Request $request): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $request->validate([
            'package_id' => 'required|exists:packages,id',
        ]);

        $package = Package::findOrFail($request->package_id);

        $stripeService = new StripeService();
        $session = $stripeService->createCheckoutSession(
            $employer,
            $package,
            $request->user()
        );

        return response()->json(['checkout_url' => $session->url]);
    }

    public function balance(Request $request): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $service = new EmployerPackageService();
        $balance = $service->creditBalance($employer->id);

        return response()->json($balance);
    }

    public function history(Request $request): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $orders = StripeOrder::where('employer_id', $employer->id)
            ->with('package')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }
}
