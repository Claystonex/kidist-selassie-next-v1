// Type definitions for @vimeo/vimeo
declare module '@vimeo/vimeo' {
  export interface VimeoRequestOptions {
    method: string;
    path: string;
    query?: Record<string, any>;
    headers?: Record<string, string>;
    body?: any;
  }

  export interface VimeoError {
    message: string;
    error: string;
    status: number;
    [key: string]: any;
  }

  export interface VimeoResponse {
    [key: string]: any;
  }

  export type VimeoCallback = (error: VimeoError | null, response: VimeoResponse, statusCode?: number) => void;

  export class Vimeo {
    constructor(clientId: string, clientSecret: string, accessToken: string | null);
    
    request(options: VimeoRequestOptions, callback: VimeoCallback): void;
    request(path: string, callback: VimeoCallback): void;
    
    generateClientCredentials(scope: string | string[], callback: (error: VimeoError | null, token: string) => void): void;
    
    setAccessToken(accessToken: string): void;
    
    uploadVideo(filePath: string, options: any, callback: VimeoCallback): void;
    uploadVideo(filePath: string, callback: VimeoCallback): void;
    
    streamingUpload(filePath: string, options: any, callback: VimeoCallback): void;
    streamingUpload(filePath: string, callback: VimeoCallback): void;
    
    handleUploadRedirect(uploadUrl: string, redirectUrl: string, callback: VimeoCallback): void;
    
    replaceVideo(filePath: string, videoUri: string, options: any, callback: VimeoCallback): void;
    replaceVideo(filePath: string, videoUri: string, callback: VimeoCallback): void;
  }

  const _default: {
    Vimeo: typeof Vimeo;
  };

  export default _default;
}
