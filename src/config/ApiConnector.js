import { API_CONFIG } from './api';

class ApiConnector {
  static workingUrl = null;
  
  static async findWorkingUrl() {
    const testUrls = [
      'https://server-mocha-nu.vercel.app', // Production Vercel URL
      'http://10.0.2.2:3000', // Android emulator
      'http://localhost:3000', // iOS simulator  
      'http://192.168.0.103:3000', // Network IP
      'http://127.0.0.1:3000', // Local host
    ];

    for (const baseUrl of testUrls) {
      try {
        console.log(`Testing connection to: ${baseUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${baseUrl}/fields`, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Working URL found: ${baseUrl}`);
          this.workingUrl = baseUrl;
          return baseUrl;
        }
      } catch (error) {
        console.log(`❌ Failed to connect to: ${baseUrl} - ${error.message}`);
      }
    }
    
    console.log('⚠️ No working URL found, falling back to default');
    return API_CONFIG.BASE_URL;
  }

  static async makeRequest(endpoint, options = {}) {
    if (!this.workingUrl) {
      this.workingUrl = await this.findWorkingUrl();
    }
    
    const url = `${this.workingUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;
    console.log(`Making request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      // For GET requests that expect JSON data, return the parsed JSON
      if (options.method !== 'POST' && response.ok) {
        return await response.json();
      }
      
      // For POST requests or error responses, return the response object
      return response;
    } catch (error) {
      console.error(`Request failed to ${url}:`, error);
      // Reset working URL and try to find a new one
      this.workingUrl = null;
      throw error;
    }
  }
}

export default ApiConnector;