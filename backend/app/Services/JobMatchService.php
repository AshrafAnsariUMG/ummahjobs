<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\Job;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobMatchService
{
    // ─── Region lists ────────────────────────────────────────────────────────

    private array $uaeRegions = [
        'dubai', 'abu dhabi', 'sharjah', 'ajman',
        'ras al khaimah', 'fujairah', 'umm al quwain',
        'uae', 'united arab emirates',
    ];

    private array $ukRegions = [
        'england', 'scotland', 'wales', 'northern ireland',
        'london', 'manchester', 'birmingham', 'leeds', 'liverpool',
        'bristol', 'sheffield', 'newcastle', 'nottingham', 'reading',
        'north west', 'south east', 'east midlands', 'west midlands',
        'yorkshire', 'south west', 'east of england', 'north east',
    ];

    private array $usRegions = [
        'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
        'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose',
        'austin', 'jacksonville', 'california', 'texas', 'florida',
        'new york state', 'usa', 'united states',
    ];

    private array $gccRegions = [
        'saudi arabia', 'ksa', 'riyadh', 'jeddah', 'kuwait',
        'bahrain', 'qatar', 'doha', 'oman', 'muscat', 'gulf', 'gcc',
    ];

    // ─── Synonym groups ──────────────────────────────────────────────────────

    private array $synonyms = [
        'javascript'       => ['js', 'javascript', 'ecmascript'],
        'typescript'       => ['ts', 'typescript'],
        'python'           => ['python', 'py'],
        'react'            => ['react', 'reactjs', 'react.js'],
        'nextjs'           => ['next', 'nextjs', 'next.js'],
        'nodejs'           => ['node', 'nodejs', 'node.js'],
        'vuejs'            => ['vue', 'vuejs', 'vue.js'],
        'angular'          => ['angular', 'angularjs'],
        'php'              => ['php', 'laravel', 'symfony'],
        'laravel'          => ['laravel', 'php'],
        'css'              => ['css', 'scss', 'sass', 'tailwind', 'bootstrap', 'styling'],
        'html'             => ['html', 'html5', 'markup'],
        'sql'              => ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'database'],
        'nosql'            => ['nosql', 'mongodb', 'redis', 'dynamodb', 'firebase'],
        'aws'              => ['aws', 'amazon web services', 'cloud', 'ec2', 's3'],
        'devops'           => ['devops', 'ci/cd', 'docker', 'kubernetes', 'jenkins'],
        'ml'               => ['ml', 'machine learning', 'artificial intelligence', 'ai', 'deep learning', 'neural network'],
        'ui'               => ['ui', 'ux', 'user interface', 'user experience', 'design', 'figma', 'sketch', 'adobe xd'],
        'marketing'        => ['marketing', 'digital marketing', 'seo', 'sem', 'social media', 'content marketing', 'ppc'],
        'management'       => ['management', 'mgmt', 'leadership', 'team lead', 'manager', 'director'],
        'hr'               => ['hr', 'human resources', 'recruitment', 'talent acquisition', 'people operations'],
        'finance'          => ['finance', 'accounting', 'bookkeeping', 'cpa', 'cfa', 'financial analysis'],
        'sales'            => ['sales', 'business development', 'bd', 'account executive', 'revenue', 'closing'],
        'customer service' => ['customer service', 'customer support', 'customer success', 'client relations'],
        'project management' => ['project management', 'pmp', 'agile', 'scrum', 'kanban', 'jira', 'product management'],
        'data'             => ['data', 'analytics', 'data analysis', 'data science', 'bi', 'tableau', 'power bi', 'excel'],
        'arabic'           => ['arabic', 'arab'],
        'urdu'             => ['urdu', 'hindi'],
        'remote'           => ['remote', 'work from home', 'wfh', 'distributed', 'anywhere'],
        'nonprofit'        => ['nonprofit', 'ngo', 'charity', 'volunteer', 'islamic', 'muslim', 'halal'],
        'imam'             => ['imam', 'islamic studies', 'quran', 'religious', 'masjid', 'mosque', 'dawah'],
        'education'        => ['education', 'teaching', 'teacher', 'instructor', 'training', 'tutor'],
        'healthcare'       => ['healthcare', 'health', 'medical', 'clinical', 'nursing', 'doctor', 'pharmacy'],
        'engineering'      => ['engineering', 'engineer', 'mechanical', 'electrical', 'civil', 'structural'],
        'legal'            => ['legal', 'lawyer', 'attorney', 'paralegal', 'compliance', 'contracts'],
        'full time'        => ['full time', 'full-time', 'permanent', 'ft'],
        'part time'        => ['part time', 'part-time', 'pt'],
        'contract'         => ['contract', 'freelance', 'consultant', 'temporary', 'contractor'],
    ];

    // ─── Stopwords ───────────────────────────────────────────────────────────

    private array $stopwords = [
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on',
        'at', 'to', 'for', 'of', 'with', 'by', 'from',
        'as', 'is', 'was', 'are', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does',
        'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'must', 'can', 'this', 'that',
        'these', 'those', 'it', 'its', 'we', 'our',
        'you', 'your', 'they', 'their', 'he', 'she',
        'his', 'her', 'us', 'them', 'who', 'what',
        'which', 'when', 'where', 'how', 'all', 'both',
        'each', 'more', 'most', 'other', 'into',
        'through', 'during', 'before', 'after',
        'above', 'below', 'between', 'out', 'off',
        'over', 'under', 'again', 'then', 'once',
        'also', 'just', 'because', 'if', 'while',
        'about', 'including', 'such', 'than', 'so',
        'up', 'not', 'no', 'nor', 'very', 'too',
        'work', 'working', 'join', 'looking',
        'seeking', 'required', 'requirements',
        'preferred', 'experience', 'years', 'year',
        'minimum', 'least', 'strong', 'excellent',
        'good', 'ability', 'skills', 'knowledge',
        'understanding', 'role', 'position', 'job',
        'opportunity', 'team', 'company',
        'organization', 'please', 'apply', 'must',
        'ideal', 'candidate', 'responsible',
        'responsibilities', 'duties',
    ];

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function extractKeywords(string $text): array
    {
        $text   = strtolower(strip_tags($text));
        $text   = preg_replace('/[^a-z0-9\s\-\.]/', ' ', $text);
        $tokens = preg_split('/\s+/', trim($text));
        $tokens = array_filter($tokens, function ($t) {
            return strlen($t) >= 2
                && !in_array($t, $this->stopwords, true)
                && !is_numeric($t);
        });
        return array_values(array_unique($tokens));
    }

    private function expandWithSynonyms(array $keywords): array
    {
        $expanded = $keywords;
        foreach ($keywords as $kw) {
            foreach ($this->synonyms as $synonymGroup) {
                if (in_array($kw, $synonymGroup, true)) {
                    $expanded = array_merge($expanded, $synonymGroup);
                    break;
                }
            }
        }
        return array_values(array_unique($expanded));
    }

    private function tokenOverlap(array $setA, array $setB): float
    {
        if (empty($setA) || empty($setB)) return 0.0;
        $intersection = count(array_intersect($setA, $setB));
        $union        = count(array_unique(array_merge($setA, $setB)));
        return $union > 0 ? $intersection / $union : 0.0;
    }

    private function extractExperienceYears(string $text): ?int
    {
        $text    = strtolower($text);
        $written = [
            'one' => 1, 'two' => 2, 'three' => 3, 'four' => 4,
            'five' => 5, 'six' => 6, 'seven' => 7, 'eight' => 8,
            'nine' => 9, 'ten' => 10,
        ];
        foreach ($written as $word => $num) {
            if (preg_match('/' . $word . '\s+years?/i', $text)) {
                return $num;
            }
        }
        if (preg_match('/(\d+)\s*[\+\-]\s*\d*\s*years?/i', $text, $m)) return (int) $m[1];
        if (preg_match('/(?:minimum|at\s+least|min\.?)\s+(\d+)/i', $text, $m)) return (int) $m[1];
        if (preg_match('/(\d+)\+?\s*years?/i', $text, $m)) return (int) $m[1];
        return null;
    }

    private function candidateExperienceLevel(mixed $val): int
    {
        if ($val === null || $val === '') return -1;
        $v = strtolower((string) $val);
        if (str_contains($v, 'fresh')) return 0;
        if (preg_match('/(\d+)/', $v, $m)) return min(5, (int) $m[1]);
        return -1;
    }

    private function qualificationLevel(?string $q): int
    {
        $q = strtolower($q ?? '');
        return match (true) {
            str_contains($q, 'phd') || str_contains($q, 'doctorate') => 5,
            str_contains($q, 'master')                                => 4,
            str_contains($q, 'bachelor') || str_contains($q, 'degree') => 3,
            str_contains($q, 'diploma')                               => 2,
            str_contains($q, 'high school') || str_contains($q, 'secondary') => 1,
            default                                                   => 0,
        };
    }

    private function extractRequiredQualification(string $text): ?int
    {
        $text = strtolower($text);
        if (str_contains($text, 'phd') || str_contains($text, 'doctorate')) return 5;
        if (str_contains($text, 'master') || str_contains($text, 'msc')) return 4;
        if (str_contains($text, 'bachelor') || str_contains($text, 'degree') || str_contains($text, 'bsc')) return 3;
        if (str_contains($text, 'diploma')) return 2;
        if (str_contains($text, 'high school') || str_contains($text, 'secondary')) return 1;
        return null;
    }

    private function loadRoleEquivalencies(): array
    {
        static $cache = null;
        if ($cache !== null) return $cache;

        $groups = DB::table('role_equivalencies')->get();
        $cache  = [];
        foreach ($groups as $group) {
            $terms                    = json_decode($group->terms, true) ?? [];
            $cache[$group->group_name] = array_map('strtolower', $terms);
        }
        return $cache;
    }

    private function inSameRoleGroup(string $titleA, string $titleB): bool
    {
        $a = strtolower(trim($titleA));
        $b = strtolower(trim($titleB));
        if (empty($a) || empty($b)) return false;
        if ($a === $b) return true;

        $groups = $this->loadRoleEquivalencies();
        foreach ($groups as $terms) {
            $aMatch = false;
            $bMatch = false;
            foreach ($terms as $term) {
                if (str_contains($a, $term) || str_contains($term, $a)) $aMatch = true;
                if (str_contains($b, $term) || str_contains($term, $b)) $bMatch = true;
            }
            if ($aMatch && $bMatch) return true;
        }
        return false;
    }

    private function inRegion(string $location, array $regionTerms): bool
    {
        foreach ($regionTerms as $term) {
            if (str_contains($location, $term)) return true;
        }
        return false;
    }

    private function scoreLocation(
        ?string $candidateLocation,
        ?string $jobLocation,
        ?string $jobCountry,
        bool $isRemote,
        ?string $jobType
    ): float {
        if ($isRemote || $jobType === 'Remote') return 1.0;

        $cLoc = strtolower(trim($candidateLocation ?? ''));
        $jLoc = strtolower(trim(($jobLocation ?? '') . ' ' . ($jobCountry ?? '')));

        if (empty($cLoc) || empty($jLoc)) return 0.5;

        if ($cLoc === $jLoc || str_contains($jLoc, $cLoc) || str_contains($cLoc, $jLoc)) {
            return 1.0;
        }

        if ($this->inRegion($cLoc, $this->uaeRegions) && $this->inRegion($jLoc, $this->uaeRegions)) return 0.9;
        if ($this->inRegion($cLoc, $this->ukRegions)  && $this->inRegion($jLoc, $this->ukRegions))  return 0.85;
        if ($this->inRegion($cLoc, $this->usRegions)  && $this->inRegion($jLoc, $this->usRegions))  return 0.85;
        if ($this->inRegion($cLoc, $this->gccRegions) && $this->inRegion($jLoc, $this->gccRegions)) return 0.8;

        $cTokens = array_filter(explode(' ', preg_replace('/[^a-z\s]/', '', $cLoc)), fn ($t) => strlen($t) > 2);
        $jTokens = array_filter(explode(' ', preg_replace('/[^a-z\s]/', '', $jLoc)), fn ($t) => strlen($t) > 2);
        $common  = array_intersect($cTokens, $jTokens);

        if (count($common) >= 2) return 0.75;
        if (count($common) === 1) return 0.55;
        return 0.15;
    }

    public function scoreLabel(int $score): string
    {
        return match (true) {
            $score >= 90 => 'Excellent Match',
            $score >= 75 => 'Strong Match',
            $score >= 60 => 'Good Match',
            $score >= 40 => 'Moderate Match',
            default      => 'Low Match',
        };
    }

    // ─── Main score() ────────────────────────────────────────────────────────

    public function score(Candidate $candidate, Job $job): array
    {
        $job->loadMissing(['category', 'employer']);

        $jobText      = strip_tags($job->description ?? '');
        $jobTextLower = strtolower($job->title . ' ' . $jobText);

        $isRemote = str_contains($jobTextLower, 'remote')
                 || str_contains($jobTextLower, 'work from home')
                 || str_contains($jobTextLower, 'wfh')
                 || $job->job_type === 'Remote';

        // ── 1. SKILLS (0.30) ─────────────────────────────────────────────────

        $titleKw  = $this->extractKeywords($job->title);
        $descKw   = $this->extractKeywords($jobText);
        // Title ×3 weight
        $jobKw    = array_unique(array_merge($titleKw, $titleKw, $titleKw, $descKw));
        $jobKwExp = $this->expandWithSynonyms($jobKw);

        // Candidate keyword pool
        $candidateKw = [];

        // Explicit skills ×3 (strongest signal)
        if (is_array($candidate->skills) && !empty($candidate->skills)) {
            foreach ($candidate->skills as $skill) {
                $kw          = $this->extractKeywords($skill);
                $candidateKw = array_merge($candidateKw, $kw, $kw, $kw);
            }
        }

        // Profile title ×2
        $titleKwC    = $this->extractKeywords($candidate->title ?? '');
        $candidateKw = array_merge($candidateKw, $titleKwC, $titleKwC);

        // Job category preference ×1
        $candidateKw = array_merge($candidateKw, $this->extractKeywords($candidate->job_category ?? ''));

        // Languages ×1
        if (is_array($candidate->languages)) {
            $candidateKw = array_merge(
                $candidateKw,
                $this->extractKeywords(implode(' ', $candidate->languages))
            );
        }

        // CV text ×1
        if (!empty($candidate->cv_path)) {
            $cvPath = storage_path('app/public/' . $candidate->cv_path);
            if (file_exists($cvPath)) {
                try {
                    $cvText = (new CVTextExtractor())->extract($cvPath);
                    if (!empty($cvText)) {
                        $candidateKw = array_merge($candidateKw, $this->extractKeywords($cvText));
                    }
                } catch (\Throwable $e) {
                    // CV extraction failed — skip silently
                }
            }
        }

        $candidateKwExp = $this->expandWithSynonyms(array_unique($candidateKw));

        $skillScore = $this->tokenOverlap($jobKwExp, $candidateKwExp);

        // Role equivalency boost
        $sameRole = $this->inSameRoleGroup($candidate->title ?? '', $job->title);
        if ($sameRole) {
            $skillScore = min(1.0, $skillScore + 0.35);
        }

        // ── 2. EXPERIENCE (0.25) ─────────────────────────────────────────────

        $requiredYears  = $this->extractExperienceYears($jobText);
        $candidateLevel = $this->candidateExperienceLevel($candidate->experience_years);

        if ($requiredYears === null || $candidateLevel === -1) {
            $experienceScore = 0.5;
        } else {
            $diff            = $candidateLevel - $requiredYears;
            $experienceScore = match (true) {
                $diff >= 0   => 1.0,
                $diff === -1 => 0.7,
                $diff === -2 => 0.3,
                default      => 0.0,
            };
        }

        // ── 3. LOCATION (0.20) ───────────────────────────────────────────────

        $locationScore = $this->scoreLocation(
            $candidate->location,
            $job->location,
            $job->country,
            $isRemote,
            $job->job_type
        );

        // ── 4. CATEGORY (0.15) ───────────────────────────────────────────────

        $jobCatSlug  = $job->category?->slug ?? '';
        $candCatSlug = Str::slug($candidate->job_category ?? '');

        $relatedGroups = [
            ['it-software-development', 'engineering', 'project-management'],
            ['accounting-finance', 'banking-finance'],
            ['health-care', 'medical-nursing', 'personal-care-home-health'],
            ['marketing', 'media-communications', 'sales'],
            ['human-resources', 'management', 'administrative'],
            ['education-instruction', 'imam-islamic-studies'],
            ['nonprofit-ngo', 'imam-islamic-studies'],
            ['design', 'media-communications'],
            ['customer-service', 'sales', 'administrative'],
            ['food-beverage', 'hospitality-tourism', 'retail'],
        ];

        if (empty($jobCatSlug) && empty($candCatSlug)) {
            $categoryScore = 0.5;
        } elseif (empty($jobCatSlug) || empty($candCatSlug)) {
            $categoryScore = 0.4;
        } elseif ($jobCatSlug === $candCatSlug) {
            $categoryScore = 1.0;
        } else {
            $categoryScore = 0.2;
            foreach ($relatedGroups as $group) {
                if (in_array($jobCatSlug, $group, true) && in_array($candCatSlug, $group, true)) {
                    $categoryScore = 0.7;
                    break;
                }
            }
        }

        // Title token overlap as category signal
        $titleOverlap = $this->tokenOverlap(
            $this->expandWithSynonyms($this->extractKeywords($job->title)),
            $this->expandWithSynonyms($this->extractKeywords($candidate->title ?? ''))
        );
        $categoryScore = max($categoryScore, $titleOverlap);

        // ── 5. QUALIFICATION (0.05) ──────────────────────────────────────────

        $requiredLevel      = $this->extractRequiredQualification($jobText);
        $candidateQualLevel = $this->qualificationLevel($candidate->qualification);

        if ($requiredLevel === null) {
            $qualScore = 0.7;
        } elseif ($candidateQualLevel >= $requiredLevel) {
            $qualScore = 1.0;
        } elseif ($candidateQualLevel === $requiredLevel - 1) {
            $qualScore = 0.6;
        } else {
            $qualScore = 0.2;
        }

        // ── 6. COMPLETENESS (0.05) ───────────────────────────────────────────

        $completenessScore = ((float) ($candidate->profile_complete_pct ?? 0)) / 100;

        // ── WEIGHTED TOTAL ───────────────────────────────────────────────────

        $raw = ($skillScore        * 0.30)
             + ($experienceScore   * 0.25)
             + ($locationScore     * 0.20)
             + ($categoryScore     * 0.15)
             + ($qualScore         * 0.05)
             + ($completenessScore * 0.05);

        // Language bonus (up to +0.05)
        $languageBonus  = 0.0;
        $candidateLangs = is_array($candidate->languages)
            ? array_map('strtolower', $candidate->languages)
            : [];

        $langMap = [
            'arabic'     => ['arabic', 'arab'],
            'urdu'       => ['urdu', 'hindi'],
            'french'     => ['french', 'français'],
            'turkish'    => ['turkish'],
            'malay'      => ['malay', 'bahasa'],
            'indonesian' => ['indonesian'],
            'spanish'    => ['spanish', 'español'],
            'somali'     => ['somali'],
            'bangla'     => ['bangla', 'bengali'],
        ];

        foreach ($langMap as $variants) {
            $jobWantsLang = false;
            foreach ($variants as $v) {
                if (str_contains($jobTextLower, $v)) {
                    $jobWantsLang = true;
                    break;
                }
            }
            if ($jobWantsLang) {
                foreach ($candidateLangs as $cl) {
                    foreach ($variants as $v) {
                        if (str_contains($cl, $v)) {
                            $languageBonus = 0.05;
                            break 3;
                        }
                    }
                }
            }
        }

        $finalScore = (int) round(($raw + $languageBonus) * 100);
        $finalScore = max(0, min(100, $finalScore));

        // ── REASONS & MISSING ────────────────────────────────────────────────

        $reasons = [];
        $missing = [];

        if ($sameRole) {
            $reasons[] = 'Your role background directly matches what this position requires';
        }
        if ($skillScore >= 0.6) {
            $reasons[] = "Your skills align well with this role's requirements";
        } elseif ($skillScore >= 0.3) {
            $reasons[] = 'You have some relevant skills for this position';
        }
        if ($experienceScore === 1.0 && $requiredYears !== null) {
            $reasons[] = 'Your experience level meets or exceeds the requirement';
        }
        if ($locationScore >= 0.9) {
            $reasons[] = $isRemote
                ? 'This is a remote position — location is not a barrier'
                : 'Your location is a strong match';
        } elseif ($locationScore >= 0.6) {
            $reasons[] = 'You are in a similar region to this role';
        }
        if ($categoryScore >= 0.9) {
            $reasons[] = 'Your professional background aligns with this category';
        } elseif ($categoryScore >= 0.6) {
            $reasons[] = 'Your background is related to this field';
        }
        if ($qualScore === 1.0 && $requiredLevel !== null) {
            $reasons[] = 'Your qualification meets the requirement';
        }
        if ($languageBonus > 0) {
            $reasons[] = 'Your language skills are an asset for this role';
        }
        if (is_array($candidate->skills) && count($candidate->skills) > 0 && $skillScore >= 0.4) {
            $reasons[] = 'Your listed skills align with the job requirements';
        }
        if ($completenessScore >= 0.8) {
            $reasons[] = 'Your complete profile increases your visibility to employers';
        }

        // Missing signals
        if (empty($candidate->skills)) {
            $missing[] = 'Add your skills to your profile for significantly better match accuracy';
        }
        if ($skillScore < 0.3 && !$sameRole) {
            $missing[] = 'Add more relevant skills to your profile';
        }
        if ($experienceScore < 0.3 && $requiredYears !== null) {
            $missing[] = 'This role requires ' . $requiredYears . '+ years of experience';
        }
        if ($locationScore < 0.4 && !$isRemote) {
            $missing[] = "Your location may not match this role's requirements";
        }
        if ($categoryScore < 0.3) {
            $missing[] = 'Your preferred category does not closely match this role';
        }
        if ($completenessScore < 0.5) {
            $missing[] = 'Complete your profile to improve your match score';
        }

        return [
            'score'      => $finalScore,
            'label'      => $this->scoreLabel($finalScore),
            'dimensions' => [
                'skills'        => round($skillScore, 3),
                'experience'    => round($experienceScore, 3),
                'location'      => round($locationScore, 3),
                'category'      => round($categoryScore, 3),
                'qualification' => round($qualScore, 3),
                'completeness'  => round($completenessScore, 3),
            ],
            'reasons' => $reasons,
            'missing' => $missing,
        ];
    }

    // ─── Batch scoring ───────────────────────────────────────────────────────

    public function scoreMultiple(Candidate $candidate, \Illuminate\Support\Collection $jobs): array
    {
        $results = [];
        foreach ($jobs as $job) {
            $results[$job->id] = $this->score($candidate, $job);
        }
        return $results;
    }
}
