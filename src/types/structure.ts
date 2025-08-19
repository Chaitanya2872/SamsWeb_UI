export interface RatingComponent {
    rating?: number;
    condition_comment?: string;
    inspection_date?: string;
    photos?: string[];
    inspector_notes?: string;
  }
  
  export interface StructuralRating {
    beams?: RatingComponent;
    columns?: RatingComponent;
    slab?: RatingComponent;
    foundation?: RatingComponent;
    overall_average?: number;
    health_status?: 'Good' | 'Fair' | 'Poor' | 'Critical';
    assessment_date?: string;
  }
  
  export interface NonStructuralRating {
    brick_plaster?: RatingComponent;
    doors_windows?: RatingComponent;
    flooring_tiles?: RatingComponent;
    electrical_wiring?: RatingComponent;
    sanitary_fittings?: RatingComponent;
    railings?: RatingComponent;
    water_tanks?: RatingComponent;
    plumbing?: RatingComponent;
    sewage_system?: RatingComponent;
    panel_board?: RatingComponent;
    lifts?: RatingComponent;
    overall_average?: number;
    assessment_date?: string;
  }
  
  export interface FlatOverallRating {
    combined_score?: number;
    health_status?: 'Good' | 'Fair' | 'Poor' | 'Critical';
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    last_assessment_date?: string;
  }
  
  export interface Flat {
    flat_id: string;
    flat_number: string;
    flat_type: '1bhk' | '2bhk' | '3bhk' | '4bhk' | '5bhk' | 'studio' | 'duplex' | 'penthouse' | 'shop' | 'office' | 'parking_slot';
    area_sq_mts?: number;
    direction_facing: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
    occupancy_status: 'occupied' | 'vacant' | 'under_renovation' | 'locked';
    structural_rating?: StructuralRating;
    non_structural_rating?: NonStructuralRating;
    flat_overall_rating?: FlatOverallRating;
    flat_notes?: string;
    last_inspection_date?: string;
    has_structural_ratings?: boolean;
    has_non_structural_ratings?: boolean;
  }
  
  export interface Floor {
    floor_id: string;
    floor_number: number;
    floor_type: 'residential' | 'commercial' | 'mixed' | 'parking' | 'utility' | 'recreational';
    floor_height?: number;
    total_area_sq_mts?: number;
    floor_label_name: string;
    number_of_flats: number;
    flats: Flat[];
    floor_notes?: string;
  }
  
  export interface StructuralIdentity {
    uid: string;
    structural_identity_number?: string;
    zip_code?: string;
    state_code?: string;
    district_code?: string;
    city_name?: string;
    location_code?: string;
    structure_number?: string;
    type_of_structure: 'residential' | 'commercial' | 'educational' | 'hospital' | 'industrial';
    type_code?: string;
  }
  
  export interface Location {
    coordinates: {
      latitude?: number;
      longitude?: number;
    };
    address?: string;
    landmark?: string;
  }
  
  export interface Administration {
    client_name?: string;
    custodian?: string;
    engineer_designation?: string;
    contact_details?: string;
    email_id?: string;
    organization?: string;
  }
  
  export interface GeometricDetails {
    number_of_floors?: number;
    structure_height?: number;
    structure_width?: number;
    structure_length?: number;
    floors: Floor[];
    building_age?: number;
    construction_year?: number;
  }
  
  export interface Remark {
    _id?: string;
    text: string;
    author_name: string;
    author_role: 'FE' | 'VE';
    created_at: string;
    updated_at: string;
  }
  
  export interface Remarks {
    fe_remarks: Remark[];
    ve_remarks: Remark[];
    last_updated_by?: {
      role: 'FE' | 'VE';
      name: string;
      date: string;
    };
  }
  
  export interface CreationInfo {
    created_date: string;
    last_updated_date: string;
    version: number;
  }
  
  export interface Structure {
    _id: string;
    structural_identity: StructuralIdentity;
    location: Location;
    administration: Administration;
    geometric_details: GeometricDetails;
    status: 'draft' | 'location_completed' | 'admin_completed' | 'geometric_completed' | 
            'ratings_in_progress' | 'flat_ratings_completed' | 'submitted' | 'approved';
    general_notes?: string;
    remarks?: Remarks;
    creation_info: CreationInfo;
    // Dashboard specific fields
    progress?: {
      location: boolean;
      administrative: boolean;
      geometric_details: boolean;
      floors_added: boolean;
      flats_added: boolean;
      flat_ratings_completed: boolean;
      overall_percentage: number;
    };
    statistics?: {
      total_floors: number;
      total_flats: number;
      rated_flats: number;
      pending_ratings: number;
      critical_issues: number;
      high_priority_issues: number;
    };
    health_summary?: {
      overall_health_score?: number;
      structural_health?: number;
      non_structural_health?: number;
      priority_level?: string;
      last_assessment_date?: string;
    };
  }
  
  export interface StructuresResponse {
    success: boolean;
    message: string;
    data: {
      structures: Structure[];
      pagination: {
        current_page: number;
        per_page: number;
        total_items: number;
        total_pages: number;
        has_next_page: boolean;
        has_prev_page: boolean;
      };
      filters: {
        status: string;
        search: string;
        sort_by: string;
        sort_order: string;
      };
      summary: {
        total_structures: number;
        by_status: Record<string, number>;
      };
    };
  }
  
  export interface AddRemarkRequest {
    text: string;
  }
  
  export interface UpdateRemarkRequest {
    text: string;
  }
  
  export interface RemarksResponse {
    success: boolean;
    message: string;
    data: {
      structure_id: string;
      fe_remarks: Remark[];
      ve_remarks: Remark[];
      total_fe_remarks: number;
      total_ve_remarks: number;
      last_updated_by: {
        role: 'FE' | 'VE';
        name: string;
        date: string;
      };
      user_role: 'FE' | 'VE';
      can_add_remarks: boolean;
      can_edit_own_remarks: boolean;
    };
  }