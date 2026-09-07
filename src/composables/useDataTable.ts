import { ref, computed } from 'vue'

export interface DataTableOptions<T> {
  fetchFn: (search: string, page: number, limit: number, sort: string) => Promise<{ data: T[]; total: number; page?: number } | T[]>;
  itemsPerPage?: number;
  defaultSort?: string;
  cacheData?: { data: T[]; total: number; hasCached: boolean };
  setCache?: (data: T[], total: number) => void;
}

export function useDataTable<T>(options: DataTableOptions<T>) {
  const items = ref<T[]>([]) as import('vue').Ref<T[]>
  const searchQuery = ref<string>('')
  const sortBy = ref<string>(options.defaultSort || 'id_desc')
  
  const currentPage = ref<number>(1)
  const itemsPerPage = options.itemsPerPage || 50
  const totalItems = ref<number>(0)
  
  const totalPages = computed<number>(() => Math.ceil(totalItems.value / itemsPerPage) || 1)

  const isLoading = ref<boolean>(false)
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const loadData = async (page: number = 1) => {
    isLoading.value = true

    // Cache retrieval
    if (page === 1 && searchQuery.value === '' && options.cacheData?.hasCached) {
      items.value = options.cacheData.data
      totalItems.value = options.cacheData.total
      currentPage.value = 1
      isLoading.value = false
      return
    }

    try {
      const result = await options.fetchFn(searchQuery.value, page, itemsPerPage, sortBy.value)
      
      // Some APIs return directly array without pagination if it's not paginated.
      if (Array.isArray(result)) {
        items.value = result
        totalItems.value = result.length
        currentPage.value = 1
      } else {
        items.value = result.data || []
        totalItems.value = result.total || 0
        currentPage.value = result.page || 1
      }

      // Save to cache
      if (page === 1 && searchQuery.value === '' && options.setCache) {
        options.setCache(items.value, totalItems.value)
      }
    } catch (error) {
      console.error('Failed to load data in data table:', error)
    } finally {
      isLoading.value = false
    }
  }

  const debounceSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      loadData(1)
    }, 300)
  }

  return {
    items,
    searchQuery,
    sortBy,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    isLoading,
    loadData,
    debounceSearch
  }
}
