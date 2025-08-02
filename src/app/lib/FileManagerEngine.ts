import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

class FileManagerEngine {
  async readFile(filePath: string) {
    try {
      const contents = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return contents.data;
    } catch (error) {
      console.error('Unable to read file:', error);
      throw error;
    }
  }

  async writeFile(filePath: string, data: string) {
    try {
      await Filesystem.writeFile({
        path: filePath,
        data: data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true,
      });
    } catch (error) {
      console.error('Unable to write file:', error);
      throw error;
    }
  }

  async deleteFile(filePath: string) {
    try {
      await Filesystem.deleteFile({
        path: filePath,
        directory: Directory.Documents,
      });
    } catch (error) {
      console.error('Unable to delete file:', error);
      throw error;
    }
  }

  async listFiles(directoryPath: string) {
    try {
      const directoryContents = await Filesystem.readdir({
        path: directoryPath,
        directory: Directory.Documents,
      });
      return directoryContents.files;
    } catch (error) {
      console.error('Unable to list files:', error);
      throw error;
    }
  }

  async mkdir(directoryPath: string) {
    try {
      await Filesystem.mkdir({
        path: directoryPath,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch (error) {
      console.error('Unable to create directory:', error);
      throw error;
    }
  }
}

export default new FileManagerEngine();

