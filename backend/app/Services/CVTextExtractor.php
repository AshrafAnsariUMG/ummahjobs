<?php

namespace App\Services;

class CVTextExtractor
{
    public function extract(string $filePath): string
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        if ($extension === 'pdf') {
            return $this->extractPdf($filePath);
        }

        if (in_array($extension, ['docx', 'doc'])) {
            return $this->extractDocx($filePath);
        }

        return '';
    }

    private function extractPdf(string $filePath): string
    {
        try {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf    = $parser->parseFile($filePath);
            $text   = $pdf->getText();
            return trim($text) ?: '';
        } catch (\Throwable $e) {
            return $this->basicPdfExtract($filePath);
        }
    }

    private function extractDocx(string $filePath): string
    {
        try {
            $zip = new \ZipArchive();
            if ($zip->open($filePath) === true) {
                $xml = $zip->getFromName('word/document.xml');
                $zip->close();
                if ($xml) {
                    $text = strip_tags($xml);
                    $text = preg_replace('/\s+/', ' ', $text);
                    return trim($text);
                }
            }
        } catch (\Throwable $e) {
            // fall through
        }
        return '';
    }

    private function basicPdfExtract(string $filePath): string
    {
        $content = @file_get_contents($filePath);
        if (!$content) return '';

        preg_match_all('/stream(.*?)endstream/s', $content, $matches);

        $text = '';
        foreach ($matches[1] as $stream) {
            $decoded = @gzuncompress($stream);
            if ($decoded) {
                $text .= preg_replace('/[^\x20-\x7E\n]/', ' ', $decoded);
            }
        }
        return trim($text);
    }
}
