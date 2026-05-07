<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class YoutubeHelper
{

    public static function fetchTitle(string $url, string $fallback = 'Untitled'): string
    {
        try {
            $response = Http::withoutVerifying()
                ->timeout(5)
                ->get('https://www.youtube.com/oembed', [
                    'url' => $url,
                    'format' => 'json',
                ]);

            if ($response->successful()) {
                $title = $response->json('title');
                if (is_string($title) && $title !== '') {
                    return $title;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('YouTube oEmbed fetch failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
        }

        return $fallback;
    }
}
