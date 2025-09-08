// src/types/media.ts (ou você pode definir no mesmo arquivo do componente)

export interface IMediaFile {
  /**
   * The relative path or identifier for the file.
   * This will be passed to `getPublicFileUrl` to construct the full URL.
   * Corresponds to `file.urlRelativo` from your original data.
   */
  url: string;
  /**
   * The file extension (e.g., 'jpg', 'mp4').
   * Corresponds to `file.extensao` from your original data.
   */
  extension: string;
  /**
   * Optional: A user-friendly name for the file.
   * Useful for accessibility or display.
   */
  fileName?: string;
  /**
   * Optional: A description of the file.
   * Useful for `alt` attributes on images or captions.
   */
  description?: string;
  /**
   * Optional: For video files, a specific URL for a thumbnail image.
   * If not provided, the component will try to use the video's first frame.
   */
  thumbnailUrl?: string;
  // Adicione outras propriedades se necessário para seu caso de uso, por exemplo:
  // size?: number; // File size in bytes
  // uploadDate?: string; // Date of upload
}
