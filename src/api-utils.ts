export function checkError(response: Response, responseData: any): void {
  if (!responseData) {
    throw new Error("response error: invalid or empty object received");
  } else if (responseData.error_code !== 0) {
    throw new ResponseError(response, responseData);
  }
}
export class ResponseError extends Error {
  errorCode: number;
  response: Response;
  constructor(response: Response, responseData: any) {
    super(
      `response error: code=${responseData.error_code}, status="${
        response.statusText
      }", message=${JSON.stringify(responseData.msg || responseData)}`
    );
    this.errorCode = +responseData.error_code;
    this.response = response;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ResponseError.prototype);
  }
  isTokenExpired(): boolean {
    return this.errorCode === -20651;
  }
}
