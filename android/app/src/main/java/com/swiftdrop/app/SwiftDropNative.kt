package com.swiftdrop.app

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.content.Context
import android.content.pm.PackageManager
import android.net.wifi.p2p.WifiP2pConfig
import android.net.wifi.p2p.WifiP2pInfo
import android.net.wifi.p2p.WifiP2pManager
import android.net.wifi.p2p.WifiP2pManager.ActionListener
import android.net.wifi.p2p.WifiP2pManager.Channel
import android.net.wifi.p2p.WifiP2pManager.PeerListListener
import android.os.Build
import android.os.Environment
import androidx.annotation.RequiresApi
import androidx.core.app.ActivityCompat
import com.getcapacitor.Bridge
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.nio.channels.FileChannel

@CapacitorPlugin(name = "SwiftDropNative")
class SwiftDropNative : Plugin() {

    private var bluetoothAdapter: BluetoothAdapter? = null
    private lateinit var wifiP2pManager: WifiP2pManager
    private lateinit var channel: Channel

    override fun load() {
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
        wifiP2pManager = context.getSystemService(Context.WIFI_P2P_SERVICE) as WifiP2pManager
        channel = wifiP2pManager.initialize(context, mainLooper, null)
    }

    @PluginMethod
    fun startBluetoothDiscovery(call: PluginCall) {
        if (bluetoothAdapter?.isDiscovering == true) {
            bluetoothAdapter?.cancelDiscovery()
        }

        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
            call.reject("Permission denied")
            return
        }

        bluetoothAdapter?.startDiscovery()
        call.resolve(JSObject().put("started", true))
    }

    @PluginMethod
    fun stopBluetoothDiscovery(call: PluginCall) {
        bluetoothAdapter?.cancelDiscovery()
        call.resolve(JSObject().put("stopped", true))
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    @PluginMethod
    fun startWifiDirectDiscovery(call: PluginCall) {
        wifiP2pManager.discoverPeers(channel, object : ActionListener {
            override fun onSuccess() {
                call.resolve(JSObject().put("started", true))
            }

            override fun onFailure(reason: Int) {
                call.reject("Failed to start discovery: $reason")
            }
        })
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    @PluginMethod
    fun stopWifiDirectDiscovery(call: PluginCall) {
        wifiP2pManager.stopPeerDiscovery(channel, object : ActionListener {
            override fun onSuccess() {
                call.resolve(JSObject().put("stopped", true))
            }

            override fun onFailure(reason: Int) {
                call.reject("Failed to stop discovery: $reason")
            }
        })
    }

    @PluginMethod
    fun sendFile(call: PluginCall) {
        val filePath = call.getString("filePath")
        val fileName = call.getString("fileName")
        val deviceAddress = call.getString("deviceAddress")

        if (filePath == null || fileName == null || deviceAddress == null) {
            call.reject("Invalid parameters")
            return
        }

        GlobalScope.launch(Dispatchers.IO) {
            try {
                val file = File(filePath)
                val bluetoothDevice = bluetoothAdapter?.getRemoteDevice(deviceAddress)

                if (bluetoothDevice != null) {
                    // Implement Bluetooth file send here
                }

                val wifiConfig = WifiP2pConfig()
                wifiConfig.deviceAddress = deviceAddress

                wifiP2pManager.connect(channel, wifiConfig, object : ActionListener {
                    override fun onSuccess() {
                        val outputFile = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), fileName)
                        copyFile(file, outputFile)
                        call.resolve(JSObject().put("success", true).put("fileId", fileName))
                    }

                    override fun onFailure(reason: Int) {
                        call.reject("Connection failed: $reason")
                    }
                })

            } catch (e: Exception) {
                call.reject("File transfer failed", e)
            }
        }
    }

    private fun copyFile(src: File, dst: File) {
        FileInputStream(src).use { inputStream -
            FileOutputStream(dst).use { outputStream -
                val srcChannel: FileChannel = inputStream.channel
                val dstChannel: FileChannel = outputStream.channel
                srcChannel.transferTo(0, srcChannel.size(), dstChannel)
            }
        }
    }
}
