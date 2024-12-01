package com.timekeeping;

import android.content.Context; 
import android.content.Intent;
import android.provider.Settings;
import com.facebook.react.bridge.Promise; 
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class DeveloperOptionsModule extends ReactContextBaseJavaModule {

    public DeveloperOptionsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DeveloperOptions";
    }

    @ReactMethod
    public void openDeveloperOptions() {
        Intent fallbackIntent = new Intent(Settings.ACTION_SETTINGS);
        fallbackIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getCurrentActivity().startActivity(fallbackIntent);
    }

    @ReactMethod
    public void openLocationSettings() {
        Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
    }

    // Method to check if date and time are set to automatic
    @ReactMethod
    public void isAutoDateTimeEnabled(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            int autoDateTime = Settings.Global.getInt(context.getContentResolver(), Settings.Global.AUTO_TIME, 0);
            promise.resolve(autoDateTime != 0);
        } catch (Exception e) { // Catching general Exception
            promise.reject("Error", "Could not retrieve auto date and time setting");
        }
    }

    // Method to check if timezone is set to automatic
    @ReactMethod
    public void isAutoTimeZoneEnabled(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            int autoTimeZone = Settings.Global.getInt(context.getContentResolver(), Settings.Global.AUTO_TIME_ZONE, 0);
            promise.resolve(autoTimeZone != 0);
        } catch (Exception e) { // Catching general Exception
            promise.reject("Error", "Could not retrieve auto timezone setting");
        }
    }


    @ReactMethod
public void openDateTimeSettings() {
    Intent intent = new Intent(Settings.ACTION_DATE_SETTINGS);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    getReactApplicationContext().startActivity(intent);
}
}
