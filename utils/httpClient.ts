import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
  CreateAxiosDefaults,
} from 'axios'

// 扩展Axios请求配置类型
declare module 'axios' {
  interface InternalAxiosRequestConfig<D = any> {
    showLoading?: boolean
    handleError?: boolean
  }
}

// 通用响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 调整RequestOptions类型
export interface RequestOptions
  extends Omit<InternalAxiosRequestConfig, 'headers'> {
  headers?: AxiosRequestHeaders | Record<string, string | number | boolean>
}

class HttpClient {
  private instance: AxiosInstance

  constructor(baseURL?: string) {
    // 创建默认配置，使用普通对象作为headers
    const defaultConfig: CreateAxiosDefaults = {
      baseURL: baseURL || import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    this.instance = axios.create(defaultConfig)
    this.initInterceptors()
  }

  // 初始化拦截器
  private initInterceptors() {
    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        if (response.config.showLoading) {
          console.log('请求完成')
        }

        const { message } = response.data
        if (response.status !== 200) {
          console.error('请求错误:', message)
          if (response.config.handleError) {
            return Promise.reject(response.data.message)
          }
        }

        return response.data
      },
      (error: AxiosError) => {
        if (error.config?.showLoading) {
          console.log('请求完成')
        }

        if (error.response) {
          console.error(
            `HTTP错误: ${error.response.status}`,
            error.response.data
          )
        } else if (error.request) {
          console.error('无响应', error.request)
        } else {
          console.error('请求错误', error.message)
        }

        if (error.config?.handleError === false) {
          return Promise.reject(error)
        }

        return Promise.reject(error)
      }
    )
  }

  // 通用请求方法
  public request<T = any>(options: RequestOptions): Promise<T> {
    return this.instance.request<T, T>(options)
  }

  // GET请求
  public get<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Omit<RequestOptions, 'method' | 'url' | 'params'>
  ): Promise<T> {
    return this.request<T>({
      method: 'get',
      url,
      params,
      ...options,
    })
  }

  // POST请求
  public post<T = any>(
    url: string,
    data?: Record<string, any>,
    options?: Omit<RequestOptions, 'method' | 'url' | 'data'>
  ): Promise<T> {
    return this.request<T>({
      method: 'post',
      url,
      data,
      ...options,
    })
  }

  // PUT请求
  public put<T = any>(
    url: string,
    data?: Record<string, any>,
    options?: Omit<RequestOptions, 'method' | 'url' | 'data'>
  ): Promise<T> {
    return this.request<T>({
      method: 'put',
      url,
      data,
      ...options,
    })
  }

  // DELETE请求
  public delete<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Omit<RequestOptions, 'method' | 'url' | 'params'>
  ): Promise<T> {
    return this.request<T>({
      method: 'delete',
      url,
      params,
      ...options,
    })
  }
}

export const httpClient = new HttpClient()
export default HttpClient
