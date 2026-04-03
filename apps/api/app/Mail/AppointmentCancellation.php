<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentCancellation extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;
    public $reason;

    public function __construct(Appointment $appointment, string $reason = '')
    {
        $this->appointment = $appointment;
        $this->reason = $reason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Turno cancelado - Virginia Rojas Beauty',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-cancellation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
