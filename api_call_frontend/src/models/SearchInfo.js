export default class SearchInfo {
  static requestMethod = "GET";

  constructor(baseUrl, params, headers) {
    this.baseUrl = baseUrl;
    this.params = params;
    this.headers = headers;
    this.createUrl(this.createQueryParams(params));
  }

  createQueryParams(params) {
    return new URLSearchParams(params).toString();
  }

  createUrl(queryParams) {
    this.url =
      this.baseUrl + (this.baseUrl.endsWith("?") ? "" : "?") + queryParams;
  }

  updateUrl(newParams) {
    // Merge existing parameters with the new ones (will overwrite with new value if the key(s) already exist(s))
    const newQueryParams = { ...this.params, ...newParams };
    this.createUrl(this.createQueryParams(newQueryParams));
  }
}
