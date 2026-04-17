<?php

namespace App\Services;

class EmailTemplateService
{
    public static function wrap(string $preheader, string $bodyHtml): string
    {
        $logoUrl     = env('FRONTEND_URL') . '/images/logo.png';
        $frontendUrl = env('FRONTEND_URL', 'https://ummahjobs.com');
        $year        = date('Y');

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UmmahJobs</title>
  <span style="display:none;font-size:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;">{$preheader}</span>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F6;padding:32px 16px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#033BB0;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
              <img src="{$logoUrl}" alt="UmmahJobs" height="40" style="height:40px;width:auto;filter:brightness(0) invert(1);" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF;padding:40px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
              {$bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">
                You received this email because you have an account on
                <a href="{$frontendUrl}" style="color:#033BB0;text-decoration:none;">UmmahJobs.com</a>
              </p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                &copy; {$year} Ummah Media Group LLC &bull; 515 Madison Ave Suite 9111, Manhattan, New York 10022
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
HTML;
    }

    public static function button(string $url, string $text, string $color = '#033BB0'): string
    {
        return <<<HTML
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr>
    <td style="background:{$color};border-radius:8px;padding:0;">
      <a href="{$url}" style="display:inline-block;padding:14px 28px;color:#FFFFFF;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px;">{$text}</a>
    </td>
  </tr>
</table>
HTML;
    }

    public static function heading(string $text): string
    {
        return '<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">' . $text . '</h1>';
    }

    public static function paragraph(string $text): string
    {
        return '<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">' . $text . '</p>';
    }

    public static function infoBox(string $html, string $bg = '#EFF6FF', string $border = '#BFDBFE'): string
    {
        return '<div style="background:' . $bg . ';border:1px solid ' . $border . ';border-radius:8px;padding:16px 20px;margin:16px 0;">'
            . $html
            . '</div>';
    }

    public static function divider(): string
    {
        return '<hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;">';
    }
}
