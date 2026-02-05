import { HttpInterceptorFn } from '@angular/common/http';

/** Envoie les cookies de session (withCredentials) pour toutes les requêtes API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({ withCredentials: true });
  return next(apiReq);
};
