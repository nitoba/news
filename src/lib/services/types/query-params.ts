export interface PaginationParams {
	page?: number
	pageSize?: number
}

export interface SortParams {
	orderBy?: string
	orderDirection?: 'asc' | 'desc'
}

export interface QueryParams extends PaginationParams, SortParams {
	search?: string
}
