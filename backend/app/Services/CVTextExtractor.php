<?php

namespace App\Services;

/**
 * Extracts plain text from uploaded CV files.
 * Currently supports plain-text files and basic PDF text streams.
 * For production, swap in a proper library such as smalot/pdfparser.
 */
class CVTextExtractor
{
    /**
     * Extract text from an absolute file path.
     * Returns an empty string on failure.
     */
    public function extract(string $absolutePath): string
    {
        if (!is_readable($absolutePath)) {
            return '';
        }

        $ext = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));

        return match ($ext) {
            'pdf'  => $this->extractPdf($absolutePath),
            'txt'  => file_get_contents($absolutePath) ?: '',
            'docx' => $this->extractDocx($absolutePath),
            default => '',
        };
    }

    /**
     * Naive PDF text extraction: reads raw bytes and pulls out BT...ET text streams.
     * Adequate for simple, text-based PDFs. For scanned PDFs use an OCR service.
     */
    private function extractPdf(string $path): string
    {
        $raw = file_get_contents($path);
        if ($raw === false) return '';

        $text = '';
        // Match text blocks: BT ... ET
        if (preg_match_all('/BT\s+(.*?)\s+ET/s', $raw, $blocks)) {
            foreach ($blocks[1] as $block) {
                // Extract string literals inside parentheses
                if (preg_match_all('/\(([^)]*)\)/', $block, $strings)) {
                    foreach ($strings[1] as $s) {
                        $text .= ' ' . $this->decodePdfString($s);
                    }
                }
            }
        }

        return trim($text);
    }

    private function decodePdfString(string $s): string
    {
        // Handle common PDF escape sequences
        $s = str_replace(['\\n', '\\r', '\\t'], ["\n", "\r", "\t"], $s);
        $s = preg_replace('/\\\\(\d{3})/', '', $s); // octal escapes — strip for now
        $s = str_replace('\\\\', '\\', $s);
        return $s;
    }

    /**
     * Extract plain text from a .docx file (ZIP-based XML).
     */
    private function extractDocx(string $path): string
    {
        if (!class_exists('ZipArchive')) return '';

        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) return '';

        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($xml === false) return '';

        // Strip XML tags, decode entities
        $text = strip_tags(str_replace('</w:p>', "\n", $xml));
        return html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}
