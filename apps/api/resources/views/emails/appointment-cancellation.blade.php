<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Turno Cancelado - Virginia Rojas Beauty</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f8f8; color: #333; margin: 0; padding: 40px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #e74c3c; padding: 40px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 28px;">Virginia Rojas Beauty</h1>
            <p style="margin-top: 10px; font-size: 16px; opacity: 0.9;">Tu turno ha sido cancelado</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px;">
            <p style="font-size: 18px; line-height: 1.6;">Hola <strong>{{ $appointment->customer_name }}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #666;">Te informamos que tu turno ha sido cancelado.</p>

            @if($reason)
            <div style="background-color: #fef9e7; border: 1px solid #f9e79f; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; font-size: 15px; color: #7d6608;">
                    <strong>Motivo:</strong> {{ $reason }}
                </p>
            </div>
            @endif

            <!-- Cancelled Appointment Details -->
            <div style="background-color: #fdf2f2; border: 1px solid #f5c6cb; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h2 style="margin: 0 0 15px 0; color: #e74c3c; font-size: 20px;">Turno cancelado</h2>
                <table style="width: 100%; font-size: 15px;">
                    <tr>
                        <td style="padding: 8px 0; color: #888; width: 35%;">Servicio:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-decoration: line-through; color: #999;">{{ $appointment->service->name }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #888;">Fecha:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-decoration: line-through; color: #999;">{{ \Carbon\Carbon::parse($appointment->date)->format('d/m/Y') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #888;">Hora:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-decoration: line-through; color: #999;">{{ substr($appointment->start_time, 0, 5) }} hs</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #888;">Profesional:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-decoration: line-through; color: #999;">{{ $appointment->professional->name }}</td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #666; text-align: center;">
                Podes agendar un nuevo turno cuando quieras.
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="https://virginiarojasbeauty.com.ar" style="background-color: #F08080; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; margin-right: 10px;">Reservar nuevo turno</a>
            </div>

            <div style="text-align: center; margin-top: 15px;">
                <a href="https://wa.me/5491170742867" style="background-color: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Consultar por WhatsApp</a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #fdfdfd; padding: 20px; text-align: center; font-size: 12px; color: #bbb; border-top: 1px solid #f0f0f0;">
            &copy; {{ date('Y') }} Virginia Rojas Beauty. <br>
            Enviado automaticamente por el Sistema de Turnos.
        </div>
    </div>
</body>
</html>
