<?php

namespace App\Jobs;

use App\Models\CouponUse;
use App\Services\EmailTemplateService as ET;
use App\Services\GmailMailerService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendPackageConfirmation implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $userId,
        public int $packageId,
        public ?string $stripeOrderId = null
    ) {}

    public function handle(): void
    {
        $user    = \App\Models\User::find($this->userId);
        $package = \App\Models\Package::find($this->packageId);

        if (!$user || !$package) {
            return;
        }

        $mailer = new GmailMailerService();

        $date    = now()->format('F j, Y');
        $orderId = $this->stripeOrderId ?? 'N/A';

        $shortOrderId = strlen($orderId) > 20
            ? substr($orderId, 0, 20) . '...'
            : $orderId;

        $dashboardUrl = config('services.app.frontend_url') . '/employer/post-job';

        // Check if a coupon was used for this order
        $couponUse = $this->stripeOrderId
            ? CouponUse::with('coupon')
                ->where('stripe_session_id', $this->stripeOrderId)
                ->first()
            : null;

        $amountPaid = $couponUse
            ? number_format($couponUse->final_price, 2)
            : number_format((float) $package->price, 2);

        $couponRows = '';
        if ($couponUse && $couponUse->coupon) {
            $couponRows = "
              <tr>
                <td style=\"padding:4px 0;\"><strong>Original Price</strong></td>
                <td style=\"text-align:right;\">\${$couponUse->original_price}</td>
              </tr>
              <tr>
                <td style=\"padding:4px 0;color:#0FBB0F;\"><strong>Coupon ({$couponUse->coupon->code})</strong></td>
                <td style=\"text-align:right;color:#0FBB0F;\">-\${$couponUse->discount_amount}</td>
              </tr>
              <tr>
                <td colspan=\"2\" style=\"padding:2px 0;\"><hr style=\"border:none;border-top:1px solid #BFDBFE;\"></td>
              </tr>";
        }

        $orderBox = ET::infoBox(
            "<table style=\"width:100%;font-size:14px;color:#1E40AF;\">
              <tr>
                <td style=\"padding:4px 0;\"><strong>Package</strong></td>
                <td style=\"text-align:right;\">{$package->name}</td>
              </tr>
              {$couponRows}
              <tr>
                <td style=\"padding:4px 0;\"><strong>Amount Paid</strong></td>
                <td style=\"text-align:right;\">\${$amountPaid}</td>
              </tr>
              <tr>
                <td style=\"padding:4px 0;\"><strong>Job Post Credits</strong></td>
                <td style=\"text-align:right;\">{$package->post_count}</td>
              </tr>
              <tr>
                <td style=\"padding:4px 0;\"><strong>Listing Duration</strong></td>
                <td style=\"text-align:right;\">{$package->duration_days} days</td>
              </tr>
              <tr>
                <td style=\"padding:4px 0;\"><strong>Order ID</strong></td>
                <td style=\"text-align:right;font-size:12px;color:#6B7280;\">{$shortOrderId}</td>
              </tr>
              <tr>
                <td style=\"padding:4px 0;\"><strong>Date</strong></td>
                <td style=\"text-align:right;\">{$date}</td>
              </tr>
            </table>"
        );

        $body = ET::heading('Payment Confirmed!')
            . ET::paragraph("Assalamu Alaikum {$user->display_name},")
            . ET::paragraph(
                "JazakAllah Khayran for your purchase! Your payment has been received "
                . "and your job post credits are now active."
            )
            . $orderBox
            . ET::button($dashboardUrl, 'Post Your First Job', '#0FBB0F')
            . ET::divider()
            . ET::paragraph(
                "<span style=\"font-size:13px;color:#6B7280;\">"
                . "Your credits never expire — use them whenever you're ready to hire. "
                . "If you have any questions, reply to this email or contact us at "
                . "<a href=\"mailto:support@muslimadnetwork.com\" style=\"color:#033BB0;\">"
                . "support@muslimadnetwork.com</a>.</span>"
            );

        $html = ET::wrap('Your UmmahJobs order is confirmed', $body);

        $mailer->sendHtml(
            $user->email,
            'Order Confirmed — ' . $package->name . ' Package | UmmahJobs',
            $html
        );
    }
}
