package com.swift.drop

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.net.wifi.p2p.WifiP2pConfig
import android.net.wifi.p2p.WifiP2pDevice
import android.net.wifi.p2p.WifiP2pDeviceList
import android.net.wifi.p2p.WifiP2pManager
import android.net.wifi.p2p.WifiP2pManager.Channel
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.content.FileProvider
import com.getcapacitor.JSObject
import com.getcapacitor.NativePlugin
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import java.io.*
import java.math.BigDecimal
import java.math.RoundingMode
import java.net.*
import java.nio.channels.FileChannel
import java.nio.channels.SocketChannel
import java.util.*
import java.util.concurrent.Executors

@NativePlugin()
class WifiP2PPlugin : Plugin() {
    private val TAG = "WifiP2PPlugin"
    private var manager: WifiP2pManager? = null
    private var channel: Channel? = null
    private var receiver: BroadcastReceiver? = null
    private var discoveredDevices = mutableListOf<WifiP2pDevice>()
    private var serverSocket: ServerSocket? = null
    private var clientSocket: Socket? = null
    private var handler: Handler? = null
    private var isGroupOwner = false
    private var downloadDir: File? = null
    private val executor = Executors.newSingleThreadExecutor()
    
    private fun setupDownloadDirectory() {
        val context = requireActivity().applicationContext
        downloadDir = File(context.getExternalFilesDir(null), "SwiftDrop")
        if (!downloadDir!!.exists()) {
            downloadDir!!.mkdirs()
        }
        // Initialize FileProvider
        val fileProvider = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            File(".")
        )
    }

    init {
        setupDownloadDirectory()
        // Initialize FileProvider
        val fileProvider = FileProvider.getUriForFile(
            requireActivity().applicationContext,
            "${requireActivity().applicationContext.packageName}.fileprovider",
            File(".")
        )
    }

    private fun setupDownloadDirectory() {
        val context = context
        downloadDir = File(context.getExternalFilesDir(null), "SwiftDrop")
        if (!downloadDir!!.exists()) {
            downloadDir!!.mkdirs()
        }
    }

    override fun load() {
        manager = context.getSystemService(Context.WIFI_P2P_SERVICE) as WifiP2pManager?
        channel = manager?.initialize(context, context.mainLooper, null)
        handler = Handler(Looper.getMainLooper())
        initializeReceiver()
    }

    private fun initializeReceiver() {
        receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                intent?.let { intent ->
                    when (intent.action) {
                        WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION -> {
                            val state = intent.getIntExtra(WifiP2pManager.EXTRA_WIFI_STATE, -1)
                            if (state == WifiP2pManager.WIFI_P2P_STATE_ENABLED) {
                                Log.d(TAG, "WiFi P2P is enabled")
                                notifyDeviceList()
                            } else {
                                Log.d(TAG, "WiFi P2P is disabled")
                                notifyDeviceList()
                            }
                        }
                        WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION -> {
                            manager?.requestPeers(channel) { peers ->
                                discoveredDevices.clear()
                                discoveredDevices.addAll(peers.deviceList)
                                notifyDeviceList()
                            }
                        }
                        WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION -> {
                            manager?.requestConnectionInfo(channel) { info ->
                                isGroupOwner = info.isGroupOwner
                                notifyConnectionSuccess(info.isGroupOwner)
                                if (info.groupFormed) {
                                    if (info.isGroupOwner) {
                                        startServer()
                                    } else {
                                        startClient(info.groupOwnerAddress.hostAddress)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    @PluginMethod()
    fun startDiscovery(call: PluginCall) {
        manager?.discoverPeers(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                call.success()
            }

            override fun onFailure(reason: Int) {
                call.error("Discovery failed: $reason")
            }
        })
    }

    @PluginMethod()
    fun stopDiscovery(call: PluginCall) {
        manager?.stopPeerDiscovery(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                call.success()
            }

            override fun onFailure(reason: Int) {
                call.error("Failed to stop discovery: $reason")
            }
        })
    }

    @PluginMethod()
    fun connectToDevice(call: PluginCall) {
        val deviceAddress = call.getString("deviceAddress")
        manager?.let { manager ->
            channel?.let { channel ->
                val config = WifiP2pConfig().apply {
                    deviceAddress = deviceAddress
                    wps.setup = WifiP2pConfig.WPS_PBC
                }
                manager.connect(channel, config, object : WifiP2pManager.ActionListener {
                    override fun onSuccess() {
                        call.success()
                    }

                    override fun onFailure(reason: Int) {
                        call.error("Connection failed: $reason")
                    }
                })
            }
        }
    }

    @PluginMethod()
    fun sendFile(call: PluginCall) {
        val filePath = call.getString("filePath")
        val file = File(filePath)
        if (!file.exists()) {
            call.error("File not found")
            return
        }

        try {
            val socket = Socket()
            socket.connect(InetSocketAddress("192.168.49.1", 8888), 5000)
            
            // Send file name and size
            val outputStream = socket.getOutputStream()
            val fileName = file.name
            val fileSize = file.length()
            
            outputStream.write(fileName.toByteArray())
            outputStream.write(fileSize.toString().toByteArray())
            
            // Send file content
            val fileInputStream = FileInputStream(file)
            val fileChannel = fileInputStream.channel
            val socketChannel = socket.getChannel()
            
            val buffer = ByteArray(1024)
            var bytesTransferred = 0L
            var totalBytes = fileSize
            
            while (bytesTransferred < totalBytes) {
                val bytes = fileChannel.transferTo(
                    bytesTransferred,
                    Math.min(1024, totalBytes - bytesTransferred),
                    socketChannel
                )
                bytesTransferred += bytes
                val progress = (bytesTransferred * 100 / totalBytes).toInt()
                notifyTransferProgress(progress)
            }
            
            fileInputStream.close()
            socket.close()
            
            call.success()
        } catch (e: Exception) {
            call.error("Error sending file: ${e.message}")
        }
    }

    @PluginMethod()
    fun receiveFile(call: PluginCall) {
        try {
            val serverSocket = ServerSocket(8888)
            val socket = serverSocket.accept()
            
            // Read file name and size
            val inputStream = socket.getInputStream()
            val fileName = String(inputStream.readBytes())
            val fileSize = String(inputStream.readBytes()).toLong()
            
            // Save file to SwiftDrop directory
            val outputFile = File(downloadDir, fileName)
            val fileOutputStream = FileOutputStream(outputFile)
            val fileChannel = fileOutputStream.channel
            val socketChannel = socket.channel()
            
            val buffer = ByteArray(1024)
            var bytesTransferred = 0L
            var totalBytes = fileSize
            
            while (bytesTransferred < totalBytes) {
                val bytes = fileChannel.transferFrom(
                    socketChannel,
                    bytesTransferred,
                    Math.min(1024, totalBytes - bytesTransferred)
                )
                bytesTransferred += bytes
                val progress = (bytesTransferred * 100 / totalBytes).toInt()
                notifyTransferProgress(progress)
            }
            
            fileOutputStream.close()
            socket.close()
            serverSocket.close()
            
            notifyTransferComplete(outputFile.absolutePath)
            call.success()
        } catch (e: Exception) {
            call.error("Error receiving file: ${e.message}")
        }
    }

    @PluginMethod()
    fun getDiscoveredDevices(call: PluginCall) {
        val devices = JSObject()
        val deviceList = mutableListOf<JSObject>()
        discoveredDevices.forEach { device ->
            val deviceObj = JSObject()
            deviceObj.put("deviceAddress", device.deviceAddress)
            deviceObj.put("deviceName", device.deviceName)
            deviceObj.put("status", device.status)
            deviceList.add(deviceObj)
        }
        devices.put("devices", deviceList)
        call.success(devices)
    }

    private fun notifyDeviceList() {
        val devices = JSObject()
        val deviceList = mutableListOf<JSObject>()
        discoveredDevices.forEach { device ->
            val deviceObj = JSObject()
            deviceObj.put("deviceAddress", device.deviceAddress)
            deviceObj.put("deviceName", device.deviceName)
            deviceObj.put("status", device.status)
            deviceList.add(deviceObj)
        }
        devices.put("devices", deviceList)
        notifyListeners("deviceDiscovered", devices)
    }

    private fun notifyConnectionSuccess(isGroupOwner: Boolean) {
        val data = JSObject()
        data.put("isGroupOwner", isGroupOwner)
        notifyListeners("connectionSuccess", data)
    }

    private fun notifyTransferProgress(progress: Int) {
        val data = JSObject()
        data.put("progress", progress)
        notifyListeners("transferProgress", data)
    }

    private fun notifyTransferComplete(filePath: String) {
        val data = JSObject()
        data.put("filePath", filePath)
        notifyListeners("transferComplete", data)
        Log.d(TAG, "Transfer complete notification sent for: $filePath")
    }

    private fun notifyTransferFailed(reason: String) {
        val data = JSObject()
        data.put("reason", reason)
        notifyListeners("transferFailed", data)
        Log.e(TAG, "Transfer failed notification sent: $reason")
    }

    private fun notifyError(message: String, error: Throwable? = null) {
        val data = JSObject()
        data.put("message", message)
        error?.let { 
            data.put("error", it.message ?: "Unknown error")
            Log.e(TAG, "Error: $message", it)
        }
        notifyListeners("error", data)
    }

    private fun validateFile(file: File): Boolean {
        return try {
            if (!file.exists()) {
                notifyError("File does not exist: ${file.path}")
                return false
            }
            if (!file.canRead()) {
                notifyError("Cannot read file: ${file.path}")
                return false
            }
            if (file.length() == 0L) {
                notifyError("File is empty: ${file.path}")
                return false
            }
            true
        } catch (e: Exception) {
            notifyError("Error validating file: ${file.path}", e)
            false
        }
    }

    private fun startServer() {
        Thread {
            try {
                Log.d(TAG, "Starting server on port 8888")
                serverSocket = ServerSocket(8888)
                while (true) {
                    try {
                        val socket = serverSocket?.accept()
                        if (socket != null) {
                            Log.d(TAG, "Accepted connection from ${socket.inetAddress.hostAddress}")
                            handleFileTransfer(socket)
                        }
                    } catch (e: SocketTimeoutException) {
                        Log.w(TAG, "Socket timeout occurred", e)
                        continue
                    } catch (e: IOException) {
                        Log.e(TAG, "Error accepting connection", e)
                        break
                    }
                }
            } catch (e: IOException) {
                Log.e(TAG, "Server socket error: ${e.message}", e)
                notifyTransferFailed("Server error: ${e.message}")
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected server error: ${e.message}", e)
                notifyTransferFailed("Unexpected server error: ${e.message}")
            } finally {
                try {
                    serverSocket?.close()
                } catch (e: IOException) {
                    Log.w(TAG, "Error closing server socket", e)
                }
            }
        }.start()
    }

    private fun startClient(host: String) {
        Thread {
            try {
                Log.d(TAG, "Attempting to connect to $host:8888")
                val socket = Socket()
                socket.connect(InetSocketAddress(host, 8888), 5000)
                Log.d(TAG, "Connected to $host")
                handleFileTransfer(socket)
            } catch (e: ConnectException) {
                Log.e(TAG, "Connection refused: ${e.message}")
                notifyTransferFailed("Connection refused to $host")
            } catch (e: SocketTimeoutException) {
                Log.e(TAG, "Connection timeout: ${e.message}")
                notifyTransferFailed("Connection timeout to $host")
            } catch (e: IOException) {
                Log.e(TAG, "Client socket error: ${e.message}", e)
                notifyTransferFailed("Client error: ${e.message}")
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected client error: ${e.message}", e)
                notifyTransferFailed("Unexpected client error: ${e.message}")
            }
        }.start()
    }

    private fun handleFileTransfer(socket: Socket) {
        try {
            // Read file metadata
            val inputStream = socket.getInputStream()
            val fileName = String(inputStream.readBytes())
            val fileSize = String(inputStream.readBytes()).toLong()
            
            Log.d(TAG, "Starting file transfer: $fileName (${formatFileSize(fileSize)})")
            
            // Validate file size
            if (fileSize <= 0) {
                throw IOException("Invalid file size received")
            }
            
            // Check storage space
            val availableSpace = getAvailableStorage()
            if (availableSpace < fileSize) {
                throw IOException("Not enough storage space")
            }
            
            // Create output file
            val outputFile = File(downloadDir, fileName)
            if (outputFile.exists()) {
                Log.w(TAG, "File already exists, overwriting: $fileName")
                outputFile.delete()
            }
            
            // Setup file transfer
            val fileOutputStream = FileOutputStream(outputFile)
            val fileChannel = fileOutputStream.channel
            val socketChannel = socket.channel()
            
            // Transfer file in chunks
            val buffer = ByteArray(1024)
            var bytesTransferred = 0L
            var totalBytes = fileSize
            var lastProgress = 0
            
            while (bytesTransferred < totalBytes) {
                val bytes = fileChannel.transferFrom(
                    socketChannel,
                    bytesTransferred,
                    Math.min(1024, totalBytes - bytesTransferred)
                )
                
                if (bytes <= 0) {
                    throw IOException("Transfer interrupted")
                }
                
                bytesTransferred += bytes
                val progress = (bytesTransferred * 100 / totalBytes).toInt()
                
                // Only notify progress if it has changed significantly
                if (progress - lastProgress >= 5) {  // Notify every 5% change
                    lastProgress = progress
                    notifyTransferProgress(progress)
                    Log.d(TAG, "Transfer progress: $progress%")
                }
            }
            
            // Finalize transfer
            fileOutputStream.close()
            socket.close()
            
            // Verify file integrity
            val actualSize = outputFile.length()
            if (actualSize != fileSize) {
                throw IOException("File size mismatch: Expected $fileSize, got $actualSize")
            }
            
            Log.d(TAG, "File transfer completed successfully: $fileName")
            
            // Handle APK installation
            if (fileName.endsWith(".apk")) {
                val intent = Intent(Intent.ACTION_VIEW)
                intent.setDataAndType(
                    FileProvider.getUriForFile(
                        requireActivity().applicationContext,
                        "${requireActivity().applicationContext.packageName}.fileprovider",
                        outputFile
                    ),
                    "application/vnd.android.package-archive"
                )
                intent.flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                requireActivity().applicationContext.startActivity(intent)
                Log.d(TAG, "Attempting to install APK: $fileName")
            }
            
            notifyTransferComplete(outputFile.absolutePath)
            
        } catch (e: IOException) {
            Log.e(TAG, "File transfer error: ${e.message}", e)
            notifyTransferFailed("File transfer failed: ${e.message}")
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error during transfer: ${e.message}", e)
            notifyTransferFailed("Unexpected error: ${e.message}")
        } finally {
            // Clean up resources
            try {
                fileOutputStream?.close()
                socket?.close()
            } catch (e: IOException) {
                Log.w(TAG, "Error closing resources: ${e.message}")
            }
        }
    }

    private fun formatFileSize(bytes: Long): String {
        val units = arrayOf("B", "KB", "MB", "GB")
        val log = Math.log(bytes.toDouble()) / Math.log(1024.0)
        val index = Math.floor(log).toInt()
        return if (index >= units.size) {
            "${bytes}B"
        } else {
            val size = BigDecimal(bytes.toDouble() / Math.pow(1024.0, index.toDouble()))
                .setScale(2, RoundingMode.HALF_UP)
                .toDouble()
            "${size}${units[index]}"
        }
    }

    private fun getAvailableStorage(): Long {
        try {
            val stat = StatFs(requireActivity().applicationContext.getExternalFilesDir(null)?.path)
            return stat.availableBytes
        } catch (e: Exception) {
            Log.w(TAG, "Error getting storage info: ${e.message}")
            return 0L
        }
    }
}
