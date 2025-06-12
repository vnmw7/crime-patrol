package com.lccbbsit.crimepatrol;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;
import android.util.Log;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.util.List;

public class CustomCallerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "CustomCallerModule";
    private ReactApplicationContext reactContext;

    CustomCallerModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return "CustomCaller"; // This is how you'll access it from JavaScript
    }

    private boolean hasPermissions() {
        return ContextCompat.checkSelfPermission(this.reactContext, android.Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED &&
               ContextCompat.checkSelfPermission(this.reactContext, android.Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED;
    }

    @ReactMethod
    public void callWithSim(String phoneNumber, String simPreference, Promise promise) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            promise.reject("INVALID_NUMBER", "Phone number cannot be empty.");
            return;
        }

        if (!hasPermissions()) {
            promise.reject("PERMISSION_DENIED", "CALL_PHONE or READ_PHONE_STATE permission not granted.");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CALL, Uri.parse("tel:" + phoneNumber));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) { // TelecomManager API level
            TelecomManager telecomManager = (TelecomManager) this.reactContext.getSystemService(Context.TELECOM_SERVICE);
            if (telecomManager == null) {
                Log.w(TAG, "TelecomManager not available. Proceeding with system default.");
                // Fall through to system default behavior
            } else {
                List<PhoneAccountHandle> accountHandles = null;
                try {
                     // This requires READ_PHONE_STATE
                    accountHandles = telecomManager.getCallCapablePhoneAccounts();
                } catch (SecurityException e) {
                    Log.e(TAG, "SecurityException while getting call capable accounts: " + e.getMessage());
                    promise.reject("PERMISSION_ERROR", "Failed to get SIM accounts due to permission issue.", e);
                    return;
                }


                if (accountHandles != null && !accountHandles.isEmpty()) {
                    PhoneAccountHandle selectedAccountHandle = null;
                    Log.d(TAG, "Available SIMs: " + accountHandles.size());
                    for(PhoneAccountHandle handle : accountHandles) {
                        Log.d(TAG, "SIM ID: " + handle.getId());
                    }


                    if ("sim1".equalsIgnoreCase(simPreference) && accountHandles.size() >= 1) {
                        selectedAccountHandle = accountHandles.get(0);
                        Log.d(TAG, "Attempting to use SIM1 (first in list).");
                    } else if ("sim2".equalsIgnoreCase(simPreference) && accountHandles.size() >= 2) {
                        selectedAccountHandle = accountHandles.get(1);
                        Log.d(TAG, "Attempting to use SIM2 (second in list).");
                    } else if ("default".equalsIgnoreCase(simPreference)) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) { // 22+
                            PhoneAccountHandle defaultHandle = telecomManager.getDefaultOutgoingPhoneAccount(Uri.parse("tel:").getScheme());
                            if (defaultHandle != null) {
                                selectedAccountHandle = defaultHandle;
                                Log.d(TAG, "Using system default outgoing phone account.");
                            } else if (!accountHandles.isEmpty()){
                                // Fallback if no explicit default is set by user, but SIMs are present
                                selectedAccountHandle = accountHandles.get(0);
                                Log.d(TAG, "No explicit default, falling back to first available SIM.");
                            }
                        } else if (!accountHandles.isEmpty()){
                            // Pre Lollipop MR1, just use the first one if "default" is requested
                            selectedAccountHandle = accountHandles.get(0);
                            Log.d(TAG, "Pre-Lollipop MR1, using first available SIM as default.");
                        }
                    } else {
                        Log.w(TAG, "Unknown simPreference or not enough SIMs: " + simPreference + ". Proceeding with system default.");
                        // If simPreference is something else or the specific SIM doesn't exist,
                        // we let the system decide (might show picker).
                    }

                    if (selectedAccountHandle != null) {
                        intent.putExtra(TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE, selectedAccountHandle);
                        Log.d(TAG, "Using PhoneAccountHandle: " + selectedAccountHandle.getId());
                    } else {
                        Log.w(TAG, "No specific SIM selected based on preference: " + simPreference + ". System will decide.");
                    }
                } else {
                    Log.w(TAG, "No call capable phone accounts found. System will decide.");
                }
            }
        } else {
            Log.i(TAG, "OS version < M, SIM selection via TelecomManager not supported. System will decide.");
        }

        try {
            this.reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error starting phone call: " + e.getMessage());
            promise.reject("CALL_FAILED", "Could not initiate phone call.", e);
        }
    }
}
