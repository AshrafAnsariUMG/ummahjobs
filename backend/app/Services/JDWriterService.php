<?php

namespace App\Services;

class JDWriterService
{
    public function generate(array $inputs): string
    {
        // 1.1 — Parse responsibilities
        $respText        = $inputs['responsibilities'] ?? '';
        $responsibilities = $this->parseBullets($respText);

        // 1.2 — Parse requirements
        $reqText      = $inputs['requirements'] ?? '';
        $requirements = $this->parseBullets($reqText);

        // 1.3 — Build opening paragraph
        $industryMap = [
            'IT & Software Development' => 'technology and software development',
            'Design'                    => 'design and creative',
            'Marketing'                 => 'marketing and growth',
            'Sales'                     => 'sales and business development',
            'Human Resources'           => 'people and culture',
            'Accounting & Finance'      => 'finance and accounting',
            'Education & Instruction'   => 'education and training',
            'Imam & Islamic Studies'    => 'Islamic education and community services',
            'Nonprofit & NGO'           => 'nonprofit and community impact',
            'Health & Care'             => 'healthcare and wellbeing',
            'Medical & Nursing'         => 'healthcare and medical services',
            'Engineering'               => 'engineering and technology',
            'Legal'                     => 'legal services',
            'Management'                => 'operations and management',
            'Customer Service'          => 'customer experience and support',
            'Media & Communications'    => 'media and communications',
            'Project Management'        => 'project delivery and operations',
        ];

        $industry = $industryMap[$inputs['category'] ?? ''] ?? 'our growing organisation';
        $jobType  = $inputs['job_type'] ? strtolower($inputs['job_type']) : 'full time';
        $location = $inputs['location']
            ? "based in {$inputs['location']}"
            : 'with flexible location options';

        $opening =
            "We are looking for a talented and motivated {$inputs['title']} to join our team. "
            . "This is a {$jobType} position {$location}, "
            . "offering an exciting opportunity to make a meaningful impact in {$industry}.";

        // 1.4 — Build role overview
        $careerLevel = $inputs['career_level'] ?? null;
        $expLevel    = $inputs['experience_level'] ?? null;

        $levelText = '';
        if ($careerLevel && $expLevel) {
            $levelText =
                "This role is ideal for a {$careerLevel}-level professional with {$expLevel} of relevant experience.";
        } elseif ($expLevel) {
            $levelText =
                "We are looking for someone with {$expLevel} of relevant experience.";
        } elseif ($careerLevel) {
            $levelText = "This is a {$careerLevel}-level position.";
        }

        // 1.5 — Build responsibilities section
        if ($responsibilities !== null) {
            $respSection =
                "**Key Responsibilities**\n\n"
                . implode("\n", array_map(fn($r) => "- {$r}", $responsibilities));
        } else {
            $respSection = "**Key Responsibilities**\n\n" . $respText;
        }

        // 1.6 — Build requirements section
        $reqSection = '';
        if (!empty(trim($reqText))) {
            if ($requirements !== null) {
                $reqSection =
                    "**Requirements**\n\n"
                    . implode("\n", array_map(fn($r) => "- {$r}", $requirements));
            } else {
                $reqSection = "**Requirements**\n\n" . $reqText;
            }
        }

        // 1.7 — Build salary section
        $salarySection = '';
        $salaryMin     = $inputs['salary_min'] ?? null;
        $salaryMax     = $inputs['salary_max'] ?? null;
        if ($salaryMin || $salaryMax) {
            $currency = $inputs['salary_currency'] ?? 'USD';
            $type     = $inputs['salary_type'] ?? 'yearly';
            if ($salaryMin && $salaryMax) {
                $salarySection =
                    "**Compensation**\n\n"
                    . "{$currency} "
                    . number_format($salaryMin)
                    . " – "
                    . number_format($salaryMax)
                    . " per {$type}.";
            } elseif ($salaryMin) {
                $salarySection =
                    "**Compensation**\n\nStarting from {$currency} "
                    . number_format($salaryMin)
                    . " per {$type}.";
            }
        }

        // 1.8 — Build what we offer section
        $offers = [
            "A supportive and inclusive work environment",
            "Opportunity to work in a Muslim-friendly organisation",
            "Professional development and growth opportunities",
        ];

        if (
            str_contains(strtolower($jobType), 'remote')
            || str_contains(strtolower($inputs['location'] ?? ''), 'remote')
        ) {
            $offers[] = "Fully remote working arrangement";
        }

        if (in_array($inputs['category'] ?? '', [
            'Imam & Islamic Studies',
            'Nonprofit & NGO',
            'Education & Instruction',
        ])) {
            $offers[] =
                "The chance to make a meaningful contribution to the Muslim community";
        }

        if (($salaryMin ?? 0) >= 50000 || ($salaryMax ?? 0) >= 50000) {
            $offers[] = "Competitive compensation package";
        }

        $offersSection =
            "**What We Offer**\n\n"
            . implode("\n", array_map(fn($o) => "- {$o}", $offers));

        // 1.9 — Build urgent section
        $urgentSection = '';
        if ($inputs['is_urgent'] ?? false) {
            $urgentSection =
                "**⚡ Urgent Hire**\n\n"
                . "We are looking to fill this position as soon as possible. "
                . "Shortlisting begins immediately.";
        }

        // 1.10 — Build closing
        $closing =
            "If you are passionate about this role and meet the requirements above, "
            . "we would love to hear from you. "
            . "Apply now and take the next step in your career.";

        // 1.11 — Assemble full JD
        $sections = array_filter([
            $opening,
            $levelText,
            $respSection,
            $reqSection,
            $salarySection,
            $offersSection,
            $urgentSection,
            $closing,
        ]);

        return implode("\n\n", $sections);
    }

    /**
     * Split text into bullet items.
     * Returns array of ≥3 items, or null if fewer than 3 (caller should use raw text).
     */
    private function parseBullets(string $text): ?array
    {
        $trimmed = trim($text);
        if ($trimmed === '') {
            return [];
        }

        $items = preg_split('/[\n,]+/', $trimmed);
        $items = array_map('trim', $items);
        $items = array_filter($items, fn($i) => $i !== '');
        $items = array_values($items);
        $items = array_map('ucfirst', $items);

        return count($items) >= 3 ? $items : null;
    }
}
