package com.timekeeping;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class BackgroundTaskModule extends ReactContextBaseJavaModule {
    public BackgroundTaskModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BackgroundTaskModule";
    }

    @ReactMethod
    public void startBackgroundService() {
        Intent serviceIntent = new Intent(getReactApplicationContext(), BackgroundService.class);
        getReactApplicationContext().startService(serviceIntent);
    }
}
