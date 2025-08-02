'use client';

export interface FileTransferProgress {
  fileId: string;
  fileName: string;
  progress: number;
  speed: number;
  timeRemaining: number;
}

export interface TransferPeer {
  id: string;
  name: string;
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}

class TransferEngine {
  private static instance: TransferEngine;
  private peers: Map<string, TransferPeer> = new Map();
  private localId: string = Math.random().toString(36).substr(2, 9);
  private onProgressCallback?: (progress: FileTransferProgress) => void;
  private onPeerDiscoveredCallback?: (peer: { id: string; name: string }) => void;
  private onFileReceivedCallback?: (file: File) => void;

  static getInstance(): TransferEngine {
    if (!TransferEngine.instance) {
      TransferEngine.instance = new TransferEngine();
    }
    return TransferEngine.instance;
  }

  setProgressCallback(callback: (progress: FileTransferProgress) => void) {
    this.onProgressCallback = callback;
  }

  setPeerDiscoveredCallback(callback: (peer: { id: string; name: string }) => void) {
    this.onPeerDiscoveredCallback = callback;
  }

  setFileReceivedCallback(callback: (file: File) => void) {
    this.onFileReceivedCallback = callback;
  }

  async createConnection(isInitiator: boolean = false): Promise<RTCPeerConnection> {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);

    if (isInitiator) {
      const dataChannel = peerConnection.createDataChannel('fileTransfer', {
        ordered: true
      });
      this.setupDataChannel(dataChannel);
    } else {
      peerConnection.ondatachannel = (event) => {
        this.setupDataChannel(event.channel);
      };
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, you'd send this to the remote peer via signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };

    return peerConnection;
  }

  private setupDataChannel(dataChannel: RTCDataChannel) {
    dataChannel.binaryType = 'arraybuffer';
    
    dataChannel.onopen = () => {
      console.log('Data channel opened');
    };

    dataChannel.onmessage = (event) => {
      this.handleIncomingData(event.data);
    };

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
  }

  private receivedFiles: Map<string, {
    name: string;
    size: number;
    type: string;
    chunks: ArrayBuffer[];
    receivedBytes: number;
  }> = new Map();

  private handleIncomingData(data: any) {
    try {
      if (typeof data === 'string') {
        const message = JSON.parse(data);
        
        if (message.type === 'fileStart') {
          this.receivedFiles.set(message.fileId, {
            name: message.fileName,
            size: message.fileSize,
            type: message.fileType,
            chunks: [],
            receivedBytes: 0
          });
        } else if (message.type === 'fileEnd') {
          this.assembleReceivedFile(message.fileId);
        }
      } else if (data instanceof ArrayBuffer) {
        // This is file chunk data
        const view = new DataView(data);
        const fileIdLength = view.getUint32(0);
        const fileId = new TextDecoder().decode(data.slice(4, 4 + fileIdLength));
        const chunkData = data.slice(4 + fileIdLength);
        
        const fileInfo = this.receivedFiles.get(fileId);
        if (fileInfo) {
          fileInfo.chunks.push(chunkData);
          fileInfo.receivedBytes += chunkData.byteLength;
          
          // Update progress
          const progress = (fileInfo.receivedBytes / fileInfo.size) * 100;
          this.onProgressCallback?.({
            fileId,
            fileName: fileInfo.name,
            progress,
            speed: 0, // Calculate based on time
            timeRemaining: 0
          });
        }
      }
    } catch (error) {
      console.error('Error handling incoming data:', error);
    }
  }

  private assembleReceivedFile(fileId: string) {
    const fileInfo = this.receivedFiles.get(fileId);
    if (!fileInfo) return;

    const blob = new Blob(fileInfo.chunks, { type: fileInfo.type });
    const file = new File([blob], fileInfo.name, { type: fileInfo.type });
    
    this.onFileReceivedCallback?.(file);
    this.receivedFiles.delete(fileId);
  }

  async sendFile(file: File, peerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.dataChannel) {
      throw new Error('Peer not connected');
    }

    const fileId = Math.random().toString(36).substr(2, 9);
    const chunkSize = 16384; // 16KB chunks
    
    // Send file metadata
    const startMessage = {
      type: 'fileStart',
      fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
    
    peer.dataChannel.send(JSON.stringify(startMessage));

    // Send file in chunks
    let offset = 0;
    const startTime = Date.now();
    
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      const arrayBuffer = await chunk.arrayBuffer();
      
      // Prepend file ID to chunk
      const fileIdBytes = new TextEncoder().encode(fileId);
      const chunkWithId = new ArrayBuffer(4 + fileIdBytes.length + arrayBuffer.byteLength);
      const view = new DataView(chunkWithId);
      
      view.setUint32(0, fileIdBytes.length);
      new Uint8Array(chunkWithId, 4, fileIdBytes.length).set(fileIdBytes);
      new Uint8Array(chunkWithId, 4 + fileIdBytes.length).set(new Uint8Array(arrayBuffer));
      
      peer.dataChannel.send(chunkWithId);
      
      offset += chunkSize;
      
      // Update progress
      const progress = (offset / file.size) * 100;
      const elapsed = Date.now() - startTime;
      const speed = offset / (elapsed / 1000); // bytes per second
      const timeRemaining = (file.size - offset) / speed;
      
      this.onProgressCallback?.({
        fileId,
        fileName: file.name,
        progress,
        speed,
        timeRemaining
      });
      
      // Add small delay to prevent overwhelming the data channel
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    // Send end message
    const endMessage = {
      type: 'fileEnd',
      fileId
    };
    
    peer.dataChannel.send(JSON.stringify(endMessage));
  }

  async sendMultipleFiles(files: File[], peerId: string): Promise<void> {
    for (const file of files) {
      await this.sendFile(file, peerId);
    }
  }

  // Simulate device discovery (in real app, this would use Bluetooth/WiFi Direct)
  async startDeviceDiscovery(): Promise<void> {
    // Simulate finding devices
    setTimeout(() => {
      this.onPeerDiscoveredCallback?.({
        id: 'device1',
        name: 'iPhone 13'
      });
    }, 1000);

    setTimeout(() => {
      this.onPeerDiscoveredCallback?.({
        id: 'device2',
        name: 'Galaxy S21'
      });
    }, 2000);
  }

  async connectToPeer(peerId: string, peerName: string): Promise<void> {
    const peerConnection = await this.createConnection(true);
    
    this.peers.set(peerId, {
      id: peerId,
      name: peerName,
      connection: peerConnection
    });

    // In a real app, you'd handle signaling here
    console.log('Connected to peer:', peerName);
  }

  downloadFile(file: File) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getLocalId(): string {
    return this.localId;
  }

  getPeers(): TransferPeer[] {
    return Array.from(this.peers.values());
  }
}

export default TransferEngine;
