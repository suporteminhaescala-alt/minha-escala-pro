package com.gestorpro.app;

import android.content.Context;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.Keep;

import com.onesignal.notifications.INotificationReceivedEvent;
import com.onesignal.notifications.INotificationServiceExtension;

@Keep
public class NotificationServiceExtension implements INotificationServiceExtension {
    private static final String TAG = "GestorProNotification";

    @Override
    public void onNotificationReceived(INotificationReceivedEvent event) {
        Log.i(TAG, "Notificação recebida via OneSignal Service Extension. Adquirindo Wake Lock...");

        Context context = event.getContext();

        try {
            PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                // Adquire um wake lock que liga a tela e a mantém acesa (com brilho reduzido se necessário)
                // Usando as flags necessárias para furar o doze mode e ligar a tela
                PowerManager.WakeLock wakeLock = powerManager.newWakeLock(
                        PowerManager.SCREEN_DIM_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                        "GestorPro::AlarmWakeLock"
                );

                // Adquire o lock por 10 segundos
                wakeLock.acquire(10 * 1000L);
                Log.i(TAG, "Wake Lock adquirido com sucesso por 10 segundos.");
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao tentar adquirir Wake Lock: " + e.getMessage());
        }

        // Continua a exibição normal da notificação
    }
}
