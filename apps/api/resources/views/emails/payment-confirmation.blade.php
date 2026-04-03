<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago Recibido - Virginia Rojas Beauty</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f8f8; color: #333; margin: 0; padding: 40px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #2ecc71; padding: 40px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 28px;">Virginia Rojas Beauty</h1>
            <p style="margin-top: 10px; font-size: 16px; opacity: 0.9;">Pago recibido exitosamente</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px;">
            <p style="font-size: 18px; line-height: 1.6;">Hola <strong>{{ $appointment->customer_name }}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #666;">Recibimos tu pago correctamente. Tu turno esta <strong style="color: #2ecc71;">confirmado</strong>.</p>

            <!-- Payment Details -->
            <div style="background-color: #f0faf4; border: 1px solid #d4edda; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h2 style="margin: 0 0 15px 0; color: #2ecc71; font-size: 20px;">Comprobante de pago</h2>
                <table style="width: 100%; font-size: 15px;">
                    <tr>
                        <td style="padding: 8px 0; color: #888; width: 35%;">Sena abonada:</td>
                        <td style="padding: 8px 0; font-weight: bold; color: #2ecc71;">${{ number_format($appointment->deposit_amount, 2, ',', '.') }} ARS</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #888;">ID de pago:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{{ $appointment->mp_payment_id }}</td>
                    </tr>
                </table>
            </div>

            <!-- Appointment Details -->
            <div style="background-color: #fff9f9; border: 1px solid #ffe4e4; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h2 style="margin: 0 0 15px 0; color: #F08080; font-size: 20px;">Tu turno confirmado</h2>
                <table style="width: 100%; font-size: 15px;">
                    <tr>
                        <td style="padding: 8px 0; color: #888; width: 35%;">Servicio:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{{ $appointment->service->name }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #888;">Fecha:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{{ \Carbon\Carbon::parse($appointment->date)->format('d/m/Y') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #888;">Hora:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{{ substr($appointment->start_time, 0, 5) }} hs</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #888;">Profesional:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{{ $appointment->professional->name }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #888;">Precio total:</td>
                        <td style="padding: 8px 0; font-weight: bold;">${{ number_format($appointment->service->price, 2, ',', '.') }} ARS</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #888;">Resta abonar:</td>
                        <td style="padding: 8px 0; font-weight: bold; color: #e67e22;">${{ number_format($appointment->service->price - $appointment->deposit_amount, 2, ',', '.') }} ARS</td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #888; text-align: center; margin-bottom: 30px;">
                El saldo restante se abona en el local el dia de tu turno.
            </p>

            <div style="text-align: center;">
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
