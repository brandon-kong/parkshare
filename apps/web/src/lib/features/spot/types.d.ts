export type SpotType = "driveway" | "garage" | "lot" | "street"
export type VehicleSize = "compact" | "standard" | "large" | "oversized"
export type SpotStatus = "draft" | "active" | "paused" | "deleted"

export interface Spot {
    id: string
    host_id: string
    title: string
    description: string
    address: string
    city: string
    state: string
    postal_code: string
    country: string
    latitude: number
    longitude: number
    spot_type: SpotType
    vehicle_size: VehicleSize
    is_covered: boolean
    has_ev_charging: boolean
    has_security: boolean
    access_instructions?: string
    hourly_rate?: number
    daily_rate?: number
    monthly_rate?: number
    status: SpotStatus
    created_at: string
    updated_at: string
}

export interface CreateSpotInput {
    title: string
    description?: string
    address: string
    city: string
    state?: string
    postal_code?: string
    country?: string
    latitude: number
    longitude: number
    spot_type: SpotType
    vehicle_size: VehicleSize
    is_covered?: boolean
    has_ev_charging?: boolean
    has_security?: boolean
    access_instructions?: string
    hourly_rate?: number
    daily_rate?: number
    monthly_rate?: number
}

export interface UpdateSpotInput {
    title?: string
    description?: string
    status?: SpotStatus
    hourly_rate?: number
    daily_rate?: number
    monthly_rate?: number
}