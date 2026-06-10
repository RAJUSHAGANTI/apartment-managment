export type FlatType = '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'Penthouse' | 'Villa' | 'Studio';
export type ApartmentStatus = 'Occupied' | 'Vacant' | 'Under Maintenance';
export type Facing = 'North' | 'South' | 'East' | 'West' | 'NE' | 'NW' | 'SE' | 'SW';

export interface Block {
  id: number;
  name: string;
  description?: string;
  total_floors: number;
}

export interface Apartment {
  id: number;
  flat_number: string;
  block_id: number;
  block_name?: string;
  floor: number;
  flat_type: FlatType;
  area_sqft: number;
  facing?: Facing;
  status: ApartmentStatus;
  monthly_maintenance: number;
  description?: string;
  current_owners?: any[];
  current_tenant?: any;
  created_at: string;
}
