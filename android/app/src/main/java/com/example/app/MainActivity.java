package com.example.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.swift.drop.WifiP2PPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register the WiFi P2P plugin
        registerPlugin(WifiP2PPlugin.class);
    }
}
