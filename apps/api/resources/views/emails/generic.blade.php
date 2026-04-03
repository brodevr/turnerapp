
<x-mail::message>
# {{ $subject }}

{{ $content }}

@if($buttonUrl)
<x-mail::button :url="$buttonUrl">
{{ $buttonText }}
</x-mail::button>
@endif

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
