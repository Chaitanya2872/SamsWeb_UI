export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    details?: string[];
  }
  
  export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  }
  
  export interface ApiError {
    success: false;
    error: string;
    details?: string[];
    statusCode?: number;
  }
  