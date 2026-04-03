<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * POST /api/upload/image
     * Uploads an image to Cloudflare R2 and returns the public URL.
     */
    public function image(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120', // 5MB max
        ]);

        $file      = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename  = Str::uuid() . '.' . $extension;
        $path      = 'images/' . $filename;

        try {
            $uploaded = Storage::disk('s3')->putFileAs('images', $file, $filename);

            if (!$uploaded) {
                Log::error('R2 upload returned false', ['path' => $path]);
                return response()->json(['error' => 'Upload failed (storage returned false)'], 500);
            }

            $exists = Storage::disk('s3')->exists($path);
            $url    = Storage::disk('s3')->url($path);

            Log::info('R2 upload result', [
                'path'     => $path,
                'uploaded' => $uploaded,
                'exists'   => $exists,
                'url'      => $url,
                'endpoint' => config('filesystems.disks.s3.endpoint'),
                'bucket'   => config('filesystems.disks.s3.bucket'),
            ]);

            return response()->json(['url' => $url, 'exists' => $exists]);

        } catch (\Throwable $e) {
            Log::error('R2 upload exception', [
                'message'  => $e->getMessage(),
                'previous' => $e->getPrevious()?->getMessage(),
                'path'     => $path,
                'trace'    => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
