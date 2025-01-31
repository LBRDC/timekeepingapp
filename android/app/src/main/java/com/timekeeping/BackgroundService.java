package com.timekeeping;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

public class BackgroundService extends Service {
    private static final String TAG = "BackgroundService";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Background service started");

        // Do the task here (e.g., fetch data, execute code)

        // You can schedule recurring tasks using Handler or AlarmManager
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    while (true) {
                        // Your background task logic
                        Log.d(TAG, "Running background task...");
                        Thread.sleep(5000); // Run every 5 seconds
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();

        return START_STICKY; // Keep the service running even if the app is killed
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
