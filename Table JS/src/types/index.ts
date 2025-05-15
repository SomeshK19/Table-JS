import { Pagination } from '@mui/material';
// types.ts

export interface Column {
    id: string;
    label: string;
    sortable?: boolean;
    trueValue?:boolean
    filterable?: boolean;
    filterType?: 'text' | 'checkbox' | 'date' | 'number' | null;
    groupHeader?: string;
    groupBy?: boolean;
    type?: string | Date; // Optional type for 'date' or other specific types
    onClick?: boolean;
    tooltip?: boolean; // Indicates if tooltip is enabled for this column
    tooltipFields?: Array<{
        id: string; // Field ID to fetch data from the row
        label: string; // Label to display in the tooltip
    }>; // Array of fields to show in the tooltip
}

export interface Settings {
    groupHeader?: boolean;
    displayCount?: number;
    pagination?: boolean;
    rowsPerPage?: number | null;
    allowedPagination?: number[];
    columnConfiguration?: boolean;
    groupBy?: boolean;
    rowCheckbox?: boolean;
    uniqueKey?: string;
    columns?: Column[];
    isEdit?: boolean;
    isDelete?: boolean;
    group?:string;
    isAdd?: boolean;
    isRemove?: boolean;
    isDownload?: boolean;
}

export interface Row {
    [key: string]: any;
}

export interface VehicleInfo {
    obu_id: string;
    vin_number: string;
    regn_number: string;
    vehicle_type: string;
    user_id: number;
    user_role: number;
    valid_from: string;
    valid_to: string;
    nomenclature_key: string;
    current_info: {
        obu_id: string;
        vin: string;
        last_time_stamp: string;
        latitude: number;
        longitude: number;
        heading: number;
        ignition_status: string;
        motor_speed: number;
        vehicle_speed: number;
        odo_meter: number;
        soc_status: number;
        vehicle_status: number;
        veh_status: string;
        current_location: string;
        last_fully_charged_time: string;
        last_charged_days: string;
    };
}
export interface summaryInfo {
    regno: string;
    vin: string;
    obu_id: string;
    model: string;
    vehicle_type: string;
    group_name: string | null;
    valid_from: string;
    valid_to: string;
    sub_expire_in_days: number;
    veh_insure_exp_date: string | null;
    veh_permit_exp_date: string | null;
    veh_rc_exp_date: string | null;
    veh_fc_exp_date: string | null;
    fleet_managers: string;
    driver_name: string;
    driver_mobile: string | null;
    driving_license: string | null;
    dl_exp_date: string | null;
}

export interface fleetManagerInfo {
    user_id: number;
    first_name: string;
    last_name: string;
    login_id: string;
    mobile: string;
    email_id: string;
    count: number;
}

export interface subscriptionInfo {
    regno: string;
    vin: string;
    obu_id: string;
    model: string;
    vehicle_type: string;
    group_name: string | null;
    valid_from: string;
    valid_to: string;
    sub_expire_in_days: number;
    veh_insure_exp_date: string | null;
    dl_exp_date: string | null;
    days_to_expire: number;
    status: string;
    days_for_expiry: number;
}


export const DDMMYYYY = 'DD-MM-YYYY'