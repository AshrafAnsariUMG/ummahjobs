<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\Job;
use Illuminate\Support\Collection;

class JobMatchService
{
    // Synonym groups — single/hyphenated tokens that mean the same thing in a job context.
    // Each inner array is one equivalence class; any token from the group expands to include all siblings.
    protected array $synonyms = [
        ['javascript', 'js'],
        ['typescript', 'ts'],
        ['python', 'py'],
        ['reactjs', 'react'],
        ['vuejs', 'vue'],
        ['angularjs', 'angular'],
        ['nodejs', 'node'],
        ['kubernetes', 'k8s'],
        ['postgresql', 'postgres'],
        ['mongodb', 'mongo'],
        ['html5', 'html'],
        ['css3', 'css'],
        ['devops', 'cicd'],
        ['ai', 'ml'],
        ['aws', 'amazon'],
        ['gcp', 'google'],
        ['azure', 'microsoft'],
        ['hr', 'recruitment', 'hiring'],
        ['imam', 'khatib', 'khateeb'],
        ['excel', 'spreadsheet'],
        ['photoshop', 'illustrator', 'figma', 'canva'],
        ['accounting', 'bookkeeping', 'accounts'],
        ['nursing', 'healthcare'],
        ['teaching', 'instructor', 'educator', 'tutor', 'lecturer', 'trainer'],
        ['seo', 'sem', 'ppc'],
        ['php', 'laravel'],
        ['java', 'spring', 'springboot'],
        ['docker', 'containers'],
        ['sql', 'mysql', 'database'],
        ['agile', 'scrum', 'kanban'],
    ];

    protected array $stopwords = [
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
        'shall', 'can', 'this', 'that', 'these', 'those', 'it', 'its',
        'we', 'us', 'our', 'you', 'your', 'they', 'their', 'he', 'she', 'his', 'her',
        'who', 'which', 'what', 'when', 'where', 'how', 'why', 'not', 'no',
        'all', 'any', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
        'only', 'same', 'than', 'too', 'very', 'just', 'also', 'well', 'via',
        'ie', 'eg', 'etc', 'inc', 'ltd',
        'work', 'working', 'job', 'role', 'position', 'candidate', 'company',
        'team', 'join', 'looking', 'seeking', 'required', 'requirements',
        'responsibilities', 'skills', 'experience', 'qualifications', 'ability',
        'strong', 'excellent', 'good', 'great', 'must', 'knowledge', 'understanding',
        'including', 'within', 'across', 'between', 'plus', 'provide', 'support',
        'ensure', 'manage', 'responsible', 'ability', 'based', 'new', 'own',
        'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    ];

    /**
     * Extract meaningful keyword tokens from a text string.
     */
    public function extractKeywords(string $text): array
    {
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = strtolower($text);
        // Normalise special chars: keep letters, digits, dots (for version numbers), hyphens
        $text = preg_replace('/[^\w\s\-\.\/]/', ' ', $text);
        $text = preg_replace('/\s+/', ' ', trim($text));

        $tokens = preg_split('/[\s\-\/]+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        $filtered = [];
        foreach ($tokens as $token) {
            // Remove trailing dots/slashes left from URLs
            $token = trim($token, '.-/');
            if (strlen($token) < 2) continue;
            if (is_numeric($token)) continue;
            if (in_array($token, $this->stopwords, true)) continue;
            $filtered[] = $token;
        }

        return array_values(array_unique($filtered));
    }

    /**
     * Expand a keyword array using synonym groups.
     * Any token found in a synonym group causes all siblings to be added.
     */
    public function expandWithSynonyms(array $keywords): array
    {
        $result = $keywords;

        foreach ($keywords as $kw) {
            foreach ($this->synonyms as $group) {
                if (in_array($kw, $group, true)) {
                    foreach ($group as $sibling) {
                        if (!in_array($sibling, $result, true)) {
                            $result[] = $sibling;
                        }
                    }
                    break;
                }
            }
        }

        return array_values(array_unique($result));
    }

    /**
     * Jaccard similarity: |A ∩ B| / |A ∪ B|. Returns 0 if both sets are empty.
     */
    public function tokenOverlap(array $setA, array $setB): float
    {
        if (empty($setA) && empty($setB)) return 0.0;

        $intersection = count(array_intersect($setA, $setB));
        $union        = count(array_unique(array_merge($setA, $setB)));

        return $union > 0 ? $intersection / $union : 0.0;
    }

    /**
     * Extract the minimum required years from job description text.
     * Returns null if no numeric requirement found.
     */
    public function extractExperienceYears(string $text): ?int
    {
        $text = strtolower($text);

        // "3+ years", "3 or more years", "minimum 3 years", "at least 3 years"
        if (preg_match('/(\d+)\s*\+\s*year/', $text, $m)) return (int) $m[1];
        if (preg_match('/(?:minimum|at least|min\.?)\s+(\d+)\s+year/', $text, $m)) return (int) $m[1];
        if (preg_match('/(\d+)\s+or more years/', $text, $m)) return (int) $m[1];

        // "3-5 years" → take the minimum
        if (preg_match('/(\d+)\s*[-–]\s*\d+\s+year/', $text, $m)) return (int) $m[1];

        // "5 years of experience", "5 years experience"
        if (preg_match('/(\d+)\s+year[s]?\s+(?:of\s+)?experience/', $text, $m)) return (int) $m[1];

        // Written numbers
        $written = ['zero' => 0, 'one' => 1, 'two' => 2, 'three' => 3,
                    'four' => 4, 'five' => 5, 'six' => 6, 'seven' => 7];
        foreach ($written as $word => $num) {
            if (preg_match('/' . $word . '\s+year[s]?\s+(?:of\s+)?experience/', $text)) {
                return $num;
            }
        }

        // "senior" / "lead" → infer ~5 years; "entry level" / "fresh" / "junior" → 0
        if (preg_match('/\b(?:senior|lead|principal|head)\b/', $text)) return 4;
        if (preg_match('/\b(?:entry.level|junior|fresh|graduate)\b/', $text)) return 0;

        return null;
    }

    /**
     * Map a candidate's experience_years string to a numeric level 0–5.
     * Returns -1 if unknown/null (caller treats as neutral).
     */
    public function candidateExperienceLevel(mixed $experienceYears): int
    {
        if (empty($experienceYears)) return -1;

        $val = strtolower(trim((string) $experienceYears));

        if (str_contains($val, 'fresh') || str_contains($val, 'no ')) return 0;

        if (preg_match('/^(\d+)/', $val, $m)) {
            return min(5, (int) $m[1]);
        }

        return -1;
    }

    /**
     * Map a candidate's qualification string to a numeric level 0–5.
     */
    public function qualificationLevel(?string $qualification): int
    {
        if (!$qualification) return 0;

        $q = strtolower($qualification);

        if (str_contains($q, 'doctorate') || str_contains($q, 'phd') || str_contains($q, 'ph.d')) return 5;
        if (str_contains($q, "master") || str_contains($q, 'mba') || str_contains($q, 'postgrad')) return 4;
        if (str_contains($q, 'bachelor') || str_contains($q, 'degree') || str_contains($q, 'b.s') || str_contains($q, 'b.a')) return 3;
        if (str_contains($q, 'associate') || str_contains($q, 'diploma') || str_contains($q, 'hnd')) return 2;
        if (str_contains($q, 'certificate') || str_contains($q, 'cert') || str_contains($q, 'a level') || str_contains($q, 'alevel')) return 1;

        return 0;
    }

    /**
     * Extract required qualification level from job description text.
     */
    public function extractRequiredQualification(string $text): ?int
    {
        $text = strtolower($text);

        if (preg_match('/\b(?:phd|ph\.d|doctorate)\b/', $text)) return 5;
        if (preg_match("/\\b(?:master'?s?|mba|postgraduate)\\b/", $text)) return 4;
        if (preg_match("/\\b(?:bachelor'?s?|b\\.s|b\\.a|bsc|undergraduate degree)\\b/", $text)) return 3;
        if (preg_match('/\b(?:associate|diploma|hnd)\b/', $text)) return 2;
        if (preg_match('/\b(?:certificate|a-level|gcse)\b/', $text)) return 1;

        return null;
    }

    /**
     * Score a candidate against a job across six weighted dimensions.
     * Returns ['score' => int 0–100, 'reasons' => string[], 'missing' => string[], 'dimensions' => float[]]
     */
    public function score(Candidate $candidate, Job $job): array
    {
        // ─── 1. SKILLS (weight 0.30) ──────────────────────────────────────
        // Job: title (doubled for emphasis) + description
        $jobText = $job->title . ' ' . $job->title . ' ' . strip_tags($job->description ?? '');
        $jobKws  = $this->expandWithSynonyms($this->extractKeywords($jobText));

        // Candidate: professional title + job_category + languages
        $langStr = '';
        if (!empty($candidate->languages)) {
            $langs   = is_array($candidate->languages) ? $candidate->languages : [$candidate->languages];
            $langStr = implode(' ', $langs);
        }
        $candText = trim(($candidate->title ?? '') . ' ' . ($candidate->job_category ?? '') . ' ' . $langStr);
        $candKws  = $this->expandWithSynonyms($this->extractKeywords($candText));

        $skillsScore = $this->tokenOverlap($jobKws, $candKws);

        // ─── 2. EXPERIENCE (weight 0.25) ──────────────────────────────────
        $requiredYears  = $this->extractExperienceYears(strip_tags($job->description ?? ''));
        $candidateLevel = $this->candidateExperienceLevel($candidate->experience_years);

        if ($requiredYears === null || $candidateLevel < 0) {
            $experienceScore = 0.5; // neutral — not enough data
        } else {
            $diff = $candidateLevel - $requiredYears;
            $experienceScore = match (true) {
                $diff >= 0  => 1.0,
                $diff === -1 => 0.7,
                $diff === -2 => 0.4,
                default     => 0.1,
            };
        }

        // ─── 3. LOCATION (weight 0.20) ────────────────────────────────────
        $jobLocationStr = strtolower(trim(($job->location ?? '') . ' ' . ($job->country ?? '')));
        $descLower      = strtolower(strip_tags($job->description ?? ''));
        $isRemote       = str_contains($jobLocationStr, 'remote')
                       || str_contains($descLower, 'fully remote')
                       || str_contains($descLower, '100% remote');

        if ($isRemote) {
            $locationScore = 1.0;
        } elseif ($candidate->location) {
            $candLocKws = $this->extractKeywords(strtolower($candidate->location));
            $jobLocKws  = $this->extractKeywords($jobLocationStr);

            $overlap       = $this->tokenOverlap($candLocKws, $jobLocKws);
            // Boost: if at least one shared token, treat as partial match
            $locationScore = $overlap > 0 ? max(0.6, $overlap) : 0.15;
        } else {
            $locationScore = 0.3; // no location on profile → neutral-low
        }

        // ─── 4. CATEGORY (weight 0.15) ────────────────────────────────────
        $jobCatSlug = $job->category?->slug ?? '';
        $jobCatName = strtolower($job->category?->name ?? '');
        $candCat    = strtolower($candidate->job_category ?? '');

        if ($jobCatSlug && $candCat) {
            // Normalize candidate category to slug-like form for direct comparison
            $candCatSlug = preg_replace('/[^a-z0-9]+/', '-', $candCat);
            $candCatSlug = trim($candCatSlug, '-');

            if ($jobCatSlug === $candCatSlug
                || str_contains($jobCatSlug, $candCatSlug)
                || str_contains($candCatSlug, $jobCatSlug)) {
                $categoryScore = 1.0;
            } else {
                $catKwsJob  = $this->extractKeywords($jobCatName);
                $catKwsCand = $this->extractKeywords($candCat);
                $catOverlap = $this->tokenOverlap($catKwsJob, $catKwsCand);

                // Also compare candidate category against job title keywords
                $titleKws     = $this->extractKeywords(strtolower($job->title));
                $titleOverlap = $this->tokenOverlap($titleKws, $catKwsCand);

                $categoryScore = max($catOverlap, $titleOverlap * 0.9);
            }
        } else {
            $categoryScore = 0.3; // missing data → neutral-low
        }

        // ─── 5. QUALIFICATION (weight 0.05) ───────────────────────────────
        $requiredQual  = $this->extractRequiredQualification(strip_tags($job->description ?? ''));
        $candidateQual = $this->qualificationLevel($candidate->qualification);

        if ($requiredQual === null) {
            $qualScore = 0.6; // no requirement detected → neutral
        } elseif ($candidateQual >= $requiredQual) {
            $qualScore = 1.0;
        } elseif ($candidateQual >= $requiredQual - 1) {
            $qualScore = 0.6;
        } else {
            $qualScore = 0.2;
        }

        // ─── 6. PROFILE COMPLETENESS (weight 0.05) ───────────────────────
        $completenessScore = min(1.0, ((float) ($candidate->profile_complete_pct ?? 0)) / 100);

        // ─── WEIGHTED TOTAL ───────────────────────────────────────────────
        $dimensions = [
            'skills'        => round($skillsScore, 3),
            'experience'    => round($experienceScore, 3),
            'location'      => round($locationScore, 3),
            'category'      => round($categoryScore, 3),
            'qualification' => round($qualScore, 3),
            'completeness'  => round($completenessScore, 3),
        ];

        $weights = [
            'skills'        => 0.30,
            'experience'    => 0.25,
            'location'      => 0.20,
            'category'      => 0.15,
            'qualification' => 0.05,
            'completeness'  => 0.05,
        ];

        $weighted = 0.0;
        foreach ($weights as $dim => $w) {
            $weighted += $dimensions[$dim] * $w;
        }
        $totalScore = (int) round($weighted * 100);
        $totalScore = max(0, min(100, $totalScore));

        // ─── REASONS & MISSING ────────────────────────────────────────────
        $reasons = [];
        $missing = [];

        if ($skillsScore >= 0.5) {
            $reasons[] = 'Your skills profile closely matches this role';
        } elseif ($skillsScore >= 0.25) {
            $reasons[] = 'Some of your skills are relevant to this role';
            $missing[] = 'Strengthen your skills section to better match this role\'s requirements';
        } else {
            $missing[] = 'Your skills profile doesn\'t closely match this role\'s requirements';
        }

        if ($requiredYears !== null && $candidateLevel >= 0) {
            if ($candidateLevel >= $requiredYears) {
                $reasons[] = 'Your experience level meets or exceeds the requirements';
            } elseif ($candidateLevel >= $requiredYears - 1) {
                $missing[] = 'You may be slightly under the required experience level for this role';
            } else {
                $missing[] = 'This role appears to require more experience than you currently have';
            }
        }

        if ($isRemote) {
            $reasons[] = 'This is a remote role — no location restriction';
        } elseif ($locationScore >= 0.6) {
            $reasons[] = 'Your location matches the job location';
        } elseif ($candidate->location) {
            $locDisplay = ucwords(trim($job->location ?? $job->country ?? 'a specific location'));
            $missing[]  = "This role is based in {$locDisplay}, which may not match your location";
        } else {
            $missing[] = 'Add your location to your profile for a more accurate match';
        }

        if ($categoryScore >= 0.7) {
            $reasons[] = 'This role aligns well with your job category';
        } elseif ($categoryScore < 0.3) {
            $missing[] = 'This role\'s category may not align with your current job category';
        }

        if ($requiredQual !== null && $candidateQual < $requiredQual) {
            $qualNames = [1 => 'a Certificate', 2 => 'an Associate Degree',
                          3 => 'a Bachelor\'s Degree', 4 => 'a Master\'s Degree', 5 => 'a Doctorate'];
            $missing[] = 'This role may require ' . ($qualNames[$requiredQual] ?? 'a higher qualification');
        } elseif ($requiredQual !== null && $candidateQual >= $requiredQual) {
            $reasons[] = 'Your qualification meets the stated requirements';
        }

        if ($completenessScore < 0.5) {
            $missing[] = 'Complete your profile to get a more accurate match score';
        }

        return [
            'score'      => $totalScore,
            'reasons'    => $reasons,
            'missing'    => $missing,
            'dimensions' => $dimensions,
        ];
    }

    /**
     * Score a candidate against multiple jobs. Returns array keyed by job ID.
     */
    public function scoreMultiple(Candidate $candidate, Collection $jobs): array
    {
        $results = [];
        foreach ($jobs as $job) {
            $results[$job->id] = $this->score($candidate, $job);
        }
        return $results;
    }
}
