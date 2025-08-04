package com.swift.drop;

import android.net.wifi.p2p.WifiP2pConfig;
import android.net.wifi.p2p.WifiP2pDevice;
import android.net.wifi.p2p.WifiP2pDeviceList;
import android.net.wifi.p2p.WifiP2pManager;
import android.net.wifi.p2p.WifiP2pManager.Channel;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WifiP2P")
public class WifiP2PPlugin extends Plugin {
    private WifiP2pManager manager;
    private Channel channel;
    private boolean isDiscovering = false;
    
    @Override
    public void load() {
        manager = (WifiP2pManager) getSystemService(WifiP2pManager.class);
        channel = manager.initialize(getContext(), getMainLooper(), null);
    }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        if (manager != null && channel != null) {
            manager.discoverPeers(channel, new WifiP2pManager.ActionListener() {
                @Override
                public void onSuccess() {
                    isDiscovering = true;
                    call.success();
                }

                @Override
                public void onFailure(int reason) {
                    call.error("Failed to start discovery: " + reason);
                }
            });
        } else {
            call.error("WiFi P2P not initialized");
        }
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        if (manager != null && channel != null && isDiscovering) {
            manager.stopPeerDiscovery(channel, new WifiP2pManager.ActionListener() {
                @Override
                public void onSuccess() {
                    isDiscovering = false;
                    call.success();
                }

                @Override
                public void onFailure(int reason) {
                    call.error("Failed to stop discovery: " + reason);
                }
            });
        } else {
            call.success();
        }
    }

    @PluginMethod
    public void connectToDevice(PluginCall call) {
        String deviceAddress = call.getString("deviceAddress");
        if (manager != null && channel != null && deviceAddress != null) {
            WifiP2pConfig config = new WifiP2pConfig();
            config.deviceAddress = deviceAddress;
            manager.connect(channel, config, new WifiP2pManager.ActionListener() {
                @Override
                public void onSuccess() {
                    call.success();
                }

                @Override
                public void onFailure(int reason) {
                    call.error("Failed to connect: " + reason);
                }
            });
        } else {
            call.error("Invalid parameters");
        }
    }

    @PluginMethod
    public void getPeers(PluginCall call) {
        if (manager != null && channel != null) {
            manager.requestPeers(channel, new WifiP2pManager.PeerListListener() {
                @Override
                public void onPeersAvailable(WifiP2pDeviceList peers) {
                    JSObject result = new JSObject();
                    JSObject peersObj = new JSObject();
                    peersObj.put("peers", convertPeersToJSArray(peers));
                    result.put("value", peersObj);
                    call.success(result);
                }
            });
        } else {
            call.error("WiFi P2P not initialized");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (manager != null && channel != null) {
            manager.removeGroup(channel, new WifiP2pManager.ActionListener() {
                @Override
                public void onSuccess() {
                    call.success();
                }

                @Override
                public void onFailure(int reason) {
                    call.error("Failed to stop WiFi P2P: " + reason);
                }
            });
        } else {
            call.success();
        }
    }

    private JSObject convertPeersToJSArray(WifiP2pDeviceList peers) {
        JSObject result = new JSObject();
        for (WifiP2pDevice device : peers.getDeviceList()) {
            JSObject peer = new JSObject();
            peer.put("deviceAddress", device.deviceAddress);
            peer.put("deviceName", device.deviceName);
            peer.put("isGroupOwner", device.isGroupOwner());
            result.put(device.deviceAddress, peer);
        }
        return result;
    }
}
